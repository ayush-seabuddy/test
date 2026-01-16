import { updateprofile, viewProfile } from '@/src/apis/apiService';
import CommonLoader from '@/src/components/CommonLoader';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import CustomDateTimePicker from '@/src/components/Modals/CustomDateTimePicker';
import { RootState } from '@/src/redux/store';
import { updateUserField } from '@/src/redux/userDetailsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { Briefcase, Building, Calendar } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

const AddExperienceScreen = () => {
    const { t } = useTranslation();
    const params = useLocalSearchParams();

    const isEdit = params.isEdit === 'true';
    const experienceId = params.id as string;
    const initialCompanyName = params.companyName as string;
    const initialRole = params.role as string;
    const initialFrom = params.from as string;
    const initialTo = params.to as string;

    const [jobTitle, setJobTitle] = useState<string>('');
    const [company, setCompany] = useState<string>('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const userDetails = useSelector((state: RootState) => state.userDetails);
    const dispatch = useDispatch();

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

    const formatDateForAPI = (date: Date | null): string => {
        if (!date) return '';
        try {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error('Error formatting date for API:', error);
            return '';
        }
    };

    const parseDDMMYYYY = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        try {
            const [day, month, year] = dateStr.split('/').map(Number);
            if (!day || !month || !year) return null;
            const parsedDate = new Date(year, month - 1, day);
            return isNaN(parsedDate.getTime()) ? null : parsedDate;
        } catch (error) {
            console.error('Error parsing date:', error);
            return null;
        }
    };

    // Initialize form once when component mounts
    useEffect(() => {
        if (isEdit && experienceId) {
            setJobTitle(initialRole || '');
            setCompany(initialCompanyName || '');

            const parsedStartDate = parseDDMMYYYY(initialFrom || '');
            const parsedEndDate = parseDDMMYYYY(initialTo || '');

            if (parsedStartDate) setStartDate(parsedStartDate);
            if (parsedEndDate) setEndDate(parsedEndDate);
        }

    }, []);

    const handleStartDateConfirm = useCallback((event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setStartDate(selectedDate);

            // Validate if end date exists and is before start date
            if (endDate && selectedDate > endDate) {
                showToast.error(t('oops'), t('startAfterEnd'));
            }
        }

        setShowStartDatePicker(false);
    }, [endDate, t]);

    const handleEndDateConfirm = useCallback((event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setEndDate(selectedDate);

            // Validate if start date exists and is after end date
            if (startDate && startDate > selectedDate) {
                showToast.error(t('oops'), t('endBeforeStart'));
            }
        }

        setShowEndDatePicker(false);
    }, [startDate, t]);

    const handleStartDateClose = useCallback(() => {
        setShowStartDatePicker(false);
    }, []);

    const handleEndDateClose = useCallback(() => {
        setShowEndDatePicker(false);
    }, []);

    const validateInputs = useCallback((): boolean => {
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
    }, [jobTitle, company, startDate, endDate, t]);

    const saveExperience = async () => {
        if (!validateInputs()) return;

        try {
            setLoading(true);

            const dbResult = await AsyncStorage.getItem('userDetails');
            if (!dbResult) throw new Error('No user details found');
            const user: UserDetails = JSON.parse(dbResult);

            // Get current experiences from Redux
            const currentExperiences = userDetails.workingExperience || [];
            let updatedExperiences: WorkExperience[];

            const newExperience: Partial<WorkExperience> = {
                companyName: company,
                role: jobTitle,
                from: formatDateForAPI(startDate),
                to: formatDateForAPI(endDate),
            };

            if (isEdit && experienceId) {
                // Update existing experience
                newExperience.id = experienceId;
                updatedExperiences = currentExperiences.map((exp: any) =>
                    exp.id === experienceId ? { ...exp, ...newExperience } as WorkExperience : exp
                );
            } else {
                // Add new experience
                newExperience.id = Date.now().toString();
                updatedExperiences = [...currentExperiences, newExperience as WorkExperience];
            }

            const body = {
                userId: user.id,
                workingExperience: updatedExperiences,
            };

            const response = await updateprofile(body);

            if (response.status === 200) {
                // Update Redux store with fresh data
                const result = await viewProfile();
                if (result?.data) {
                    const object = result.data;
                    for (const property in object) {
                        dispatch(updateUserField({ key: property, value: object[property] }));
                    }
                }
                showToast.success(
                    t('success'),
                    isEdit ? t('workingexperienceupdatedsuccessfully') : t('workingexperienceaddedsuccessfully')
                );
                router.back();
            }
        } catch (error: any) {
            console.error('Save error:', error.response?.data || error.message);
            showToast.error(t('error'), t('somethingwentwrong'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={isEdit ? t('edit_experience') : t('addexperience')}
            />

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

                {/* Save Button */}
                <TouchableOpacity
                    onPress={saveExperience}
                    style={styles.updateButton}
                    disabled={loading}
                >
                    {loading ? (
                        <CommonLoader color="#fff" />
                    ) : (
                        <Text style={styles.updateButtonText}>
                            {isEdit ? t('edit_experience') : t('addexperience')}
                        </Text>
                    )}
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#ededed',
    },
    container: {
        padding: 10,
        paddingVertical: 20,
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
        marginLeft: 3,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#454545',
    },
    dateText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#454545',
        paddingLeft: 5,
        paddingVertical: Platform.OS === 'ios' ? 0 : 2,
    },
    datePlaceholder: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
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
        marginTop: 10,
        marginBottom: 20,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        lineHeight: 22,
    },
});

export default AddExperienceScreen;