import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  Alert,
  PermissionsAndroid,
} from "react-native";

import LottieView from "lottie-react-native";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import { ImagesAssets } from "../assets/ImagesAssets";
import ArchitectCard from "../component/Cards/personaResultCards/ArchitectCard";
import CompatibleCrewMates from "../component/Cards/personaResultCards/CompatibleCrewMates";
import PersonalTraits from "../component/Cards/personaResultCards/PersonalityTraits";
import CareerPathCard from "../component/Cards/personaResultCards/CareerPathCard";
import PersonalityDescription from "../component/Cards/personaResultCards/PersonalityDescription";
import CustomLottie from "../component/CustomLottie";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiServerUrl } from "../Api";
import { useFocusEffect } from "@react-navigation/native";
import Spinner from "react-native-loading-spinner-overlay";
import NetInfo from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import axios from "axios";
import Toast from "react-native-toast-message";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { generateHtmlContent } from "../utils/PersonaPdfhtml";

const { width, height } = Dimensions.get("window");

const PersonaResult = ({ navigation, route }) => {
  const from = route.params.from;
  const [ApiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [pdfFilePath, setPdfFilePath] = useState(null);
  const [pdfLoader, setPdfLoader] = useState(false);

  // Fetch PDF URL
  const fetchPDFURL = async () => {
    setPdfLoader(true);
    const token = await AsyncStorage.getItem("authToken");
    try {
      const res = await axios.get(`${apiServerUrl}/user/getPersonaResultPdf`, {
        headers: { authToken: token },
      });
      if (res.data.responseCode === 200) {
        setPdfUrl(res.data.result.personaResultPdf);
        setUserName(res.data.result.fullName);
      }
    } catch (error) {
      console.log("Error fetching PDF URL:", error?.response?.data);
    } finally {
      setPdfLoader(false);
    }
  };

  // Request storage permissions (Android 13+ & iOS)
  const requestStoragePermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ]);

        return Object.values(grants).some(
          (grant) => grant === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn("Permission error:", err);
        return false;
      }
    }

    const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    if (result === RESULTS.DENIED) await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return true;
  };

  // Share PDF
  const sharePDF = async () => {
    if (!pdfFilePath) {
      Alert.alert("No PDF", "Please generate a PDF first.");
      return;
    }

    const hasPermission = await requestStoragePermissions();
    if (!hasPermission) {
      Alert.alert("Permission Required", "Storage access is required to share the PDF.");
      return;
    }

    try {
      const fileExists = await RNFS.exists(pdfFilePath);
      if (!fileExists) {
        Alert.alert("File Missing", "PDF not found. Please regenerate.");
        return;
      }

      // Use a unique name or delete if already exists
      const shareablePath = `${RNFS.CachesDirectoryPath}/PersonaResult_${Date.now()}.pdf`;

      // Or delete if static name needed:
      // const shareablePath = `${RNFS.CachesDirectoryPath}/PersonaResult.pdf`;
      // if (await RNFS.exists(shareablePath)) {
      //   await RNFS.unlink(shareablePath);
      // }

      await RNFS.copyFile(pdfFilePath, shareablePath);

      await Share.open({
        title: "Persona Result",
        url: `file://${shareablePath}`,
        type: "application/pdf",
        message: "Here is your Persona Result.",
        failOnCancel: false,
      });
    } catch (error) {
      console.error("PDF Share Error:", error);
      Alert.alert("Error", "Failed to share PDF. Please try again.");
    }
  };


  // Generate PDF
  const createPDF = async (insights, mbtiType, fullName) => {
    const htmlContent = generateHtmlContent(insights, mbtiType, fullName);
    try {
      const options = {
        html: htmlContent,
        fileName: `${fullName}_Persona_Result`,
        directory: "Documents",
      };
      const file = await RNHTMLtoPDF.convert(options);
      setPdfFilePath(file.filePath);
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF.");
    }
  };

  // Fetch assessment result (online/offline)
  const getAssessment = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem("authToken");
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;

    try {
      if (isConnected) {
        const res = await axios.get(
          `${apiServerUrl}/user/getAssessmentResult?questionType=PERSONALITY`,
          { headers: { authToken: token } }
        );

        const result = res.data;
        if (result.responseCode === 200) {
          setApiData(result.result.data);

          const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails") || "{}");
          const fullName = userDetails.fullName || "User";
          await createPDF(result.result.data.insights, result.result.data.personality_type, fullName);

          // Save to Firestore (synced)
          await firestore()
            .collection("assessmentResults")
            .doc(token)
            .set({ result: result.result.data, flag: 1 }, { merge: true });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: result?.responseMessage || "Something went wrong.",
          });
        }
      } else {
        const snapshot = await firestore().collection("assessmentResults").doc(token).get();
        if (snapshot.exists) {
          setApiData(snapshot.data().result);
          Toast.show({ text1: "Offline", text2: "Data loaded from local storage." });
        } else {
          Toast.show({ text1: "Offline", text2: "No local data found." });
          await firestore()
            .collection("assessmentResults")
            .doc(token)
            .set({ flag: 0, timestamp: new Date().toISOString() }, { merge: true });
        }
      }
    } catch (err) {
      console.error("getAssessment error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err?.response?.data?.responseMessage || "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync offline data when back online
  const syncOfflineData = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) return;

    const unsynced = await firestore().collection("assessmentResults").where("flag", "==", 0).get();
    for (const doc of unsynced.docs) {
      const token = doc.id;
      try {
        const res = await axios.get(
          `${apiServerUrl}/user/getAssessmentResult?questionType=PERSONALITY`,
          { headers: { authToken: token } }
        );

        if (res.data.responseCode === 200) {
          await firestore()
            .collection("assessmentResults")
            .doc(token)
            .update({ result: res.data.result.data, flag: 1 });
          Toast.show({ text1: "Synced", text2: "Offline data updated." });
        }
      } catch (error) {
        console.error("Sync failed:", error);
      }
    }
  };

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      getAssessment();
      fetchPDFURL();

      const unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected) syncOfflineData();
      });

      return () => unsubscribe();
    }, [])
  );

  const goNext = () => {
    if (from === "HelthScreen") {
      navigation.goBack();
    } else {
      navigation.replace("HelperLanding");
    }
  };

  return (
    <View style={styles.uploadPhoto}>
      <Spinner visible={isLoading || pdfLoader} size="large" color="#000" />
      <FocusAwareStatusBar barStyle="light-content" backgroundColor={Colors.white} />

      <Image style={styles.backgroundImage} resizeMode="cover" source={ImagesAssets.persona_background_img} />

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Persona </Text>
            <Text style={styles.subtitleText}>Result</Text>
          </View>
          <TouchableOpacity onPress={sharePDF} style={styles.emailButton}>
            <Image style={{ height: 14, width: 14, padding: 8 }} source={ImagesAssets.shear_icon} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {ApiData && (
            <View style={{ marginTop: "100%", marginBottom: 20 }}>
              <View style={{ marginTop: "30%" }}>
                <ArchitectCard data={ApiData} />
                <View style={{ marginTop: 7 }}>
                  <PersonalityDescription data={ApiData} />
                </View>

                {ApiData.data?.insights?.compatible_crew_mates?.length > 0 && (
                  <View style={{ marginTop: 7 }}>
                    <CompatibleCrewMates data={ApiData} />
                  </View>
                )}

                <View style={{ marginTop: 7 }}>
                  <PersonalTraits data={ApiData} />
                </View>

                <View style={{ marginTop: 7 }}>
                  <CareerPathCard data={ApiData} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.bottomCard}>
        <CustomLottie />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={goNext}>
        <Text style={styles.submitButtonText}>
          {from === "HelthScreen" ? "Go Back" : "Continue"}
        </Text>
      </TouchableOpacity>

      <Toast position="top" topOffset={40} />
    </View>
  );
};

const styles = StyleSheet.create({
  uploadPhoto: { flex: 1, backgroundColor: "#fff" },
  contentContainer: { flex: 1, paddingHorizontal: 16, zIndex: 2 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginTop: "7%",
  },
  titleContainer: { flexDirection: "row", alignItems: "center" },
  titleText: {
    fontSize: 20,
    color: "black",
    fontFamily: "WhyteInktrap-Bold",
    paddingTop: Platform.OS === "ios" ? 7 : 0,
  },
  subtitleText: {
    fontSize: 20,
    fontFamily: "WhyteInktrap-Medium",
    paddingTop: Platform.OS === "ios" ? 7 : 0,
  },
  emailButton: { backgroundColor: "#B0DB0266", padding: 8, borderRadius: 8 },
  backgroundImage: { position: "absolute", width: "100%", height: "100%", zIndex: 1 },
  scrollContainer: { flexGrow: 1, paddingBottom: 65, zIndex: 3 },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "38%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: -2,
    overflow: "hidden",
  },
  submitButton: {
    position: "absolute",
    bottom: "3%",
    left: "5%",
    width: "90%",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#02130b",
    alignItems: "center",
    zIndex: 5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
});

export default PersonaResult;