// screens/WorkExperienceScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
// // import api from '../CustomAxios';
// import Loader from '../component/Loader';
// import CustomLottie from '../component/CustomLottie';
// import CustomDateTimePicker from '../component/Modals/CustomDateTimePicker';
// import ProfileSettingHeader from '../component/headers/ProfileHeader/ProfleSettingHeader';

// Lucide Icons
import { updateprofile, viewProfile } from '@/src/apis/apiService';
import GlobalHeader from '@/src/components/GlobalHeader';
import CustomDateTimePicker from '@/src/components/Modals/CustomDateTimePicker';
import { RootState } from '@/src/redux/store';
import { router } from 'expo-router';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

// Types
interface WorkExperience {
    id: string;
    companyName: string;
    role: string;
    from: string;
    to: string;
}

interface UserDetails {
    id: string;
    authToken: string;
}

interface Errors {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
}

const { height, width } = Dimensions.get('screen');

const WorkExperienceScreen = ({ navigation }: { navigation: any }) => {
    const { t } = useTranslation();

    const [jobTitle, setJobTitle] = useState<string>('');
    const [company, setCompany] = useState<string>('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const userDetails = useSelector((state: RootState) => state.userDetails);
    const dispatch = useDispatch();
    const [experiences, setExperiences] = useState<WorkExperience[]>(userDetails.workingExperience || []);
    const fetchProfileDetails = async () => {
        const result = await viewProfile();
        if (result?.data) {
            setExperiences(result.data.workingExperience || []);
            console.log("result.data.workingExperience: ", result.data.workingExperience);
        }
    };
    useEffect(() => {

        fetchProfileDetails();
    }, []);
    const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<string>('');
    const [editId, setEditId] = useState<string>('');
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const [errors, setErrors] = useState<Errors>({
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
    });

    const formatDate = (dateInput: Date | null | { nativeEvent?: { timestamp: number } }): string => {
        if (!dateInput) return '';

        let actualDate: Date;

        // If it's a Date object (from previous state)
        if (dateInput instanceof Date) {
            actualDate = dateInput;
        }
        // If it's the picker event object
        else if (dateInput && 'nativeEvent' in dateInput && dateInput.nativeEvent?.timestamp) {
            const timestamp = dateInput.nativeEvent.timestamp;
            actualDate = new Date(timestamp);
        }
        // Fallback: invalid input
        else {
            return '';
        }

        return actualDate.toLocaleDateString('en-GB'); // dd/mm/yyyy
    };

    const handleJobTitleChange = (text: string) => {
        setJobTitle(text);
        if (text.trim()) setErrors((prev) => ({ ...prev, jobTitle: '' }));
    };

    const handleCompanyChange = (text: string) => {
        setCompany(text);
        if (text.trim()) setErrors((prev) => ({ ...prev, company: '' }));
    };

    const handleStartDateConfirm = (date: Date) => {
        console.log("date: ", date);
        setShowStartDatePicker(false);
        if (date) setStartDate(date);
    };

    const handleEndDateConfirm = (date: Date) => {
        setShowEndDatePicker(false);
        if (date) setEndDate(date);
    };

    const validateInputs = (): boolean => {
        const newErrors: Errors = {
            jobTitle: jobTitle.trim() ? '' : t('jobTitleRequired'),
            company: company.trim() ? '' : t('companyRequired'),
            startDate: startDate ? '' : t('startDateRequired'),
            endDate: endDate ? '' : t('endDateRequired'),
        };

        if (startDate && endDate && startDate > endDate) {
            newErrors.startDate = t('startAfterEnd');
            newErrors.endDate = t('endBeforeStart');
        }

        setErrors(newErrors);
        return Object.values(newErrors).every((err) => !err);
    };

    const addExperience = async () => {
        if (!validateInputs()) return;

        const payload: Partial<WorkExperience> = {
            companyName: company,
            role: jobTitle,
            from: formatDate(startDate),
            to: formatDate(endDate),
        };

        if (isUpdate && editId) {
            payload.id = editId;
        }

        await updateWorkExperience(payload);

        // Reset form
        setJobTitle('');
        setCompany('');
        setStartDate(null);
        setEndDate(null);
        setIsUpdate(false);
        setEditId('');
    };

    const updateWorkExperience = async (experience: Partial<WorkExperience>) => {
        try {
            setLoading(true);

            const dbResult = await AsyncStorage.getItem('userDetails');
            if (!dbResult) throw new Error('No user details found');

            const user: UserDetails = JSON.parse(dbResult);

            const updatedExperiences = isUpdate
                ? experiences.map((exp) =>
                    exp.id === editId ? { ...exp, ...experience } : exp
                )
                : [...experiences, { ...experience, id: Date.now().toString() } as WorkExperience];

            const body = {
                userId: user.id,
                workingExperience: updatedExperiences,
            };

            const response = await updateprofile(body);

            console.log('Update response:', response.data);

            if (response.status === 200) {
                await fetchProfileDetails();
                Toast.show({
                    type: 'success',
                    text1: isUpdate ? t('workingexperienceupdated') : t('workingexperienceaddedsuccessfully'),
                });
            }
        } catch (error: any) {
            console.error('Update error:', error.response?.data || error.message);
            Toast.show({ type: 'error', text1: t('somethingWentWrong') });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);

            const dbResult = await AsyncStorage.getItem('userDetails');
            if (!dbResult) throw new Error('No user details found');

            const user: UserDetails = JSON.parse(dbResult);

            const response = await updateprofile({
                userId: user.id,
                workingExperience: [{ id: deleteId, status: 'DELETE' }],
            })

            console.log('Delete response:', response.data);

            if (response.status === 200) {
                await fetchProfileDetails();
                Toast.show({ type: 'success', text1: t('workingexperiencedeleted') });
            }
        } catch (error: any) {
            console.error('Delete error:', error.response?.data || error.message);
            Toast.show({ type: 'error', text1: t('somethingWentWrong') });
        } finally {
            setLoading(false);
            setModalVisible(false);
            setDeleteId('');
        }
    };



    return (
        <>
            <GlobalHeader title={t('shipboard_experience')} onLeftPress={() => router.back()} leftIcon={<ChevronLeft />} />


            {/* {loading && <Loader />} */}

            <View style={{ flex: 1, padding: 14 }}>
                <View style={{ marginBottom: 12 }}>
                    <TextInput
                        label={t('jobtitle')}
                        value={jobTitle}
                        onChangeText={handleJobTitleChange}
                        mode="outlined"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textColor="#000"   // 👈 THIS is required
                        style={styles.input}
                        theme={{
                            colors: {
                                primary: '#000',
                                outline: '#000',
                                placeholder: '#666',
                                background: '#fff',
                            },
                        }}
                    />
                    {errors.jobTitle && <Text style={styles.error}>{errors.jobTitle}</Text>}
                </View>

                <View style={{ marginBottom: 12 }}>
                    <TextInput
                        label={t('companyname')}
                        value={company}
                        onChangeText={handleCompanyChange}
                        mode="outlined"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textColor="#000"   // 👈 THIS is required
                        style={styles.input}
                        theme={{
                            colors: {
                                primary: '#000',
                                outline: '#000',
                                placeholder: '#666',
                                background: '#fff',
                            },
                        }}
                    />
                    {errors.company && <Text style={styles.error}>{errors.company}</Text>}
                </View>

                <Pressable onPress={() => setShowStartDatePicker(true)}>
                    <TextInput
                        label={t('startdate')}
                        value={formatDate(startDate)}
                        mode="outlined"
                        editable={false}
                        pointerEvents="none"
                        textColor="#000"   // 👈 THIS is required
                        style={styles.input}
                        theme={{
                            colors: {
                                primary: '#000',
                                outline: '#000',
                                placeholder: '#666',
                                background: '#fff',
                            },
                        }}
                    />
                </Pressable>
                {showStartDatePicker && (
                    <CustomDateTimePicker
                        value={new Date()}
                        mode="date"
                        onChange={handleStartDateConfirm}
                        isVisible={showStartDatePicker}
                        onClose={() => setShowStartDatePicker(false)}
                        cancelText="Cancel"
                        confirmText="Done"
                        containerStyle={{ backgroundColor: "#fff" }}
                        buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
                        maximumDate={new Date()}
                    />
                )}
                {errors.startDate && <Text style={styles.error}>{errors.startDate}</Text>}

                <Pressable onPress={() => setShowEndDatePicker(true)}>
                    <TextInput
                        label={t('enddate')}
                        value={formatDate(endDate)}
                        mode="outlined"
                        editable={false}
                        pointerEvents="none"
                        textColor="#000"   // 👈 THIS is required
                        style={styles.input}
                        theme={{
                            colors: {
                                primary: '#000',
                                outline: '#000',
                                placeholder: '#666',
                                background: '#fff',
                            },
                        }}
                    />
                </Pressable>
                {errors.endDate && <Text style={styles.error}>{errors.endDate}</Text>}
                {showEndDatePicker && (
                    <CustomDateTimePicker
                        value={new Date()}
                        mode="date"
                        onChange={handleEndDateConfirm}
                        isVisible={showEndDatePicker}
                        onClose={() => setShowEndDatePicker(false)}
                        cancelText="Cancel"
                        confirmText="Done"
                        containerStyle={{ backgroundColor: "#fff" }}
                        buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
                        maximumDate={new Date()}
                    />
                )}

                <TouchableOpacity onPress={addExperience} style={styles.addButton}>
                    <Text style={styles.addButtonText}>
                        {isUpdate ? t('editexperience') : t('addexperience')}
                    </Text>
                </TouchableOpacity>

                <FlatList
                    data={experiences}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.experienceCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.companyName}>{item.companyName}</Text>
                                <Text style={styles.role}>{item.role}</Text>
                                <Text style={styles.duration}>{item.from} - {item.to}</Text>
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setEditId(item.id);
                                        setCompany(item.companyName);
                                        setJobTitle(item.role);
                                        setStartDate(new Date(item.from));
                                        setEndDate(new Date(item.to));
                                        setIsUpdate(true);
                                    }}
                                >
                                    <Edit size={20} color="#000" strokeWidth={2} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setDeleteId(item.id);
                                        setModalVisible(true);
                                    }}
                                >
                                    <Trash2 size={20} color="red" strokeWidth={2} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>

            <Toast />

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{t('deleteexperiencetitle')}</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => {
                                    setDeleteId('');
                                    setModalVisible(false);
                                }}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelText}>{t('no')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                                <Text style={styles.deleteText}>{t('yes')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* <View style={styles.background}>
        <CustomLottie />
      </View> */}
        </>
    );
};

const styles = StyleSheet.create({
    input: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        backgroundColor: '#fff',
    },
    error: {
        color: 'red',
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginTop: 4,
    },
    addButton: {
        borderRadius: 8,
        marginVertical: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    addButtonText: {
        color: '#fff',
        fontFamily: 'WhyteInktrap-Medium',
        fontSize: 18,
    },
    experienceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 10,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    companyName: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        color: '#333',
    },
    role: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        color: '#666',
    },
    duration: {
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.85,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'red',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#000',
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
  deleteText: {
    color: '#fff',
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
    background: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.5,
        backgroundColor: '#c1c1c1',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        overflow: 'hidden',
        zIndex: -1,
    },
});

export default WorkExperienceScreen;