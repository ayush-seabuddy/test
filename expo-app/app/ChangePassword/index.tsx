// screens/ChangePasswordScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import GlobalHeader from '@/src/components/GlobalHeader';
// import Loader from '@/src/components/Loader';
import { changePassword } from '@/src/apis/apiService'; // Assuming you have this for profile updates
import CustomLottie from '@/src/components/CustomLottie';
import { ChevronLeft } from 'lucide-react-native';

const { height } = Dimensions.get('screen');

interface Errors {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordScreen = () => {
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const [errors, setErrors] = useState<Errors>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Real-time validation
  const validateField = (field: keyof Errors, value: string): string => {
    switch (field) {
      case 'currentPassword':
        return value.trim() ? '' : t('current_password_required');
      case 'newPassword':
        if (!value.trim()) return t('new_password_required');
        return value.length >= 6 ? '' : t('password_min_length');
      case 'confirmPassword':
        return value === newPassword ? '' : t('passwords_do_not_match');
      default:
        return '';
    }
  };

  const handleCurrentPasswordChange = (text: string) => {
    setCurrentPassword(text);
    setErrors((prev) => ({
      ...prev,
      currentPassword: validateField('currentPassword', text),
    }));
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    setErrors((prev) => ({
      ...prev,
      newPassword: validateField('newPassword', text),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    }));
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateField('confirmPassword', text),
    }));
  };

  const handleChangePassword = async () => {
    // Final validation
    const finalErrors: Errors = {
      currentPassword: validateField('currentPassword', currentPassword),
      newPassword: validateField('newPassword', newPassword),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };
    setErrors(finalErrors);

    if (Object.values(finalErrors).some((e) => e)) return;

    try {
      setLoading(true);
      const dbResult = await AsyncStorage.getItem('userDetails');
      if (!dbResult) throw new Error('No user details found');

      const userDetails = JSON.parse(dbResult);

      const body = {
        currentPassword,
        newPassword,
      };

      // Assuming updateprofile can handle password change
      // If you have a separate API, replace with that
      const response = await changePassword(body);

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: t('success'),
          text2: t('password_changed_successfully'),
          visibilityTime: 2000,
        });

        // Clear fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setTimeout(() => router.back(), 1000);
      } else {
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: response.data?.responseMessage || t('somethingWentWrong'),
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('error_changing_password'),
        text2: error.response?.data?.responseMessage || error.message,
        visibilityTime: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalHeader
        title={t('change_password')}
         onLeftPress={() => router.back()}
        leftIcon={<ChevronLeft color="#000" size={24} />}
      />

      {/* {loading && <Loader />} */}

      <View style={styles.container}>
        {/* Current Password */}
        <TextInput
          label={t('current_password')}
          value={currentPassword}
          onChangeText={handleCurrentPasswordChange}
          secureTextEntry={!showCurrent}
          mode="outlined"
          autoCapitalize="none"
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
          right={
            <TextInput.Icon
              icon={showCurrent ? 'eye-off' : 'eye'}
              onPress={() => setShowCurrent(!showCurrent)}
              color="#000"
            />
          }
        />
        {errors.currentPassword && (
          <Text style={styles.errorText}>{errors.currentPassword}</Text>
        )}

        {/* New Password */}
        <TextInput
          label={t('new_password')}
          value={newPassword}
          onChangeText={handleNewPasswordChange}
          secureTextEntry={!showNew}
          mode="outlined"
          autoCapitalize="none"
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
          right={
            <TextInput.Icon
              icon={showNew ? 'eye-off' : 'eye'}
              onPress={() => setShowNew(!showNew)}
              color="#000"
            />
          }
        />
        {errors.newPassword && (
          <Text style={styles.errorText}>{errors.newPassword}</Text>
        )}

        {/* Confirm Password */}
        <TextInput
          label={t('confirm_password')}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry={!showConfirm}
          mode="outlined"
          autoCapitalize="none"
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
          right={
            <TextInput.Icon
              icon={showConfirm ? 'eye-off' : 'eye'}
              onPress={() => setShowConfirm(!showConfirm)}
              color="#000"
            />
          }
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}

        {/* Submit Button */}
        <TouchableOpacity onPress={handleChangePassword} style={styles.button}>
          <Text style={styles.buttonText}>{t('change_password')}</Text>
        </TouchableOpacity>
      </View>

      <Toast />

      {/* Background Lottie */}
      <View style={styles.lottieContainer}>
        <CustomLottie  isBlurView={false}/>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  input: {
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  button: {
    borderRadius: 8,
    marginVertical: 20,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'WhyteInktrap-Medium',
    fontSize: 18,
  },
  lottieContainer: {
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

export default ChangePasswordScreen;