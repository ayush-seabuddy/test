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
import { updateprofile, viewProfile } from '@/src/apis/apiService';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import CustomDateTimePicker from '@/src/components/Modals/CustomDateTimePicker';
import { RootState } from '@/src/redux/store';
import { Edit, Trash2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

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

interface TouchedFields {
    jobTitle: boolean;
    company: boolean;
    startDate: boolean;
    endDate: boolean;
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

    const [errors, setErrors] = useState<Errors>({
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
    });

    // Track which fields have been touched for real-time validation
    const [touched, setTouched] = useState<TouchedFields>({
        jobTitle: false,
        company: false,
        startDate: false,
        endDate: false,
    });

    const formatDate = (dateInput: Date | null | { nativeEvent?: { timestamp: number } }): string => {
        if (!dateInput) return '';

        let actualDate: Date;

        if (dateInput instanceof Date) {
            actualDate = dateInput;
        }
        else if (dateInput && 'nativeEvent' in dateInput && dateInput.nativeEvent?.timestamp) {
            const timestamp = dateInput.nativeEvent.timestamp;
            actualDate = new Date(timestamp);
        }
        else {
            return '';
        }

        return actualDate.toLocaleDateString('en-GB');
    };

    const parseDDMMYYYY = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('/').map(Number);
        if (!day || !month || !year) return null;
        return new Date(year, month - 1, day);
    };

    // Real-time validation for job title
    const handleJobTitleChange = (text: string) => {
        setJobTitle(text);

        // Real-time validation
        if (touched.jobTitle) {
            if (!text.trim()) {
                setErrors((prev) => ({ ...prev, jobTitle: t('jobTitleRequired') }));
            } else {
                setErrors((prev) => ({ ...prev, jobTitle: '' }));
            }
        }
    };

    // Real-time validation for company
    const handleCompanyChange = (text: string) => {
        setCompany(text);

        // Real-time validation
        if (touched.company) {
            if (!text.trim()) {
                setErrors((prev) => ({ ...prev, company: t('companyRequired') }));
            } else {
                setErrors((prev) => ({ ...prev, company: '' }));
            }
        }
    };

    const handleStartDateConfirm = (date: Date) => {
        setShowStartDatePicker(false);
        if (date) {
            setStartDate(date);
            setTouched((prev) => ({ ...prev, startDate: true }));

            // Clear start date error
            setErrors((prev) => ({ ...prev, startDate: '' }));

            // Validate against end date if it exists
            if (endDate && date > endDate) {
                setErrors((prev) => ({
                    ...prev,
                    startDate: t('startAfterEnd'),
                    endDate: t('endBeforeStart')
                }));
            } else if (endDate) {
                setErrors((prev) => ({ ...prev, endDate: '' }));
            }
        }
    };

    const handleEndDateConfirm = (date: Date) => {
        setShowEndDatePicker(false);
        if (date) {
            setEndDate(date);
            setTouched((prev) => ({ ...prev, endDate: true }));

            // Clear end date error
            setErrors((prev) => ({ ...prev, endDate: '' }));

            // Validate against start date if it exists
            if (startDate && startDate > date) {
                setErrors((prev) => ({
                    ...prev,
                    startDate: t('startAfterEnd'),
                    endDate: t('endBeforeStart')
                }));
            } else if (startDate) {
                setErrors((prev) => ({ ...prev, startDate: '' }));
            }
        }
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

        // Mark all fields as touched
        setTouched({
            jobTitle: true,
            company: true,
            startDate: true,
            endDate: true,
        });

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
        setErrors({
            jobTitle: '',
            company: '',
            startDate: '',
            endDate: '',
        });
        setTouched({
            jobTitle: false,
            company: false,
            startDate: false,
            endDate: false,
        });
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
                await fetchProfileDetails();
                showToast.success(t('success'), t('workingexperienceaddedsuccessfully'))
            }
        } catch (error: any) {
            console.error('Update error:', error.response?.data || error.message);
            showToast.error(t('somethingWentWrong'));
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
            <View style={styles.screenContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        label={t('jobtitle')}
                        value={jobTitle}
                        onChangeText={handleJobTitleChange}
                        onBlur={() => {
                            setTouched((prev) => ({ ...prev, jobTitle: true }));
                            if (!jobTitle.trim()) {
                                setErrors((prev) => ({ ...prev, jobTitle: t('jobTitleRequired') }));
                            }
                        }}
                        mode="outlined"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textColor="#000"
                        style={styles.input}
                        error={touched.jobTitle && !!errors.jobTitle}
                        theme={{
                            colors: {
                                primary: '#000',
                                outline: touched.jobTitle && errors.jobTitle ? 'red' : '#000',
                                placeholder: '#666',
                                background: '#fff',
                            },
                        }}
                    />
                    {touched.jobTitle && errors.jobTitle ? (
                        <Text style={styles.error}>{errors.jobTitle}</Text>
                    ) : null}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        label={t('companyname')}
                        value={company}
                        onChangeText={handleCompanyChange}
                        onBlur={() => {
                            setTouched((prev) => ({ ...prev, company: true }));
                            if (!company.trim()) {
                                setErrors((prev) => ({ ...prev, company: t('companyRequired') }));
                            }
                        }}
                        mode="outlined"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textColor="#000"
                        style={styles.input}
                        error={touched.company && !!errors.company}
                        theme={{
                            colors: {
                                primary: '#000',
                                outline: touched.company && errors.company ? 'red' : '#000',
                                placeholder: '#666',
                                background: '#fff',
                            },
                        }}
                    />
                    {touched.company && errors.company ? (
                        <Text style={styles.error}>{errors.company}</Text>
                    ) : null}
                </View>

                <View style={styles.inputContainer}>
                    <Pressable onPress={() => setShowStartDatePicker(true)}>
                        <TextInput
                            label={t('startdate')}
                            value={formatDate(startDate)}
                            mode="outlined"
                            editable={false}
                            pointerEvents="none"
                            textColor="#000"
                            style={styles.input}
                            error={touched.startDate && !!errors.startDate}
                            theme={{
                                colors: {
                                    primary: '#000',
                                    outline: touched.startDate && errors.startDate ? 'red' : '#000',
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
                    {touched.startDate && errors.startDate ? (
                        <Text style={styles.error}>{errors.startDate}</Text>
                    ) : null}
                </View>

                <View style={styles.inputContainer}>
                    <Pressable onPress={() => setShowEndDatePicker(true)}>
                        <TextInput
                            label={t('enddate')}
                            value={formatDate(endDate)}
                            mode="outlined"
                            editable={false}
                            pointerEvents="none"
                            textColor="#000"
                            style={styles.input}
                            error={touched.endDate && !!errors.endDate}
                            theme={{
                                colors: {
                                    primary: '#000',
                                    outline: touched.endDate && errors.endDate ? 'red' : '#000',
                                    placeholder: '#666',
                                    background: '#fff',
                                },
                            }}
                        />
                    </Pressable>
                    {touched.endDate && errors.endDate ? (
                        <Text style={styles.error}>{errors.endDate}</Text>
                    ) : null}
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
                </View>

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
                            <View style={styles.flex1}>
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
                                        setStartDate(parseDDMMYYYY(item.from));
                                        setEndDate(parseDDMMYYYY(item.to));
                                        setIsUpdate(true);
                                        setTouched({
                                            jobTitle: false,
                                            company: false,
                                            startDate: false,
                                            endDate: false,
                                        });
                                        setErrors({
                                            jobTitle: '',
                                            company: '',
                                            startDate: '',
                                            endDate: '',
                                        });
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
                            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                                <Text style={styles.deleteText}>{t('yes')}</Text>
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
        marginLeft: 4,
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
        fontSize: 16,
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
    screenContainer: {
        flex: 1,
        padding: 14,
    },
    inputContainer: {
        marginBottom: 16,
    },
    flex1: {
        flex: 1,
    },
});

export default WorkExperienceScreen;