import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import HomeHangout from "./HomeHangout";
import { ImagesAssets } from "../assets/ImagesAssets";
import HomeHeader from "../component/headers/HomeHeader";
import AiModal from "../component/Modals/AiModal";
import ChatHeader from "../component/headers/ChatHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import NewChatPage from "./NewChatPage";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiCallWithToken, apiServerUrl } from "../Api";
import socketService from "../Socket/Socket";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const Home = ({ navigation, route }) => {
  const [activeComponent, setActiveComponent] = useState("hangout");
  const [modalVisible, setModalVisible] = useState(false);
  const [singlePostData, setSinglePostData] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unSeenCount, setUnSeenCount] = useState(0);

  const { t } = useTranslation();

  const scaleValue = useRef(new Animated.Value(1)).current;
  const componentOpacity = useRef(new Animated.Value(1)).current;

  const animatePress = useCallback((toValue) => {
    Animated.spring(scaleValue, { toValue, friction: 3, useNativeDriver: true }).start();
  }, []);

  const transitionComponent = useCallback(async (newComponent) => {
    Animated.timing(componentOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(async () => {
      setActiveComponent(newComponent);
      await AsyncStorage.setItem("lastHomeTab", newComponent);
      Animated.timing(componentOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  }, []);

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
        setUnSeenCount(response.result.unSeenCount);
      }
    } catch (error) {
      // Silent in production
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadMessageCount();
    }, [])
  );

  // Tab Persistence + Param Clearing
  useFocusEffect(
    useCallback(() => {
      const initializeTab = async () => {
        let targetTab = "hangout";
        const routeName = route.params?.name?.toLowerCase?.();

        if (routeName === "chat") {
          targetTab = "Chat";
          navigation.setParams({ name: undefined });
        } else if (routeName === "hangout") {
          targetTab = "hangout";
          navigation.setParams({ name: undefined });
        } else {
          const saved = await AsyncStorage.getItem("lastHomeTab");
          if (saved === "Chat" || saved === "hangout") {
            targetTab = saved;
          }
        }

        await AsyncStorage.setItem("lastHomeTab", targetTab);
        setActiveComponent(targetTab);
      };

      initializeTab();
    }, [route, navigation])
  );

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "hangout":
        return <HomeHangout singlePostData={singlePostData} />;
      case "Chat":
        return <NewChatPage />; // No onBackToHangout
      default:
        return null;
    }
  };

  const renderHeader = () => {
    return activeComponent === "Chat" ? (
      <ChatHeader navigation={navigation} />
    ) : (
      <HomeHeader navigation={navigation} />
    );
  };

  const renderButton = (component, labelKey) => {
    const count = component === "Chat" ? unreadMessageCount : unSeenCount;

    return (
      <TouchableOpacity
        style={[styles.button, activeComponent === component && styles.activeButton]}
        onPress={() => transitionComponent(component)}
      >
        <Text
          style={[
            styles.buttonText,
            activeComponent !== component && styles.inactiveButtonText,
          ]}
        >
          {t(labelKey)}
        </Text>
        {count > 0 && (
          <View style={styles.customBadge}>
            <Text style={styles.customBadgeText}>
              {count > 9 ? "9+" : count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Mood Tracker Modal Logic
  useFocusEffect(
    useCallback(() => {
      const checkMoodTracker = async () => {
        const dbResult = await AsyncStorage.getItem("userDetails");
        const userData = JSON.parse(dbResult);
        const today = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${new Date().getDate().toString().padStart(2, "0")}`;

        if (
          userData.lastCloseMoodDate !== today &&
          !userData.isMoodTracker &&
          !userData.isMoodTrackerClose
        ) {
          setModalVisible(true);
        } else {
          setModalVisible(false);
        }

        userData.isMoodTrackerClose = true;
        userData.lastCloseMoodDate = today;
        await AsyncStorage.setItem("userDetails", JSON.stringify(userData));
      };

      checkMoodTracker();
    }, [])
  );

  const handleMoodTrackerClose = async () => {
    const today = `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${new Date().getDate().toString().padStart(2, "0")}`;
    const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));

    userDetails.isMoodTrackerClose = true;
    userDetails.lastCloseMoodDate = today;
    await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
    setModalVisible(false);
  };

  // Socket Setup
  const setupSocket = async () => {
    try {
      const user = JSON.parse(await AsyncStorage.getItem("userDetails"));
      const payload = { userId: user.id };

      socketService.emit("getUnreadMessageCount", payload);
      socketService.on("unreadMessageCount", (data) => {
        setUnreadMessageCount(data?.unReadCount);
        setUnSeenCount(data?.unSeenCount);
      });
      socketService.on("newMessage", () => {
        socketService.emit("getUnreadMessageCount", payload);
      });
    } catch (error) {}
  };

  useEffect(() => {
    setupSocket();
    socketService.initilizeSocket();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <AiModal visible={modalVisible} onClose={handleMoodTrackerClose} />

          <FocusAwareStatusBar
            barStyle="light-content"
            backgroundColor={Colors.white}
            hidden={false}
          />

          {renderHeader()}

          <View style={styles.buttonGroup}>
            <View style={styles.buttonContainer}>
              {renderButton("hangout", "hangout")}
              {renderButton("Chat", "chat")}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Animated.View style={{ opacity: componentOpacity, flex: 1 }}>
              {renderActiveComponent()}
            </Animated.View>
          </View>

          {activeComponent === "hangout" && (
            <TouchableOpacity
              style={[styles.stickyButton, { transform: [{ scale: scaleValue }] }]}
              onPress={() => navigation.navigate("NewPost")}
              onPressIn={() => animatePress(0.9)}
              onPressOut={() => animatePress(1)}
            >
              <Image
                style={{ width: 18, height: 18 }}
                source={ImagesAssets.plus}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { height },
  buttonGroup: {
    position: "absolute",
    top: 65,
    left: "28%",
    borderRadius: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#364B3866",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 2,
    borderRadius: 30,
    marginTop: 5,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  activeButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 12,
    color: "#fff",
    fontFamily: "WhyteInktrap-Bold",
    lineHeight: 15,
  },
  inactiveButtonText: {
    color: Colors.white,
  },
  customBadge: {
    position: "absolute",
    top: -8,
    right: -2,
    backgroundColor: Colors.secondary,
    borderColor: "white",
    borderWidth: 0.5,
    borderRadius: 50,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  customBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  stickyButton: {
    position: "absolute",
    bottom: 140,
    right: "5%",
    marginLeft: -40,
    backgroundColor: "rgba(84, 97, 94, 0.80)",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
});

export default Home;