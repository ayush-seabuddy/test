// screens/ChangeLanguageScreen.tsx
import CustomLottie from '@/src/components/CustomLottie';
import GlobalHeader from '@/src/components/GlobalHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { CheckCircle2, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('screen');

const languages = [
  { id: '1', code: 'en', nameKey: 'English', flag: '🇺🇸' },
  { id: '2', code: 'zh', nameKey: '中国人', flag: '🇨🇳' },
];

const ChangeLanguageScreen = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language);

  // Load saved language on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem('userLanguage');
        if (saved && (saved === 'en' || saved === 'zh')) {
          setSelectedLanguage(saved);
        }
      } catch (e) {
        console.warn('Error loading saved language:', e);
      }
    };
    loadSaved();
  }, []);

  const handleSelectLanguage = (code: string) => {
    setSelectedLanguage(code);
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('userLanguage', selectedLanguage);

      // Change language in i18next
      await i18n.changeLanguage(selectedLanguage);

      Toast.show({
        type: 'success',
        text1: t('language_saved'),
        visibilityTime: 2000,
      });

      router.back();
    } catch (e) {
      console.error('Error saving language:', e);
      Toast.show({
        type: 'error',
        text1: t('failed_to_save'),
        visibilityTime: 2000,
      });
    }
  };

  const renderLanguageItem = ({ item }: { item: typeof languages[0] }) => {
    const isSelected = selectedLanguage === item.code;

    return (
      <TouchableOpacity
        onPress={() => handleSelectLanguage(item.code)}
        style={[
          styles.languageItem,
          isSelected && styles.selectedItem,
        ]}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.flag}>{item.flag}</Text>
          <View>
            <Text style={styles.languageName}>{item.nameKey}</Text>
            <Text style={styles.languageCode}>{item.code.toUpperCase()}</Text>
          </View>
        </View>

        {isSelected && (
          <CheckCircle2 size={24} color="#84A402" strokeWidth={2} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <GlobalHeader
        title={t('change_language')}
        onLeftPress={() => router.back()}
        leftIcon={<ChevronLeft color="#000" size={24} />}
      />

      <View style={styles.container}>
        <Text style={styles.instructionText}>
          {t('select_language')}
        </Text>

        <FlatList
          data={languages}
          keyExtractor={(item) => item.id}
          renderItem={renderLanguageItem}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>{t('save_language')}</Text>
        </TouchableOpacity>
      </View>

      <Toast />

      {/* Background Lottie */}
      <View style={styles.backgroundLottie}>
        <CustomLottie />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  instructionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: '#84A402',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  languageCode: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666',
  },
  saveButton: {
    borderRadius: 8,
    marginVertical: 20,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'WhyteInktrap-Medium',
    fontWeight: '500',
    fontSize: 16,
  },
  backgroundLottie: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#c1c1c1',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden',
    zIndex: -1,
  },
});

export default ChangeLanguageScreen;