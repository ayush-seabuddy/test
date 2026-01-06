// screens/CertificationsScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    FlatList,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';

import { updateprofile, viewProfile } from '@/src/apis/apiService';
import GlobalHeader from '@/src/components/GlobalHeader';
import CustomDateTimePicker from '@/src/components/Modals/CustomDateTimePicker';
import { RootState } from '@/src/redux/store';
import CustomLottie from '@/src/components/CustomLottie';

const { height, width } = Dimensions.get('screen');

interface Certification {
  id: string;
  role: string;           // certificate name
  companyName: string;    // organization name
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

const CertificationsScreen = () => {
  const { t } = useTranslation();

  const [jobTitle, setJobTitle] = useState<string>(''); // certificate name
  const [company, setCompany] = useState<string>('');   // organization name
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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

  const userDetails = useSelector((state: RootState) => state.userDetails);
  const [certifications, setCertifications] = useState<Certification[]>(userDetails.certifications || []);

  const fetchProfileDetails = async () => {
    const result = await viewProfile();
    if (result?.data) {
      setCertifications(result.data.certifications || []);
      console.log("result.data.certifications: ", result.data.certifications);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const formatDate = (dateInput: Date | null | { nativeEvent?: { timestamp: number } }): string => {
    if (!dateInput) return '';

    let actualDate: Date;

    if (dateInput instanceof Date) {
      actualDate = dateInput;
    } else if (dateInput && 'nativeEvent' in dateInput && dateInput.nativeEvent?.timestamp) {
      actualDate = new Date(dateInput.nativeEvent.timestamp);
    } else {
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
    setShowStartDatePicker(false);
    if (date) setStartDate(date);
  };

  const handleEndDateConfirm = (date: Date) => {
    setShowEndDatePicker(false);
    if (date) setEndDate(date);
  };

  const validateInputs = (): boolean => {
    const newErrors: Errors = {
      jobTitle: jobTitle.trim() ? '' : t('certificate_required'),
      company: company.trim() ? '' : t('organization_required'),
      startDate: startDate ? '' : t('start_date_required'),
      endDate: endDate ? '' : t('end_date_required'),
    };

    if (startDate && endDate && startDate > endDate) {
      newErrors.startDate = t('start_date_invalid');
      newErrors.endDate = t('end_date_invalid');
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => !err);
  };

  const addCertification = async () => {
    if (!validateInputs()) return;

    const payload: Partial<Certification> = {
      companyName: company,
      role: jobTitle,
      from: formatDate(startDate),
      to: formatDate(endDate),
    };

    if (isUpdate && editId) {
      payload.id = editId;
    }

    await updateCertification(payload);

    // Reset form
    setJobTitle('');
    setCompany('');
    setStartDate(null);
    setEndDate(null);
    setIsUpdate(false);
    setEditId('');
  };

  const updateCertification = async (cert: Partial<Certification>) => {
    try {
      setLoading(true);

      const dbResult = await AsyncStorage.getItem('userDetails');
      if (!dbResult) throw new Error('No user details found');

      const user: UserDetails = JSON.parse(dbResult);

      const updatedCerts = isUpdate
        ? certifications.map((c) => (c.id === editId ? { ...c, ...cert } : c))
        : [...certifications, { ...cert, id: Date.now().toString() } as Certification];

      const body = {
        userId: user.id,
        certifications: updatedCerts,
      };

      const response = await updateprofile(body);

      if (response.status === 200) {
        await fetchProfileDetails();
        Toast.show({
          type: 'success',
          text1: isUpdate ? t('certificateupdated') : t('certificateaddedsuccessfully'),
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
        certifications: [{ id: deleteId, status: 'DELETE' }],
      });

      if (response.status === 200) {
        await fetchProfileDetails();
        Toast.show({ type: 'success', text1: t('certificatedeletedsuccessfully') });
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
      <GlobalHeader title={t('certifications')} />

      <View style={{ flex: 1, padding: 14 }}>
        <View style={{ marginBottom: 12 }}>
          <TextInput
            label={t('certificateName')}
            value={jobTitle}
            onChangeText={handleJobTitleChange}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            textColor="#000"
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
            label={t('organizationName')}
            value={company}
            onChangeText={handleCompanyChange}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            textColor="#000"
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
            textColor="#000"
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
        {errors.startDate && <Text style={styles.error}>{errors.startDate}</Text>}

        {showStartDatePicker && (
          <CustomDateTimePicker
            value={new Date()}
            mode="date"
            onChange={handleStartDateConfirm}
            isVisible={showStartDatePicker}
            onClose={() => setShowStartDatePicker(false)}
            cancelText="Cancel"
            confirmText="Done"
            containerStyle={{ backgroundColor: '#fff' }}
            buttonTextStyle={{ fontSize: 18, color: '#84A402' }}
            maximumDate={new Date()}
          />
        )}

        <Pressable onPress={() => setShowEndDatePicker(true)}>
          <TextInput
            label={t('enddate')}
            value={formatDate(endDate)}
            mode="outlined"
            editable={false}
            pointerEvents="none"
            textColor="#000"
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
            containerStyle={{ backgroundColor: '#fff' }}
            buttonTextStyle={{ fontSize: 18, color: '#84A402' }}
            maximumDate={new Date()}
          />
        )}

        <TouchableOpacity onPress={addCertification} style={styles.addButton}>
          <Text style={styles.addButtonText}>
            {isUpdate ? t('editCertificate') : t('addCertificate')}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={certifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.experienceCard}>
              <View style={{ flex: 1 }}>
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
            <Text style={styles.modalText}>{t('deletecertificateconfirmation')}</Text>
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

      <View style={styles.background}>
        <CustomLottie isBlurView={Platform.OS === 'ios' ? true : false} />
      </View>
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
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
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
    height: height * 0.45,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden',
    zIndex: -1,
  },
});

export default CertificationsScreen;