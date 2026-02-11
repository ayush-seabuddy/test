import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import Colors from '@/src/utils/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

const languages = [
  { id: '1', code: 'en', nameKey: 'English', flag: '🇺🇸' },
  { id: '2', code: 'zh', nameKey: '中国人', flag: '🇨🇳' },
];

const ChangeLanguageScreen = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem('userLanguage');
        if (saved && (saved === 'en' || saved === 'zh')) {
          setSelectedLanguage(saved);
          if (i18n.language !== saved) {
            await i18n.changeLanguage(saved);
          }
        }
      } catch (e) {
        console.warn('Error loading saved language:', e);
      }
    };
    loadSaved();
  }, [i18n]);

  const handleSelectLanguage = (code: string) => {
    setSelectedLanguage(code);
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('userLanguage', selectedLanguage);
      await i18n.changeLanguage(selectedLanguage);
      showToast.success(t('success'), t('language_saved'));
      router.back();
    } catch (e) {
      console.error('Error saving language:', e);
      showToast.error(t('oops'), t('failed_to_save'));
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
          <CheckCircle2 size={24} color={Colors.lightGreen} strokeWidth={2} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.main}>
      <GlobalHeader
        title={t('change_language')}
      />

      <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#ededed"
  },
  container: {
    flex: 1,
    marginTop: 10,
    padding: 10,
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
    borderColor: Colors.lightGreen,
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
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '500',
    fontSize: 14,
  }
});

export default ChangeLanguageScreen;