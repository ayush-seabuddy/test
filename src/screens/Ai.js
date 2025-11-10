import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Colors from "../colors/Colors";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import { ImagesAssets } from "../assets/ImagesAssets";
import AiJoliCard from "../component/Cards/AiJoliCard";
import CustomLottie from "../component/CustomLottie";
import Octicons from 'react-native-vector-icons/Octicons'
import { t } from "i18next";
import { useTranslation } from "react-i18next";
const { width, height } = Dimensions.get("window");

const Ai = ({ navigation, route }) => {
  const mode = route.params?.mode || "both";
  const [isOn, setIsOn] = useState(true);
  const { t } = useTranslation();

  const handleToggle = () => {
    setIsOn(!isOn);
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.alwaysShowAtContainer}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: 10,
              position: "relative",
              paddingVertical: 8,
            }}
          >

            {/* History Icon (Right-aligned, after Home icon with 16 gap) */}
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 0,
                right: 52,
                backgroundColor: "#B0DB0266",
                padding: 6,
                borderRadius: 10,
              }}
              onPress={() => navigation.navigate("AllListHelplinesForm")}
            >
              <Image
                style={[styles.baseIcons, { height: 20, width: 20 }]}
                resizeMode="cover"
                source={ImagesAssets.historyIcon}
              />
            </TouchableOpacity>

            {/* Home Icon (absolutely positioned) */}
            <TouchableOpacity
              style={{
                borderRadius: 10,
                backgroundColor: "#B0DB0266",
                padding: 6,
                position: "absolute",
                right: 0, // 20 (icon width) + 16 (gap) + some buffer
                top: 0,
              }}
              onPress={() => navigation.replace("AppNav", { screen: "HelperLanding" })}
            >
              <Octicons name="home" size={21} color="#000" />
            </TouchableOpacity>

            {/* Centered Text */}
            <Text style={{
              fontSize: 20,
              lineHeight: 25,
              color: "#262626",
              fontWeight: "500",
              fontFamily: "WhyteInktrap-Medium"
            }}>
              {t('helplines')}
            </Text>
          </View>
        </View>

        <View style={styles.mainLinkContainer}>
          <Image
            style={styles.illustrativeIcon}
            resizeMode="contain"
            source={ImagesAssets.ai_joili_image}
          />
          <View style={{ flex: 1 }}>
            <View
              style={styles.backgroundImage}
            >
              <CustomLottie />
            </View>
          </View>

          <View style={styles.cardContainer}>
            <ScrollView
              style={styles.cardScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <AiJoliCard navigation={navigation} page={mode} />
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  alwaysShowAtContainer: {
    flexDirection: "row",
    paddingHorizontal: 22,
  },
  alwaysShowAt: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: Colors.black,
  },
  mainLinkContainer: {
    flex: 1,
    position: "relative",
  },
  illustrativeIcon: {
    width: "100%",
    height: "35%",
  },
  backgroundImage: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "100%",
    width: "100%",
    overflow: "hidden",
  },
  thisPageCan: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "Poppins-Regular",
    color: "#949494",
    textAlign: "left",
  },
  lottieBackground: {
    width: width * 1,
    height: height * 0.7,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    position: "absolute",
    bottom: "0%",
  },
  cardContainer: {
    flex: 1,
    position: "absolute",
    top: "29%",
    paddingHorizontal: 12,
    width: "100%",
    maxHeight: height * 0.7,
  },
  cardScrollView: {
    flex: 1,
  },
});

export default Ai;
