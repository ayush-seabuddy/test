import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "@react-native-community/blur";
import { ImagesAssets } from "../assets/ImagesAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../Api";
import Colors from "../colors/Colors";
import { useFocusEffect } from "@react-navigation/native";

const { height, width } = Dimensions.get("screen");
const isProMax = height >= 926;

const HelperFrame = ({ navigation, onOpenPDF }) => {
  const [name, setName] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const pdfUrl = "https://seabuddy.s3.amazonaws.com/1752225459197_CrewAppGuide_SeaBuddy.pdf";

  const getUserDetails = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    setName(userDetails.fullName);
  };

  const fetchUnreadMessageCount = async () => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) return;
      const response = await apiCallWithToken(
        `${apiServerUrl}/user/getUnreadMessageCount`,
        "GET",
        null,
        authToken
      );
      if (response.responseCode) {
        setUnreadMessageCount(response.result.unReadCount);
      }
    } catch (error) {
      // Silent fail in production
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadMessageCount();
    }, [])
  );

  const goToChat = async () => {
    await AsyncStorage.setItem("lastHomeTab", "Chat");
    navigation.navigate("Home", {
      screen: "SeaBuddy",
      params: { name: "chat" },
    });
  };

  const goToHangout = async () => {
    await AsyncStorage.setItem("lastHomeTab", "hangout");
    navigation.navigate("Home", {
      screen: "SeaBuddy",
      params: { name: "hangout" },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.frameParent}>
        <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30} />

        <View style={styles.frameGroup}>
          <TouchableOpacity style={styles.heyGladYouAreBackContainer} onPress={goToChat}>
            <View style={[styles.rowCenter, { width: "92%" }]}>
              <View style={styles.textBlock}>
                <Text style={styles.heyGladYou}>
                  {`Hi ${name?.split(" ")[0]?.charAt(0).toUpperCase() + name?.split(" ")[0]?.slice(1)}, how are you today?`}
                </Text>
                <Text style={styles.selfAwareness}>Chat with your crewmates</Text>
              </View>

              <View style={{ position: "relative" }}>
                <Image style={styles.chatbotImage} resizeMode="cover" source={ImagesAssets.chatLogo} />
                {unreadMessageCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.frameContainer}>
          <View style={{ marginTop: 5 }} />
          <View style={styles.frameView}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <TouchableOpacity style={styles.baseLayout} onPress={goToHangout}>
                <Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.helper_img_5} />
                <View style={styles.hangoutParent}>
                  <Text style={styles.healthHappiness}>Social</Text>
                  <Text style={styles.selfAwareness}>Post, engage and connect across your fleet</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.baseLayout}
                onPress={() => navigation.navigate("Home", { screen: "Huddle" })}
              >
                <Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.helper_img_6} />
                <View style={styles.hangoutParent}>
                  <Text style={styles.healthHappiness}>Ship Life</Text>
                  <Text style={styles.selfAwareness}>Join or create{"\n"}events and win rewards</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 6 }}>
              <TouchableOpacity
                style={styles.baseLayout}
                onPress={() => navigation.navigate("Home", { screen: "Health" })}
              >
                <Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.madelplushicon} />
                <View style={styles.hangoutParent}>
                  <Text style={styles.healthHappiness}>Wellness Hub</Text>
                  <Text style={styles.selfAwareness}>Self-care tools and support</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.baseLayout}
                onPress={() => navigation.navigate("Home", { screen: "Ai" })}
              >
                <Image style={styles.baseIcons} resizeMode="cover" source={ImagesAssets.helper_img_8} />
                <View style={styles.hangoutParent}>
                  <Text style={styles.healthHappiness}>Helplines</Text>
                  <Text style={styles.selfAwareness}>Emergency & complaint lines</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.rowCenter, { marginTop: 10 }]} onPress={() => onOpenPDF(pdfUrl, "App Guide")}>
              <View style={styles.textBlock}>
                <Text style={styles.selfAwareness}>How to use SeaBuddy - Guide</Text>
              </View>
              <Image
                style={[styles.chatbotImage, { height: 20, width: 20, marginBottom: 10 }]}
                resizeMode="cover"
                source={ImagesAssets.notebookIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    overflow: "hidden",
    marginVertical: isProMax ? 10 : 0,
  },
  frameGroup: {
    borderTopWidth: 1.5,
    borderBottomWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    paddingVertical: 10,
    alignItems: "center",
    width: "100%",
    marginBottom: isProMax ? -15 : -10,
  },
  heyGladYouAreBackContainer: {
    backgroundColor: "#FFFFFF33",
    padding: 10,
    borderRadius: 16,
    width: "100%",
  },
  rowCenter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  chatbotImage: {
    height: 25,
    width: 25,
    marginRight: 10,
  },
  textBlock: {
    flexDirection: "column",
    paddingBottom: 6,
  },
  heyGladYou: {
    marginTop: isProMax ? 10 : 6,
    fontSize: isProMax ? 20 : 18,
    lineHeight: isProMax ? 25 : 22,
    color: "#262626",
    fontFamily: "WhyteInktrap-Medium",
  },
  selfAwareness: {
    fontSize: isProMax ? 12 : 10,
    color: "#454545",
    fontFamily: "Poppins-Regular",
  },
  baseIcons: {
    width: width * 0.05,
    height: width * 0.05,
  },
  frameContainer: { gap: 16, width: "100%" },
  frameView: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  baseLayout: {
    flexDirection: "row",
    width: "50%",
    backgroundColor: "#FFFFFF33",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  hangoutParent: { flex: 1, marginLeft: 8, paddingVertical: 10 },
  frameParent: {
    borderRadius: 32,
    backgroundColor: "rgba(218, 218, 218, 0.4)",
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
  },
  healthHappiness: {
    fontSize: isProMax ? 18 : 16,
    lineHeight: isProMax ? 22 : 20,
    color: "#262626",
    fontFamily: "WhyteInktrap-Bold",
  },
  badge: {
    backgroundColor: Colors.secondary,
    borderRadius: 50,
    position: "absolute",
    top: -8,
    right: 2,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
});

export default HelperFrame;