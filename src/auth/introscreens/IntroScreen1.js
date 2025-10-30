import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import { ImagesAssets } from "../../assets/ImagesAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../../colors/Colors";
import CustomLottie from "../../component/CustomLottie";

const { width, height } = Dimensions.get("window");


const screensData = [
  {
    loadingIcons: [
      ImagesAssets.loding1,
      ImagesAssets.loding2,
      ImagesAssets.loding2,
      ImagesAssets.loding2,
      ImagesAssets.loding2,
      ImagesAssets.loding2, // Added sixth icon
    ],
    backgroundColor: "#ffffff",
  },
  {
    title: "Crew-Centric Onboarding & Role-Fit Assessment",
    cardTitle: "Built for Seafarers, backed by Science.",
    cardDescription:
      "Designed for maritime environment, our onboarding process evaluates psychological readiness, rank suitability, and well-being indicators to support crew from day one.",
    loadingIcons: [
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding2,
      ImagesAssets.loding2,
      ImagesAssets.loding2,
      ImagesAssets.loding2, // Added sixth icon
    ],
    backgroundColor: "#ffffff",
  },
  {
    title: "Daily Check-ins and Progress Tracking",
    cardTitle: "Your Well-being, Visualized.",
    cardDescription:
      "Spot changes in mood, energy, and stress with daily inputs — built to help seafarers track their emotional trajectory and early signs of fatigue, burnout, or isolation.",
    loadingIcons: [
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding2,
      ImagesAssets.loding2,
      ImagesAssets.loding2, // Added sixth icon
    ],
    backgroundColor: "#F3FAD9",
  },
  {
    title: "Access to a Rich Resource Library",
    cardTitle: "Support that Sails with you",
    cardDescription:
      "Access expert-curated content , built to keep minds steady and spirits strong, wherever you’re headed.",
    loadingIcons: [
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding2,
      ImagesAssets.loding2, // Added sixth icon
    ],
    backgroundColor: "#F3FAD9",
  },
  {
    title: "Peer Support Community and Professional Help",
    cardTitle: "Company Wide Social Feed. 24/7 Global Support from Sailors’ Society.",
    cardDescription:
      "Join your company’s onboard community, speak to wellness officers, or reach Sailors’ Society’s 24/7 support—all in one tap.",
    loadingIcons: [
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding2, // Added sixth icon
    ],
    backgroundColor: "#E7F4B1",
  },
  {
    title: "Well-Being Challenges and Gamification",
    cardTitle: "Host. Hang Out. Hit the Leaderboard.",
    cardDescription:
      "From karaoke nights to workout sessions, earn rewards for participating, organising, and reconnecting. Host or join onboard events, climb the leaderboard, and collect miles while bringing the crew back together—one laugh, one badge at a time.",
    loadingIcons: [
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding1,
      ImagesAssets.loding1, // Added sixth icon
    ],
    backgroundColor: "#E7F4B1",
  },
];

const IntroScreen1 = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [companyLogo, setCompanyLogo] = useState("")
  const [companyName, setcompanyName] = useState("")
  const [companyDescription, setcompanyDescription] = useState("")
  useEffect(() => {
    getLogo()
  }, [])
  const getLogo = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);

      if (userDetails.companyLogo) setCompanyLogo(userDetails.companyLogo)
      if (userDetails.companyName) setcompanyName(userDetails.companyName)
      if (userDetails.companyDescription) setcompanyDescription(userDetails.companyDescription)
    } catch (error) {
      console.log(error);

    }
  }
  const handleNext = async () => {
    if (currentIndex < screensData.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else {
      await AsyncStorage.setItem("completedOnboarding", "true");
      navigation.replace("UploadPhoto");
    }
  };

  const handleBack = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const { title, cardTitle, cardDescription, loadingIcons, backgroundColor } =
    screensData[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.replace("UploadPhoto")}
        >
          <Text style={styles.skipText}>Skip </Text>
          <Image
            source={ImagesAssets.arrowRight}
            style={styles.skipIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>


      <View style={styles.header}>

        <Text style={styles.titleText}>{title}</Text>
        {currentIndex == 0 ? <
          View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Image
            style={{ width: 200, height: 200, borderRadius: 30 }}
            resizeMode="contain"
            source={{ uri: companyLogo }}
          />
        </View> : null}
      </View>


      <View style={styles.bottomSheet}>
        <CustomLottie />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.cardTitle, { marginTop: currentIndex == 0 ? 0 : 10 }]}>{cardTitle}</Text>
          {currentIndex == 0 ? <Text style={[styles.titleText, { color: 'white', marginTop: currentIndex == 0 ? 0 : 50 }]}>Welcome to {companyName} Family</Text> : null}
          {currentIndex == 0 ? <Text style={[styles.cardDescription, { color: 'white', fontSize: 18, lineHeight: 25 }]}>{companyDescription}</Text> : null}
          <Text style={styles.cardDescription}>{cardDescription}</Text>
        </ScrollView>

        <View style={styles.loadingIcons}>
          {loadingIcons.map((icon, index) => (
            <Image
              key={index}
              source={icon}
              style={styles.loadingIcon}
              resizeMode="contain"
            />
          ))}
        </View>

        <View style={styles.fixedButtonsContainer}>
          <TouchableOpacity onPress={handleNext} style={[styles.nextButton, { marginBottom: currentIndex == 0 ? 25 : 0 }]}>
            <Text style={styles.nextButtonText}>
              {currentIndex === screensData.length - 1 ? "Get started" : "Next"}
            </Text>
          </TouchableOpacity>
          {currentIndex > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButtonWrapper}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexBasis: 60,
    justifyContent: "flex-end",
    marginHorizontal: 20,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
    zIndex: 5,
  },
  skipText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    color: Colors.black,
    fontFamily: "WhyteInktrap-Bold",
  },
  skipIcon: {
    width: 20,
    height: 20,

  },
  header: {
    marginHorizontal: 20,
    marginTop: "10%",
    // flexDirection:'row',
    // gap:20
  },
  titleText: {
    marginTop: 50,
    fontSize: 34,
    color: Colors.black,
    fontFamily: "WhyteInktrap-Bold",
    lineHeight: 45,

  },
  bottomSheet: {
    width: width,
    height: height * 0.45,
    position: "absolute",
    bottom: 0,
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    backgroundColor: "transparent",
    overflow: "hidden",
    paddingTop: 20,
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: "100%",
    flexGrow: 1,
    alignItems: "flex-start",
  },
  cardTitle: {
    marginTop: 30,
    fontSize: 22,
    color: "#E8E8E8",
    lineHeight: 30,
    fontFamily: "WhyteInktrap-Bold",
  },
  cardDescription: {
    fontSize: 12,
    color: "#E8E8E8",
    fontWeight: "400",
    fontFamily: "Poppins-Regular",
    textAlign: "left",
    fontStyle: "normal",
    marginTop: 15,
  },
  loadingIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    gap: 5,
  },
  loadingIcon: {
    width: 30,
    height: 30,
  },
  fixedButtonsContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  nextButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.text,
    padding: 15,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 14,
    color: "#06361F",
    fontFamily: "Poppins-SemiBold",
  },
  backButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  backButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 10,
    fontFamily: "Poppins-SemiBold",
  },
});

export default IntroScreen1;