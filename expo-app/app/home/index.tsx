import { viewProfile } from "@/src/apis/apiService";
import CustomLottie from "@/src/components/CustomLottie";
import ExitAppModal from "@/src/components/Modals/ExitAppModal";
import PDFModal from "@/src/components/Modals/PDFModal";
import { useExitOnBack } from "@/src/hooks/useExitOnBack";
import { updateUserField } from "@/src/redux/userDetailsSlice";
import FeatureFrame from "@/src/screens/home/FeatureFrame";
import HeaderBanner from "@/src/screens/home/HeaderBanner";
import Colors from "@/src/utils/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

const { height } = Dimensions.get("window");
const isProMax = Platform.OS === "ios" && height >= 926;

const Home = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [companyLogo, setCompanyLogo] = useState("");

  const [pdfState, setPdfState] = useState({
    visible: false,
    url: "",
    title: t('app_guide')
  });

  const getLogo = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem("userDetails");
      if (!storedData) return;

      const userDetails = JSON.parse(storedData);
      if (userDetails?.companyLogo) {
        setCompanyLogo(userDetails.companyLogo);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
    }
  }, []);

  useEffect(() => {
    getLogo();
  }, [getLogo]);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      const result = await viewProfile();
      if (!result?.data) return;

      Object.entries(result.data).forEach(([key, value]) => {
        dispatch(updateUserField({ key, value }));
      });
    };

    fetchProfileDetails();
  }, [dispatch]);

  const handleExit = useCallback(() => {
    setExitModalVisible(false);
    if (Platform.OS === "android") {
      BackHandler.exitApp();
    }
  }, []);

  useExitOnBack({
    onConfirmExit: () => setExitModalVisible(true),
  });

  const handleOpenPDF = useCallback((url: string, title: string) => {
    setPdfState({
      visible: true,
      url,
      title,
    });
  }, []);

  const handleClosePDF = useCallback(() => {
    setPdfState({
      visible: false,
      url: "",
      title: t('app_guide'),
    });
  }, []);

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

      <PDFModal
        visible={pdfState.visible}
        onClose={handleClosePDF}
        pdfUrl={pdfState.url}
        title={pdfState.title}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
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
    position: "absolute",
    bottom: "10%",
    flex: 1,
    paddingHorizontal: 8,
  },
});
