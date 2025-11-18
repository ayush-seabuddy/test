import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import en from "@/assets/locals/en.json";
import zh from "@/assets/locals/zh.json";

const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

async function getInitialLanguage() {
  try {
    const savedLang = await AsyncStorage.getItem("userLanguage");
    if (savedLang && ["en", "zh"].includes(savedLang)) return savedLang;
  } catch {}
  
  const locale = Localization.getLocales()[0]?.languageTag || "en";
  return locale.startsWith("zh") ? "zh" : "en";
}

export async function initI18n() {
  const lng = await getInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "en",
    compatibilityJSON: "v4",
    interpolation: { escapeValue: false },
  });

  return i18n;
}

export default i18n;
