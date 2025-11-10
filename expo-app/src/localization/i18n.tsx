import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

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
  } catch (e) {
    console.warn("Error loading saved language:", e);
  }

  const locale = Localization.getLocales()[0]?.languageTag || "en";
  return locale.startsWith("zh") ? "zh" : "en";
}

export async function initI18n() {
  const lng = await getInitialLanguage();

  return i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "en",
    supportedLngs: ["en", "zh"],
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
  });
}

export default i18n;
