import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';

import GlobalHeader from '@/src/components/GlobalHeader';
import { changePassword } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import CommonLoader from '@/src/components/CommonLoader';

const ChangePasswordScreen = () => {
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validateInputs = (): boolean => {
    if (!currentPassword.trim()) {
      showToast.error(t('oops'), t('current_password_required'));
      return false;
    }
    if (!newPassword.trim()) {
      showToast.error(t('oops'), t('new_password_required'));
      return false;
    }
    if (newPassword.length < 6) {
      showToast.error(t('oops'), t('password_min_length'));
      return false;
    }
    if (newPassword !== confirmPassword) {
      showToast.error(t('oops'), t('passwords_do_not_match'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const response = await changePassword({ currentPassword, newPassword });

      if (response?.success && response?.status === 200) {
        showToast.success(t('success'), t('password_change_success'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(router.back, 1000);
      } else {
        showToast.error(t('oops'), response?.message || t('somethingwentwrong'));
      }
    } catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    showPassword: boolean,
    toggleShow: () => void
  ) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#B7B7B7"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity onPress={toggleShow} style={styles.eyeIcon}>
        {showPassword ? (
          <EyeOff size={20} color="#666" />
        ) : (
          <Eye size={20} color="#666" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.main}>
      <GlobalHeader title={t('change_password')} />

      <View style={styles.container}>
        {/* Current Password */}
        {renderPasswordInput(
          currentPassword,
          setCurrentPassword,
          t('current_password'),
          show.current,
          () => setShow((p) => ({ ...p, current: !p.current }))
        )}

        {/* New Password */}
        {renderPasswordInput(
          newPassword,
          setNewPassword,
          t('new_password'),
          show.new,
          () => setShow((p) => ({ ...p, new: !p.new }))
        )}

        {/* Confirm Password */}
        {renderPasswordInput(
          confirmPassword,
          setConfirmPassword,
          t('confirm_password'),
          show.confirm,
          () => setShow((p) => ({ ...p, confirm: !p.confirm }))
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, loading && styles.disabledButton]}
          disabled={loading}
        >
          {loading ? (
            <CommonLoader color='#fff'/>
          ) : (
            <Text style={styles.buttonText}>{t('change_password')}</Text>
          )}
        </TouchableOpacity>
      </View>
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 55,
    paddingTop: 3,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#454545',
    fontFamily: 'Poppins-Regular',
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ChangePasswordScreen;