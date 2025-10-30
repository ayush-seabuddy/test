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
const { width, height } = Dimensions.get("window");
const Home = ({ navigation, route }) => {
  const [activeComponent, setActiveComponent] = useState("hangout");
  const [modalVisible, setModalVisible] = useState(false);
  const [MoodTracker, setMoodTracker] = useState(false);
  const [singlePostData, setSinglePostData] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unSeenCount, setUnSeenCount] = useState(0);

  const fetchUnreadMessageCount = async () => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) {
        console.error("No auth token found");
        return;
      }
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
      console.error("Error fetching data:", error.message);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadMessageCount();
    }, [])
  );

  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const componentOpacity = useRef(new Animated.Value(1)).current;

  const animatePress = useCallback((toValue) => {
    Animated.spring(scaleValue, {
      toValue,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, []);

  const transitionComponent = useCallback((newComponent) => {
    Animated.timing(componentOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setActiveComponent(newComponent);
      Animated.timing(componentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const routeName = route.params?.name?.toLowerCase?.() || "hangout";

      if (routeName === "chat") {
        setActiveComponent("Chat");
      } else if (routeName === "hangout") {
        setActiveComponent("hangout");
      } else {
        setActiveComponent("hangout");
      }
    }, [route.params])
  );


  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "hangout":
        return <HomeHangout singlePostData={singlePostData} />;
      case "Chat":
        return <NewChatPage onBackToHangout={() => setActiveComponent("hangout")} />

      default:
        return null;
    }
  };

  const renderHeader = () => {
    if (activeComponent === "Chat") {
      return <ChatHeader navigation={navigation} />;
    }
    return <HomeHeader navigation={navigation} />;
  };

  const renderButton = (component, label) => {
    const count =
      label === "Chat"
        ? unreadMessageCount
        : label === "Hangout"
          ? unSeenCount
          : 0;

    return (
      <TouchableOpacity
        style={[
          styles.button,
          activeComponent === component && styles.activeButton,
        ]}
        onPress={() => transitionComponent(component)}
      >
        <Text
          style={[
            styles.buttonText,
            activeComponent !== component && styles.inactiveButtonText,
          ]}
        >
          {label}
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

  // useEffect(() => {
  // const checkMoodStatus = async () => {
  // try {
  // let dbResult = await AsyncStorage.getItem("userDetails");
  // const today = moment().format("YYYY-MM-DD");

  // let userData = dbResult ? JSON.parse(JSON.stringify(dbResult)) : {};

  // // If lastMoodDate is missing or different, show modal and update
  // console.log('userData.lastMoodDate: ', userData.lastMoodDate);
  // if (!userData.lastMoodDate || userData.lastMoodDate !== today) {

  // setModalVisible(true);

  // // Update or initialize lastMoodDate immediately
  // userData = {
  // ...userData,
  // lastMoodDate: today,
  // };

  // await AsyncStorage.setItem("userDetails", JSON.stringify(userData));
  // }
  // } catch (error) {
  // console.error("Error checking MoodTracker popup:", error);
  // }
  // };

  // checkMoodStatus();
  // }, []);


  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const dbResult = await AsyncStorage.getItem("userDetails");
        const Data = JSON.parse(dbResult);
        const date = new Date();
        const todayDate = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        const lastMoodDate = Data.lastCloseMoodDate;


        if (lastMoodDate !== todayDate && !Data.isMoodTracker && !Data.isMoodTrackerClose) {
          console.log('Data: ', Data);
          setModalVisible(true);
        } else {
          setModalVisible(false)
        }
        Data.isMoodTrackerClose = true;
        Data.lastCloseMoodDate = todayDate;
        await AsyncStorage.setItem("userDetails", JSON.stringify(Data));
      };

      fetchData();
    }, [])
  );

  const handleMoodTrackerClose = async () => {

    const date = new Date()
    const todayDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const userDetailsString = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(userDetailsString);
    userDetails.isMoodTrackerClose = true;
    userDetails.lastCloseMoodDate = todayDate;
    await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
    setModalVisible(false)

  }


  const getChatRoom = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userDetails");
      const user = JSON.parse(storedUser);
      const userId = user.id;
      const payload = { userId };
      socketService.emit("getUnreadMessageCount", payload);
      socketService.on("unreadMessageCount", (data) => {
        setUnreadMessageCount(data?.unReadCount);
        setUnSeenCount(data?.unSeenCount);
      });
      socketService.on("newMessage", async () => {
        socketService.emit("getUnreadMessageCount", payload);
      });
    } catch (error) {
      console.log(error, "error");
    }
  };

  useEffect(() => {
    getChatRoom();
    socketService.initilizeSocket();
  }, []);

  const insets = useSafeAreaInsets();


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {MoodTracker == false ? (
            <AiModal
              visible={modalVisible}
              onClose={handleMoodTrackerClose}
            />
          ) : null}

          <FocusAwareStatusBar
            barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
            backgroundColor={Colors.white}
            hidden={false}
          />

          {renderHeader()}
          <View style={[styles.buttonGroup]}>
            <View style={styles.buttonContainer}>
              {renderButton("hangout", "Hangout")}
              {renderButton("Chat", "Chat")}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Animated.View style={{ opacity: componentOpacity, flex: 1 }}>
              {renderActiveComponent()}
            </Animated.View>
          </View>

          {activeComponent === "hangout" && (
            <TouchableOpacity
              style={[
                styles.stickyButton,
                { transform: [{ scale: scaleValue }] },
              ]}
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
  container: { height: height },
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
    backgroundColor: "transparent",
  },
  customBadge: {
    position: "absolute",
    top: -8,
    right: -2,
    backgroundColor: Colors.secondary,
    borderColor: 'white',
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
  homeStickyButton: {
    position: "absolute",
    bottom: 145,
    right: "5%",
    marginLeft: -40,
    backgroundColor: "rgba(84, 97, 94, 0.80)",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    borderWidth: 0.1,
    borderColor: "white",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
});

export default Home;