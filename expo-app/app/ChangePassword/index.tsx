import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import GlobalHeader from '@/src/components/GlobalHeader';
import { changePassword } from '@/src/apis/apiService';
import CustomLottie from '@/src/components/CustomLottie';
import { showToast } from '@/src/components/GlobalToast';

interface Errors {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const inputTheme = {
  colors: {
    primary: '#000',
    outline: '#000',
    placeholder: '#666',
    background: '#fff',
  },
};

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

  const [errors, setErrors] = useState<Errors>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validateField = useCallback(
    (field: keyof Errors, value: string) => {
      if (field === 'currentPassword') return value.trim() ? '' : t('current_password_required');
      if (field === 'newPassword')
        return !value.trim()
          ? t('new_password_required')
          : value.length >= 6
          ? ''
          : t('password_min_length');
      if (field === 'confirmPassword')
        return value === newPassword ? '' : t('passwords_do_not_match');
      return '';
    },
    [newPassword, t]
  );

  const handleSubmit = async () => {
    const finalErrors: Errors = {
      currentPassword: validateField('currentPassword', currentPassword),
      newPassword: validateField('newPassword', newPassword),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };

    setErrors(finalErrors);
    if (Object.values(finalErrors).some(Boolean)) return;

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

  const renderInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    visible: boolean,
    toggle: () => void,
    error?: string
  ) => (
    <>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChange}
        secureTextEntry={!visible}
        mode="outlined"
        autoCapitalize="none"
        textColor="#000"
        style={styles.input}
        theme={inputTheme}
        right={
          <TextInput.Icon
            icon={visible ? 'eye-off' : 'eye'}
            onPress={toggle}
            color="#000"
          />
        }
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );

  return (
    <View style={styles.main}>
      <GlobalHeader
        title={t('change_password')}
        onLeftPress={router.back}
        leftIcon={<ChevronLeft color="#000" size={24} />}
      />

      <View style={styles.container}>
        {renderInput(
          t('current_password'),
          currentPassword,
          (v) => {
            setCurrentPassword(v);
            setErrors((p) => ({ ...p, currentPassword: validateField('currentPassword', v) }));
          },
          show.current,
          () => setShow((p) => ({ ...p, current: !p.current })),
          errors.currentPassword
        )}

        {renderInput(
          t('new_password'),
          newPassword,
          (v) => {
            setNewPassword(v);
            setErrors((p) => ({
              ...p,
              newPassword: validateField('newPassword', v),
              confirmPassword: validateField('confirmPassword', confirmPassword),
            }));
          },
          show.new,
          () => setShow((p) => ({ ...p, new: !p.new })),
          errors.newPassword
        )}

        {renderInput(
          t('confirm_password'),
          confirmPassword,
          (v) => {
            setConfirmPassword(v);
            setErrors((p) => ({
              ...p,
              confirmPassword: validateField('confirmPassword', v),
            }));
          },
          show.confirm,
          () => setShow((p) => ({ ...p, confirm: !p.confirm })),
          errors.confirmPassword
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.button, loading && styles.disabledButton]}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('change_password')}</Text>}
        </TouchableOpacity>
      </View>

      <View pointerEvents="none" style={styles.backgroundLottie}>
        <CustomLottie isBlurView={false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  container: {
    padding: 14,
    zIndex: 2,
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
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  backgroundLottie: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 1,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden',
  },
});

export default ChangePasswordScreen;
