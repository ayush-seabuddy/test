import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  BackHandler,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import Colors from "@/src/utils/Colors";
import CustomLottie from "@/src/components/CustomLottie";
import { useExitOnBack } from '@/src/hooks/useExitOnBack';
import ExitAppModal from "@/src/components/Modals/ExitAppModal";
import PDFModal from "@/src/components/Modals/PDFModal";
import FeatureFrame from "@/src/screens/home/FeatureFrame";
import CustomStatusBar from "@/src/components/CustomStatusBar";
import HeaderBanner from "@/src/screens/home/HeaderBanner";
import NotificationPermissionModal from "@/src/components/Modals/NotificationPermissionModal";

const { height } = Dimensions.get("window");
const isProMax = Platform.OS === "ios" && height >= 926;
const Home = ({ }) => {
  const { t } = useTranslation();
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [companyLogo, setCompanyLogo] = useState("");

  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("App Guide");

  const getLogo = async () => {
    try {
      const storedData = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(storedData ?? "");
      if (userDetails.companyLogo) setCompanyLogo(userDetails.companyLogo);
    } catch (error) {
      console.error("Error fetching logo:", error);
    }
  };
  useEffect(() => {
    getLogo();
  }, []);

  const handleExit = () => {
    setExitModalVisible(false);
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  };

  useExitOnBack({
    onConfirmExit: () => setExitModalVisible(true),
  });



  const handleOpenPDF: (url: string, title: string) => void = (url, title) => {
    setPdfUrl(url);
    setPdfTitle(title);
    setPdfModalVisible(true);
  };

  const handleClosePDF = () => {
    setPdfModalVisible(false);
    setPdfUrl("");
    setPdfTitle("App Guide");
  };


return (
  <View style={styles.container}>
    <HeaderBanner companyLogo={companyLogo} isProMax={isProMax} />
    <View style={styles.contentContainer}>
      <View style={styles.backgroundOverlay}>
        <CustomLottie isBlurView={false} />
      </View>

      <ExitAppModal
        exitModalVisible={exitModalVisible}
        setExitModalVisible={setExitModalVisible}
        onExit={handleExit}
      />

      <View style={styles.featureFrameContainer}>
        <FeatureFrame onOpenPDF={handleOpenPDF} />
      </View>
    </View>

    {/* <NotificationPermissionModal /> */}

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
  featureFrameContainer: {
    flex: 1,
    position: "absolute",
    bottom: "6%",
    paddingHorizontal: 8,
  },
});

export default Home;