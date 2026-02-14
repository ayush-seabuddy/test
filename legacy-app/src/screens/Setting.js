import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiCallWithToken, apiServerUrl } from "../Api";
import { ImagesAssets } from "../assets/ImagesAssets";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import DeleteModal from "../component/Modals/DeleteModal";
import SignOutModal from "../component/Modals/SignOutModal";

const { width, height } = Dimensions.get("screen");

const Setting = ({ navigation }) => {
  const { t } = useTranslation(); // <--- Localization hook
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleLogout = async () => {
    setModalVisible(false);
    try {
      const UserData = await AsyncStorage.getItem("userDetails");
      const mydata = JSON.parse(UserData);
      const checkToken = await AsyncStorage.getItem("fmcToken");

      await apiCallWithToken(
        `${apiServerUrl}/user/logout`,
        "POST",
        { deviceTokens: [checkToken] },
        mydata.authToken
      );

      await AsyncStorage.clear();
      navigation.replace("AuthNav", { screen: "LoginData" });
    } catch (error) {
      console.error("Error during logout process:", error);
    }
  };

  const handleAccountDelete = async () => {
    setDeleteModalVisible(false);
    try {
      const UserData = await AsyncStorage.getItem("userDetails");
      const mydata = JSON.parse(UserData);

      await apiCallWithToken(
        `${apiServerUrl}/admin/updateUserDetails`,
        "PUT",
        { status: "DELETE", userId: mydata.id },
        mydata.authToken
      );

      await AsyncStorage.clear();
      navigation.replace("AuthNav", { screen: "LoginData" });
    } catch (error) {
      console.error("Error during account deletion:", error);
    }
  };

  const renderSettingItem = (labelKey, onPress, value = null, isVerified = false) => (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <Text style={styles.itemText}>{t(labelKey)}</Text>
      {value ? (
        <>
          <Text style={styles.itemValue}>{value}</Text>
          <Image source={ImagesAssets.CircleRightArrow} style={styles.headerIcon} />
        </>
      ) : (
        <View style={styles.iconContainer}>
          {isVerified && <Text style={styles.verifiedText}>{t("verified")}</Text>}
          <Image source={ImagesAssets.CircleRightArrow} style={styles.headerIcon} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <ProfleSettingHeader navigation={navigation} title={t("settings")} />
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          {/* Profile Information */}
          <Text style={styles.sectionTitle}>{t("profile_information")}</Text>
          <View style={styles.section}>
            {renderSettingItem("name_nationality_contact", () =>
              navigation.navigate("EditProfile", { screen: "Setting" })
            )}
            {renderSettingItem("profile_photo", () => navigation.navigate("ProfilePhoto"))}
            {renderSettingItem("shipboard_experience", () => navigation.navigate("WorkExperienceScreen"))}
            {renderSettingItem("social_media", () => navigation.navigate("SocialMediaLinks"))}
            {renderSettingItem("certifications", () => navigation.navigate("Certifications"))}
            {renderSettingItem("change_language", () => navigation.navigate("ChangeLanguage"))}
          </View>

          {/* Account */}
          <Text style={styles.sectionTitle}>{t("account")}</Text>
          <View style={styles.section1}>
            {renderSettingItem("change_password", () =>
              navigation.navigate("ChangePasswordScreen")
            )}
            {renderSettingItem("log_out", () => setModalVisible(true))}
          </View>
        </ScrollView>

        {/* Modals */}
        <DeleteModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onDelete={handleAccountDelete}
          title={t("delete_account_confirm")}
        />

        <SignOutModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onDelete={handleLogout}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    width,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
  },
  section1: {
    marginBottom: height * 0.2,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 10,
    lineHeight: 27,
    fontFamily: "WhyteInktrap-Medium",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomColor: "#e5e5e5",
  },
  itemText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Poppins-Regular",
    color: "#949494",
  },
  itemValue: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifiedText: {
    fontSize: 12,
    color: "#B0DB02",
    fontWeight: "600",
    marginRight: 5,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

export default Setting;