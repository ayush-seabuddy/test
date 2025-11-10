import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "react-native-localize";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import zh from "./locales/zh.json";

const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

let initialLng = "en";

const loadPersistedLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem("userLanguage");
    if (saved === "en" || saved === "zh") {
      initialLng = saved;
      return;
    }
  } catch (e) {
    console.warn("Failed to load saved language", e);
  }

  const device = Localization.getLocales()[0]?.languageTag || "en";
  initialLng = device.startsWith("zh") ? "zh" : "en";
};

(async () => {
  await loadPersistedLanguage();

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLng,
      fallbackLng: "en",
      supportedLngs: ["en", "zh"],
      interpolation: { escapeValue: false },
      compatibilityJSON: "v3",
    });
})();

export default i18n;