import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
} from "react-native";
import { BlurView } from "@react-native-community/blur";
import { ImagesAssets } from "../../assets/ImagesAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HelpLineCard from "./HelpLineScreensCards/HelpLineCard";
import EmergencyModal from "../Modals/EmergencyModal";
import {
  Freshchat,
  FreshchatConfig,
  ConversationOptions,
  FreshchatUser,
} from "react-native-freshchat-sdk";
import { getApiLevel } from "../../Api";

const { width } = Dimensions.get("window");

const APP_ID = "d3f0a0cc-c399-4f7d-a766-aa6178b81a2d";
const APP_KEY = "6284ec56-b238-4a42-b2ac-8685a420c73d";
const DOMAIN = "msdk.freshchat.com";

const AiJoliCard = ({ navigation, page = "ai" }) => {
  const [name, setName] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const initialBots = [
    {
      type: "HEALTH",
      label: "Health",
      image: ImagesAssets.MarineBuddy,
    },
    {
      type: "SPIRITUAL",
      label: "Spiritual",
      image: ImagesAssets.SpiritualBuddy,
    },
    {
      type: "TECHNICAL",
      label: "Marine",
      image: ImagesAssets.healthBuddy1,
    },
  ];

  const [bots, setBots] = useState(initialBots);
  const animation = useRef(new Animated.Value(0)).current;

  const GetuserDetails = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    setName(userDetails?.fullName);
  };

  useEffect(() => {
    GetuserDetails();

    const freshchatConfig = new FreshchatConfig(APP_ID, APP_KEY);
    freshchatConfig.domain = DOMAIN;
    Freshchat.init(freshchatConfig);

    const freshchatUser = new FreshchatUser();
    freshchatUser.firstName = "John";
    freshchatUser.lastName = "Doe";
    freshchatUser.email = "johndoe@dead.man";
    freshchatUser.phoneCountryCode = "+91";
    freshchatUser.phone = "1234234123";

    Freshchat.setUser(freshchatUser, (error) => {
      if (error) console.error("Set user error:", error);
    });

    Freshchat.setUserProperties(
      { user_type: "Paid", plan: "Gold" },
      (error) => {
        if (error) console.error("Set user properties error:", error);
      }
    );

    Freshchat.identifyUser("USER_12345", null, (error) => {
      if (error) console.error("Identify user error:", error);
    });

    Freshchat.addEventListener(
      Freshchat.EVENT_USER_RESTORE_ID_GENERATED,
      () => {
        Freshchat.getUser((user) => {
          const restoreId = user.restoreId;
        });
      }
    );

    Freshchat.addEventListener(
      Freshchat.EVENT_UNREAD_MESSAGE_COUNT_CHANGED,
      () => {
        Freshchat.getUnreadCountAsync((data) => {
          if (!data.status) console.error("Failed to get unread count");
        });
      }
    );

    return () => {
      Freshchat.removeEventListeners(
        Freshchat.EVENT_USER_RESTORE_ID_GENERATED
      );
      Freshchat.removeEventListeners(
        Freshchat.EVENT_UNREAD_MESSAGE_COUNT_CHANGED
      );
    };
  }, []);

  // 🔁 Animate rotation with fade and scale
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setBots((prevBots) => {
          const newOrder = [prevBots[1] ,prevBots[2], prevBots[0], ];
          return newOrder;
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const showConversations = () => {
    const conversationOptions = new ConversationOptions();
    conversationOptions.tags = ["sailorssociety"];
    conversationOptions.filteredViewTitle = "Sailors' Society Live chat";
    Freshchat.showConversations(conversationOptions);
  };

  return (
    <View style={styles.container}>
      {(page === "health" || page === "both") && (
        <HelpLineCard
          navigation={navigation}
          setModalVisible={setModalVisible}
          showConversations={showConversations}
        />
      )}

      {(page === "ai" || page === "both") && (
        <View style={styles.frameParent}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={30}
            reducedTransparencyFallbackColor="white"
          />

          <Text style={[styles.heyGladYou, { textAlign: "center" }]}>
            One Assistant, Many Faces
          </Text>
          <Text
            style={{
              fontSize: 11,
              textAlign: "center",
              lineHeight: 16,
              fontFamily: "Poppins-Regular",
              marginBottom: 16,
            }}
          >
            AI-powered buddies built to guide, support, and answer you—anytime,
            anywhere
          </Text>

          <View style={styles.botRow}>
            {bots.map((bot, index) => {
              const isCenter = index === 1;

              return (
                <Animated.View
                  key={index}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    transform: [
                      {
                        scale: animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, isCenter ? 1.12 : 1],
                        }),
                      },
                    ],
                    opacity: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.6],
                    }),
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("JollyAi", {
                        chatType: bot.type,
                        name: `${bot.label} Buddy`,
                      })
                    }
                    activeOpacity={0.8}
                    style={[
                      styles.botCard,
                      isCenter && styles.centerBotCard,
                    ]}
                  >
                    <Text
                      style={[
                        styles.healthHappiness,
                        isCenter && { fontSize: 16 },
                      ]}
                    >
                      {bot.label}
                    </Text>
                    <View
                      style={[
                        styles.botIconWrapper,
                        isCenter && styles.centerBotIconWrapper,
                      ]}
                    >
                      <Image
                        style={[
                          styles.baseIcons,
                          isCenter && styles.centerBaseIcons,
                        ]}
                        resizeMode="contain"
                        source={bot.image}
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
          {/* <Text style={{  fontSize: 10,
              textAlign: "center",
              lineHeight: 16,
              fontFamily: "Poppins-Regular",
              marginVertical:16}}>AI buddies can make mistakes. Check important information.</Text> */}
        </View>
      )}

      <EmergencyModal
        navigation={navigation}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: getApiLevel() > 34 ? "42%" : "35%",
  },
  heyGladYou: {
    fontSize: 16,
    lineHeight: 25,
    color: "#262626",
    fontWeight: "500",
    fontFamily: "WhyteInktrap-Medium",
  },
  frameParent: {
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
    marginTop: 10,
  },
  botRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  botCard: {
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  centerBotCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  botIconWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  centerBotIconWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 10,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  baseIcons: {
    width: width * 0.18,
    height: width * 0.18,
  },
  centerBaseIcons: {
    width: width * 0.22,
    height: width * 0.22,
  },
  healthHappiness: {
    lineHeight: 18,
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
    fontFamily: "WhyteInktrap-Medium",
  },
});

export default AiJoliCard;
