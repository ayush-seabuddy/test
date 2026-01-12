import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    TextInput,
    Platform,
} from 'react-native';
import { updateprofile, viewProfile } from '@/src/apis/apiService';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import CustomDateTimePicker from '@/src/components/Modals/CustomDateTimePicker';
import { RootState } from '@/src/redux/store';
import { Edit, Trash2, Briefcase, Building, Calendar } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CommonLoader from '@/src/components/CommonLoader';
import { updateUserField } from '@/src/redux/userDetailsSlice';

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

    // Format date for display
    const formatDateForDisplay = (date: Date | null): string => {
        if (!date) return '';
        try {
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    // Format date for API (DD/MM/YYYY)
    const formatDateForAPI = (date: Date | null): string => {
        if (!date) return '';
        try {
            return date.toLocaleDateString('en-GB');
        } catch (error) {
            console.error('Error formatting date for API:', error);
            return '';
        }
    };

    const parseDDMMYYYY = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('/').map(Number);
        if (!day || !month || !year) return null;
        const parsedDate = new Date(year, month - 1, day);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    // FIXED: Handle date picker event object
    const handleStartDateConfirm = (event: any) => {
        console.log('Start date event:', event); // Debug log

        try {
            if (event && event.nativeEvent && event.nativeEvent.timestamp) {
                const timestamp = event.nativeEvent.timestamp;
                const selectedDate = new Date(timestamp);

                console.log('Parsed start date:', selectedDate);

                if (!isNaN(selectedDate.getTime())) {
                    setStartDate(selectedDate);

                    // Validate against end date
                    if (endDate && selectedDate > endDate) {
                        showToast.error(t('oops'), t('startAfterEnd'));
                    }
                } else {
                    console.error('Invalid start date timestamp:', timestamp);
                }
            } else {
                console.error('Invalid start date event structure:', event);
            }
        } catch (error) {
            console.error('Error handling start date:', error);
        }

        setShowStartDatePicker(false);
    };

    // FIXED: Handle date picker event object
    const handleEndDateConfirm = (event: any) => {
        console.log('End date event:', event); // Debug log

        try {
            if (event && event.nativeEvent && event.nativeEvent.timestamp) {
                const timestamp = event.nativeEvent.timestamp;
                const selectedDate = new Date(timestamp);

                console.log('Parsed end date:', selectedDate);

                if (!isNaN(selectedDate.getTime())) {
                    setEndDate(selectedDate);

                    // Validate against start date
                    if (startDate && startDate > selectedDate) {
                        showToast.error(t('oops'), t('endBeforeStart'));
                    }
                } else {
                    console.error('Invalid end date timestamp:', timestamp);
                }
            } else {
                console.error('Invalid end date event structure:', event);
            }
        } catch (error) {
            console.error('Error handling end date:', error);
        }

        setShowEndDatePicker(false);
    };

    // Handle date picker close
    const handleStartDateClose = () => {
        setShowStartDatePicker(false);
    };

    const handleEndDateClose = () => {
        setShowEndDatePicker(false);
    };

    const validateInputs = (): boolean => {
        if (!jobTitle.trim()) {
            showToast.error(t('oops'), t('jobTitleRequired'));
            return false;
        }
        if (!company.trim()) {
            showToast.error(t('oops'), t('companyRequired'));
            return false;
        }
        if (!startDate) {
            showToast.error(t('oops'), t('startDateRequired'));
            return false;
        }
        if (!endDate) {
            showToast.error(t('oops'), t('endDateRequired'));
            return false;
        }
        if (startDate && endDate && startDate > endDate) {
            showToast.error(t('oops'), t('startAfterEnd'));
            return false;
        }
        return true;
    };

    const addExperience = async () => {
        if (!validateInputs()) return;

        const payload: Partial<WorkExperience> = {
            companyName: company,
            role: jobTitle,
            from: formatDateForAPI(startDate),
            to: formatDateForAPI(endDate),
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

            if (response.status === 200) {
                const fetchProfileDetails = async () => {
                    let result = await viewProfile();
                    if (result?.data) {
                        const object = result.data
                        for (const property in object) {
                            dispatch(updateUserField({ key: property, value: object[property] }))
                        }
                    }
                }
                await fetchProfileDetails();
                showToast.success(t('success'), t('workingexperienceaddedsuccessfully'))
            }
        } catch (error: any) {
            console.error('Update error:', error.response?.data || error.message);
            showToast.error(t('error'), t('somethingwentwrong'));
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

            if (response.status === 200) {
                await fetchProfileDetails();
                showToast.success(t('success'), t('workingexperiencedeleted'));
            }
        } catch (error: any) {
            console.error('Delete error:', error.response?.data || error.message);
            showToast.error(t('error'), t('somethingwentwrong'));
        } finally {
            setLoading(false);
            setModalVisible(false);
            setDeleteId('');
        }
    };

    return (
        <View style={styles.main}>
            <GlobalHeader title={t('shipboard_experience')} />
            <KeyboardAwareScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid
                extraScrollHeight={Platform.OS === 'ios' ? 20 : 80}
                showsVerticalScrollIndicator={false}
            >
                {/* Job Title Input */}
                <View style={styles.inputContainer}>
                    <Briefcase size={20} color="#666" style={styles.icon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder={t('jobtitle')}
                        placeholderTextColor="#B7B7B7"
                        value={jobTitle}
                        onChangeText={setJobTitle}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                {/* Company Input */}
                <View style={styles.inputContainer}>
                    <Building size={20} color="#666" style={styles.icon} />
                    <TextInput
                        style={styles.textInput}
                        placeholder={t('companyname')}
                        placeholderTextColor="#B7B7B7"
                        value={company}
                        onChangeText={setCompany}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                {/* Start Date */}
                <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setShowStartDatePicker(true)}
                >
                    <Calendar size={20} color="#666" style={styles.icon} />
                    {startDate ? (
                        <Text style={styles.dateText}>{formatDateForDisplay(startDate)}</Text>
                    ) : (
                        <Text style={styles.datePlaceholder}>{t('startdate')}</Text>
                    )}
                </TouchableOpacity>

                {/* Start Date Picker */}
                <CustomDateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    onChange={handleStartDateConfirm}
                    onClose={handleStartDateClose}
                    isVisible={showStartDatePicker}
                    cancelText={t('cancel') || "Cancel"}
                    confirmText={t('done') || "Done"}
                    containerStyle={{ backgroundColor: "#fff" }}
                    buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
                    maximumDate={new Date()}
                />

                {/* End Date */}
                <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setShowEndDatePicker(true)}
                >
                    <Calendar size={20} color="#666" style={styles.icon} />
                    {endDate ? (
                        <Text style={styles.dateText}>{formatDateForDisplay(endDate)}</Text>
                    ) : (
                        <Text style={styles.datePlaceholder}>{t('enddate')}</Text>
                    )}
                </TouchableOpacity>

                {/* End Date Picker */}
                <CustomDateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    onChange={handleEndDateConfirm}
                    onClose={handleEndDateClose}
                    isVisible={showEndDatePicker}
                    cancelText={t('cancel') || "Cancel"}
                    confirmText={t('done') || "Done"}
                    containerStyle={{ backgroundColor: "#fff" }}
                    buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
                    maximumDate={new Date()}
                />

                {/* Add/Update Button */}
                <TouchableOpacity
                    onPress={addExperience}
                    style={styles.updateButton}
                    disabled={loading}
                >
                    {loading ? (
                        <CommonLoader color="#fff" />
                    ) : (
                        <Text style={styles.updateButtonText}>
                            {isUpdate ? t('editexperience') : t('addexperience')}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Experiences List */}
                <FlatList
                    data={experiences}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.experienceCard}>
                            <View style={styles.experienceContent}>
                                <Text style={styles.companyName}>{item.role}</Text>
                                <Text style={styles.role}>{item.companyName}</Text>
                                <Text style={styles.duration}>{item.from} - {item.to}</Text>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setEditId(item.id);
                                        setCompany(item.companyName);
                                        setJobTitle(item.role);
                                        setStartDate(parseDDMMYYYY(item.from));
                                        setEndDate(parseDDMMYYYY(item.to));
                                        setIsUpdate(true);
                                    }}
                                    style={styles.actionButton}
                                >
                                    <Edit size={20} color="#000" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setDeleteId(item.id);
                                        setModalVisible(true);
                                    }}
                                    style={styles.actionButton}
                                >
                                    <Trash2 size={20} color="red" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </KeyboardAwareScrollView>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeaderText}>{t('deletexperience')}</Text>
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
                            <TouchableOpacity
                                onPress={handleDelete}
                                style={styles.deleteButton}
                                disabled={loading}
                            >
                                {loading ? (
                                    <CommonLoader color="#fff" />
                                ) : (
                                    <Text style={styles.deleteText}>{t('yes')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#ededed',
    },
    container: {
        padding: 20,
        paddingBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        height: 50,
        backgroundColor: '#fff',
    },
    icon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#454545',
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        color: '#454545',
        paddingLeft: 5,
        paddingVertical: Platform.OS === 'ios' ? 0 : 2,
    },
    datePlaceholder: {
        flex: 1,
        fontSize: 16,
        color: '#B7B7B7',
        paddingLeft: 5,
        paddingVertical: Platform.OS === 'ios' ? 0 : 2,
    },
    updateButton: {
        backgroundColor: '#000',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        lineHeight: 22,
    },
    experienceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 10,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    experienceContent: {
        flex: 1,
    },
    companyName: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    role: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    duration: {
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 8,
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
    modalHeaderText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#000',
    },
    modalText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginBottom: 18,
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
        fontSize: 13,
    },
    deleteText: {
        color: '#fff',
        fontFamily: 'Poppins-Medium',
        fontSize: 13,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});

export default WorkExperienceScreen;