// ChangeLanguage.js
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text } from "react-native-paper";
import ProfileSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import CustomLottie from "../component/CustomLottie";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import Toast from "react-native-simple-toast";
import i18n from "../i18n";
import Colors from "../colors/Colors";

const { width } = Dimensions.get("screen");

const languages = [
  { id: "1", code: "en", nameKey: "English", flag: "🇺🇸" },
  { id: "2", code: "zh", nameKey: "中国人", flag: "🇨🇳" },
];

const ChangeLanguage = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  // Load saved language
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await AsyncStorage.getItem("userLanguage");
        if (saved === "en" || saved === "zh") {
          setSelectedLanguage(saved);
        }
      } catch (e) {
        console.warn("load language error", e);
      }
    };
    loadSaved();
  }, []);

  const handleSelectLanguage = (code) => {
    setSelectedLanguage(code);
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem("userLanguage", selectedLanguage);

      // Change language
      await i18n.changeLanguage(selectedLanguage);

      // Ensure toast uses updated language context
      setTimeout(() => {
        Toast.show(i18n.t("language_saved"), Toast.SHORT);
        navigation.goBack();
      }, 100);

    } catch (e) {
      console.log(e);
      Toast.show(i18n.t("failed_to_save"), Toast.SHORT);
    }
  };



  const renderLanguageItem = ({ item }) => {
    const isSelected = selectedLanguage === item.code;

    return (
      <TouchableOpacity
        onPress={() => handleSelectLanguage(item.code)}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 8,
          marginBottom: 10,
          padding: 12,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderWidth: isSelected ? 2 : 0,
          borderColor: isSelected ? Colors.secondary : "transparent",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>{item.flag}</Text>
          <View>
            <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>
              {item.nameKey}
            </Text>
            <Text style={{ fontFamily: "Poppins-Regular", fontSize: 12, color: "#666" }}>
              {item.code.toUpperCase()}
            </Text>
          </View>
        </View>

        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ProfileSettingHeader navigation={navigation} title={t("change_language")} />

      <View style={{ flex: 1, padding: 14 }}>
        <Text
          style={{
            fontFamily: "Poppins-Regular",
            fontSize: 14,
            color: "#555",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          {t("select_language")}
        </Text>

        <FlatList
          data={languages}
          keyExtractor={(item) => item.id}
          renderItem={renderLanguageItem}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          onPress={handleSave}
          style={{
            borderRadius: 8,
            marginVertical: 20,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontFamily: "WhyteInktrap-Medium",
              fontWeight: "500",
              fontSize: 16,
            }}
          >
            {t("save_language")}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          backgroundColor: "#c1c1c1",
          overflow: "hidden",
          height: "50%",
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          zIndex: -1,
          position: "absolute",
          bottom: 0,
          width,
        }}
      >
        <CustomLottie />
      </View>
    </>
  );
};

export default ChangeLanguage;