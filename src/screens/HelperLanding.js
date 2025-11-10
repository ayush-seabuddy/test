import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  Dimensions,
  BackHandler,
  Modal,
  TouchableOpacity,
  StatusBar,
  Linking,
} from "react-native";
import ToggleSwitch from "toggle-switch-react-native";
import { BlurView } from "@react-native-community/blur";
import Colors from "../colors/Colors";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import { ImagesAssets } from "../assets/ImagesAssets";
import HelperFrame from "../component/HelperFrame";
import LottieView from "lottie-react-native";
import RealmService from "../Realm/Realm";
import CustomLottie from "../component/CustomLottie";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PDFModal from "../component/Modals/PDFModal";
import { useFocusEffect } from "@react-navigation/native";
import messaging from "@react-native-firebase/messaging";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");
const isProMax = Platform.OS === "ios" && height >= 926;
const HelperLanding = ({ navigation }) => {
  const { t } = useTranslation();
  const [isOn, setIsOn] = useState(true);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [companyLogo, setCompanyLogo] = useState("");
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("App Guide");

  const getLogo = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      if (userDetails.companyLogo) setCompanyLogo(userDetails.companyLogo);
    } catch (error) {
      console.error("Error fetching logo:", error);
    }
  };

  useEffect(() => {
    getLogo();
    const backAction = () => {
      if (!navigation.canGoBack()) {
        setExitModalVisible(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    const allData = RealmService.getAllData("assessmentData");
    const ALLDataitem = allData.map((element) => JSON.parse(element.item));
    return () => backHandler.remove();
  }, [navigation]);

  const handleExitApp = () => {
    BackHandler.exitApp();
    setExitModalVisible(false);
  };

  const handleCloseModal = () => {
    setExitModalVisible(false);
  };

  const handleToggle = () => {
    setIsOn(!isOn);
  };

  const handleOpenPDF = (url, title) => {
    setPdfUrl(url);
    setPdfTitle(title);
    setPdfModalVisible(true);
  };

  const handleClosePDF = () => {
    setPdfModalVisible(false);
    setPdfUrl("");
    setPdfTitle("App Guide");
  };
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);

  const checkNotificationPermission = async () => {
    try {
      const authStatus = await messaging().hasPermission();
      console.log("Notification permission status:", authStatus);

      if (authStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
        console.log("Requesting notification permission...");
        const permission = await messaging().requestPermission();
        console.log("Permission result:", permission);
        if (permission === messaging.AuthorizationStatus.DENIED) {
          console.log("Permission denied, showing modal");
          setIsNotificationModalVisible(true);
        }
      } else if (authStatus === messaging.AuthorizationStatus.DENIED) {
        console.log("Permission already denied, showing modal");
        setIsNotificationModalVisible(true);
      } else {
        console.log("Notifications authorized or provisional, no modal needed");
      }
    } catch (error) {
      console.error("Error checking notification permission:", error);
      setIsNotificationModalVisible(true); // Show modal on error
    }
  };

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
      setIsNotificationModalVisible(false);
    } catch (error) {
      console.error("Error opening settings:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkNotificationPermission();
    }, [])
  );


  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={{ alignItems: "center", flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            marginHorizontal: 15,
            justifyContent: "space-between",
            marginTop: isProMax ? 35 : 10,
          }}
        >
          <View style={{ padding: 20 }}>
            <Image
              style={{ width: 55, height: 55 }}
              resizeMode="contain"
              source={{ uri: companyLogo }}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginRight: 30 }}>
            <Text style={{ color: "gray", fontFamily: "Poppins-Regular", fontSize: 9 }}>
              {t('inpartnershipwith')}
            </Text>
            <Image
              style={{ width: 55, height: 55 }}
              resizeMode="cover"
              source={ImagesAssets.sailorsocietyimage}
            />
          </View>
        </View>
        <Image
          style={styles.illustrativeIcon}
          resizeMode="contain"
          source={ImagesAssets.helper_img_1}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.backgroundOverlay}>
          <CustomLottie />
        </View>
        <View style={{ flex: 1, position: "absolute", bottom: "6%", paddingHorizontal: 8 }}>
          <HelperFrame navigation={navigation} onOpenPDF={handleOpenPDF} />
        </View>
      </View>

      {/* Exit Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={exitModalVisible}
        onRequestClose={handleExitApp}
      >
        <View style={styles.modalOverlay}>
          <StatusBar backgroundColor={"rgba(0, 0, 0, 0.6)"} />
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('exitApp')}</Text>
            <Text style={styles.modalMessage}>{t('exitAppDescription')}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exitButton} onPress={handleExitApp}>
                <Text style={styles.exitButtonText}>{t('exit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isNotificationModalVisible}
        onRequestClose={() => setIsNotificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <StatusBar backgroundColor={"rgba(0, 0, 0, 0.6)"} />
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('enable_notifications')}</Text>
            <Text style={styles.modalMessage}>{t('enable_notifications_description')}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setIsNotificationModalVisible(false) }}>
                <Text style={[styles.cancelButtonText, , { fontSize: 14 }]}>{t('skip')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={handleOpenSettings}>
                <Text style={styles.yesButtonText}>{t('gotosettings')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PDF Modal */}
      <PDFModal
        visible={pdfModalVisible}
        onClose={handleClosePDF}
        pdfUrl={pdfUrl}
        title={pdfTitle}


      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
  },
  backgroundOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: "hidden",
    backgroundColor: "#FFFFFFB2",
  },
  illustrativeIcon: {
    width: "80%",
    height: "85%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
    color: "#333333",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#cccccc",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
    color: "#333333",
  },
  exitButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#042013",
    alignItems: "center",
  },
  exitButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
    color: "#ffffff",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  yesButton: {
    backgroundColor: Colors.secondary,
  },
  yesButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
});

export default HelperLanding;