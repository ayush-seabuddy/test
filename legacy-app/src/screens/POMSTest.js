import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SectionList,
  Dimensions,
  Modal,
} from "react-native";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import ResultModal from "../component/Modals/ResultModal";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../Api";
import { RadioButton } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import NetInfo from "@react-native-community/netinfo";
import LottieView from "lottie-react-native";
import { BlurView } from "@react-native-community/blur";
import Loader from "../component/Loader";
import Toast from "react-native-toast-message";
import moment from "moment";
import { useNavigation, useRoute } from "@react-navigation/native";
import HeaderForTest from "../component/headers/ProfileHeader/HeaderForTest";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ProgressBar } from 'react-native-paper';

const { width, height } = Dimensions.get("window");

const POMSTest = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [data, setData] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [responses, setResponses] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [moodTypePopUp, setMoodTypePopUp] = useState(false);
  const [moodType, setMoodType] = useState({ mood: "", message: "", score: 0 });
  const [showIntro, setShowIntro] = useState(true); // State to control intro visibility
  const scrollViewRef = useRef(null); // Ref for ScrollView
  const currentDate = new Date();
  const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
  const previousMonthName = previousMonth.toLocaleString("default", { month: "long" });

  useEffect(() => {
    const showPopup = route.params?.showPopup ?? false;
    const isBoarded = route.params?.isBoarded ?? false;
    const currentDay = moment().date();
    setIsPopupVisible(showPopup);
    setIsModalVisible(showPopup);
  }, [route.params]);

  const getHappinesIndex = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const result = await apiCallWithToken(
        `${apiServerUrl}/user/getAssessmentQuestions?questionType=POMS`,
        "GET",
        null,
        token
      );
      setData(result.result);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    getHappinesIndex();
  }, []);

  const handleInputChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer: value,
        createdAt: new Date().toISOString(),
      },
    }));
  };

  const handleCheckboxChange = (questionId, option) => {
    setResponses((prev) => {
      const existingResponse = prev[questionId] || {
        questionId,
        answer: [],
        createdAt: new Date().toISOString(),
      };

      const updatedAnswer = Array.isArray(existingResponse.answer)
        ? existingResponse.answer.includes(option)
          ? existingResponse.answer.filter((item) => item !== option)
          : [...existingResponse.answer, option]
        : [option];

      return {
        ...prev,
        [questionId]: {
          ...existingResponse,
          answer: updatedAnswer,
          createdAt: new Date().toISOString(),
        },
      };
    });
  };

  // Get today's date
  const today = new Date();

  // Get last date of the current month
  const lastDateOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Message
  const message = 'This short survey is mandatory and helps us understand how you’re feeling so we can improve life onboard.';

  const numberOfQuestionsAnswered = Object.keys(responses).length;
  const isSubmitEnabled = data.length > 0 && numberOfQuestionsAnswered === data.length;

  const PostHappinessData = async () => {
    const extractedArray = Object.values(responses);
    const token = await AsyncStorage.getItem("authToken");

    const body = {
      questionType: "POMS".toUpperCase(),
      month: moment().subtract(1, "months").format("MM-yyyy").toString(),
      answers: extractedArray,
    };

    try {
      const response = await apiCallWithToken(
        apiServerUrl + "/user/saveAssessmentResponses",
        "POST",
        body,
        token
      );
      console.log("response: ", response);

      if (response.responseCode === 200) {
        classifyTMD(response.result);
        setMoodTypePopUp(true);
      }

      function classifyTMD(tmd) {
        if (!tmd || isNaN(tmd)) {
          return {
            mood: "",
            message: "Calculated from your latest Monthly Wellbeing Pulse test results to help you spot patterns and manage stress better",
          };
        }

        tmd = Math.round(Number(tmd));
        let mood, message;

        if (tmd < 6) {
          mood = "Stable Mood";
          message = "Great job! Your mood is stable, keep up the positive vibes!";
        } else if (tmd >= 6 && tmd < 21) {
          mood = "Mild Mood Disturbance";
          message = "You're doing well, but there's room to boost your mood even further. Keep it up!";
        } else if (tmd >= 21 && tmd <= 35) {
          mood = "Moderate Mood Disturbance";
          message = "Your mood is showing some disturbance. Try some stress-relief techniques to get back on track.";
        } else {
          mood = "High Mood Disturbance";
          message = "It looks like you're experiencing high stress. Consider connecting with a consultant for support.";
        }

        setMoodType({ mood, message, score: tmd });
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  const renderItem = ({ item, index }) => {
    const options = ["Not at all", "A little", "Moderately", "Quite a bit", "Extremely"];

    return (
      <View style={styles.frameFlexBox}>
        <View style={[styles.youRegularlyMakeNewFriendsParent, styles.youParentSpaceBlock]}>
          <Text style={[styles.youRegularlyMake, styles.personalityTypo]}>
            {index + 1}. {item.question}
          </Text>
          <RadioButton.Group
            onValueChange={(value) => handleInputChange(item.id, value)}
            value={responses[item.id]?.answer !== undefined ? responses[item.id]?.answer.toString() : ""}
          >
            {options.map((option, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center" }}>
                <RadioButton.Android
                  value={idx.toString()}
                  color="rgba(132, 164, 2, 1)"
                  uncheckedColor="#fff"
                />
                <Text style={{ color: "#fff" }}>{option}</Text>
              </View>
            ))}
          </RadioButton.Group>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const sectionedData = data.reduce((acc, item) => {
    const section = acc.find((sec) => sec.title === item.section);
    if (section) {
      section.data.push(item);
    } else {
      acc.push({ title: item.section, data: [item] });
    }
    return acc;
  }, []);

  const progress = data.length > 0 ? numberOfQuestionsAnswered / data.length : 0;

  // Handle scroll to hide intro section
  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowIntro(scrollY < 50); // Hide intro when scrolled more than 50 pixels
  };

  return (
    <>
      <HeaderForTest navigation={navigation} title={"Monthly Wellbeing Pulse"} isRequired={isModalVisible} />
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <LottieView
          source={require("../assets/Background.json")}
          autoPlay
          loop
          resizeMode="cover"
          style={{ height: "100%", position: "absolute" }}
        />
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={30}
          reducedTransparencyFallbackColor="white"
        >
          <View style={{ backgroundColor: "rgba(215, 215, 215, 0.9)", flex: 1 }}>
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {showIntro && (
                <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
                  <Text
                    style={{
                      color: "#000",
                      fontSize: 14,
                      fontFamily: "Poppins-Regular",
                    }}
                  >
                    Just share how you feel honestly. Your input helps make ship life safer, healthier, and happier for you and everyone.
                  </Text>
                  <Text
                    style={{
                      color: "#000",
                      fontSize: 14,
                      textAlign: 'right',
                      marginTop: 10,
                      fontFamily: "Poppins-Regular",
                    }}
                  >
                    ⏰ Under 2 mins
                  </Text>
                  <View style={{ marginVertical: 10 }}>
                    <ProgressBar
                      progress={progress}
                      color={"rgba(132, 164, 2, 1)"}
                      style={{
                        borderRadius: 6,
                        height: 9,
                      }}
                    />
                    <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 5 }}>
                      <Text
                        style={{
                          color: "#161616",
                          fontSize: 14,
                          fontFamily: "Poppins-Regular",
                        }}
                      >
                        {`${Math.round(progress * 100)}%`}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                <Text
                  style={{
                    lineHeight: 22,
                    fontSize: 14,
                    color: "#161616",
                    fontFamily: "Poppins-SemiBold",
                  }}
                >
                  {moment().subtract(1, "months").format("MMM yyyy").toString()}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#00000066",
                  borderTopLeftRadius: 50,
                  borderTopRightRadius: 50,
                  width: "100%",
                  minHeight: showIntro ? height * 0.83 : height, // Expand to full height when intro is hidden
                }}
              >
                <View
                  style={{
                    height: 3,
                    width: "28%",
                    backgroundColor: "#FFFFFF66",
                    alignSelf: "center",
                    marginTop: 10,
                    borderRadius: 10,
                  }}
                ></View>
                <View
                  style={{
                    marginHorizontal: 20,
                    marginTop: 20,
                  }}
                >
                  <Text style={styles.personalityTest}>
                    {numberOfQuestionsAnswered || 0}/{data.length}
                  </Text>
                </View>
                <SectionList
                  nestedScrollEnabled={true}
                  sections={sectionedData}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  renderSectionHeader={renderSectionHeader}
                  contentContainerStyle={styles.contentContainer}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={
                    <View style={{ alignItems: "center", marginBottom: 10 }}>
                      <Text
                        style={{
                          marginHorizontal: 20,
                          marginVertical: 20,
                          fontFamily: "Poppins-Regular",
                          fontSize: 14,
                          fontStyle: "italic",
                          color: "#fff",
                        }}
                      >
                        * This survey is private and strictly confidential only to support crew wellbeing, not performance review or employment decisions.
                      </Text>
                      <TouchableOpacity
                        style={{
                          height: 50,
                          width: "90%",
                          backgroundColor: isSubmitEnabled ? "#fff" : "#ccc",
                          marginVertical: 10,
                          alignSelf: "center",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 10,
                          opacity: isSubmitEnabled ? 1 : 0.5,
                        }}
                        onPress={PostHappinessData}
                        disabled={!isSubmitEnabled}
                      >
                        <Text
                          style={{
                            color: "#06361F",
                            fontSize: 18,
                            fontWeight: "bold",
                          }}
                        >
                          Submit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  }
                  style={styles.sectionList}
                />
              </View>
            </ScrollView>
          </View>
        </BlurView>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isPopupVisible}
          onRequestClose={() => setIsPopupVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <View
                style={{
                  backgroundColor: '#fff7d1',
                  borderRadius: 50,
                  padding: 15,
                  marginBottom: 20,
                }}
              >
                <Icon name="warning" size={40} color="#d4a017" />
              </View>

              <Text style={styles.title}>
                Your {previousMonthName} check-in is ready!
              </Text>
              <Text style={styles.subTitle}>⏰ Under 2 mins</Text>
              <Text style={styles.message}>{message}</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsPopupVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Start Check-In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {moodType.mood && moodType.message && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={moodTypePopUp}
            onRequestClose={() => setMoodTypePopUp(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 25,
                  borderRadius: 20,
                  width: '95%',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <View
                  style={{
                    backgroundColor: '#fff7d1',
                    borderRadius: 50,
                    padding: 15,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: 'Poppins-SemiBold',
                      color: 'black',
                      textAlign: 'center',
                      lineHeight: 22,
                    }}
                  >
                    Score: {moodType.score}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: 'Poppins-SemiBold',
                      color: 'black',
                      textAlign: 'center',
                      lineHeight: 22,
                    }}
                  >
                    {moodType.mood}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    fontFamily: 'Poppins-Regular',
                    color: '#555',
                    marginBottom: 25,
                    textAlign: 'center',
                    lineHeight: 22,
                  }}
                >
                  {moodType.message}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#000',
                    paddingVertical: 12,
                    paddingHorizontal: 30,
                    borderRadius: 12,
                    width: '100%',
                  }}
                  onPress={() => {
                    setMoodTypePopUp(false);
                    navigation.navigate("Home", { screen: "Health" });
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 16,
                      fontFamily: 'Poppins-SemiBold',
                      textAlign: 'center',
                    }}
                  >
                    Ok
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        <Toast />
      </View>
    </>
  );
};

export default POMSTest;

const styles = StyleSheet.create({
  mbtiChildPosition: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    top: 0,
    width: "100%",
    left: 0,
    position: "absolute",
  },
  dateIconLayout: {
    maxHeight: "100%",
    position: "absolute",
  },
  parentFlexBox: {
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stateParentFlexBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  youParentSpaceBlock: {
    gap: 16,
    paddingVertical: 24,
    borderRadius: 16,
    alignSelf: "stretch",
    paddingHorizontal: 16,
  },
  personalityTypo: {
    fontFamily: "WhyteInktrap-Bold",
    lineHeight: 25,
  },
  sectionHeaderContainer: {
    paddingVertical: 10,
    marginHorizontal: 20,
  },
  sectionHeaderText: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
  frameFlexBox: {
    gap: 8,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  radioLayout2: {
    height: 24,
    width: 24,
  },
  radioLayout1: {
    height: 20,
    width: 20,
  },
  radioLayout: {
    height: 16,
    width: 16,
  },
  radioShadowBox: {
    shadowColor: "rgba(251, 207, 33, 0.16)",
    shadowOpacity: 1,
    elevation: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  agreeTypo: {
    lineHeight: 21,
    fontFamily: "Poppins-Regular",
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  buttonShadowBox: {
    shadowOpacity: 1,
    borderRadius: 8,
  },
  buttonTypo: {
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 21,
    fontSize: 14,
  },
  button2FlexBox: {
    alignItems: "flex-end",
    position: "absolute",
  },
  progressPosition: {
    borderRadius: 4,
    height: 8,
    top: 0,
    left: 0,
    position: "absolute",
  },
  buttonBg: {
    backgroundColor: "#fff",
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  right: {
    height: "29.74%",
    bottom: "36.05%",
    width: 67,
    right: 16,
    top: "34.21%",
    position: "absolute",
  },
  dateIcon: {
    height: "29.21%",
    bottom: "36.58%",
    width: 28,
    left: 16,
    top: "34.21%",
  },
  personalityTest: {
    lineHeight: 24,
    textAlign: "right",
    color: "#fff",
    fontSize: 15,
    fontFamily: "WhyteInktrap-Medium",
  },
  personalityTestParent: {
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  youRegularlyMake: {
    lineHeight: 19,
    fontSize: 16,
    textAlign: "left",
    color: "#fff",
    textTransform: "capitalize",
    fontFamily: "WhyteInktrap-Bold",
    lineHeight: 25,
  },
  radioButtonsIcon: {
    borderRadius: 100,
    overflow: "hidden",
  },
  radioButtons: {
    backgroundColor: "#f7fbe6",
    elevation: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowColor: "rgba(176, 219, 2, 0.16)",
    shadowOpacity: 1,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  radioButtons1: {
    backgroundColor: "#f7fbe6",
    elevation: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowColor: "rgba(176, 219, 2, 0.16)",
    shadowOpacity: 1,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  radioButtonsParent: {
    gap: 24,
  },
  radioShadowBox1: {
    shadowColor: "rgba(103, 110, 118, 0.16)",
    height: 16,
    width: 16,
    shadowOpacity: 1,
    elevation: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  radioButtons3: {
    height: 16,
    width: 16,
  },
  radioButtons4: {
    height: 20,
    width: 20,
  },
  radioButtons5: {
    height: 24,
    width: 24,
  },
  frameParent2: {
    gap: 32,
  },
  agree: {
    fontFamily: "Poppins-Regular",
    textAlign: "left",
  },
  disagree: {
    textAlign: "right",
    fontFamily: "Poppins-Regular",
  },
  agreeParent: {
    alignSelf: "stretch",
  },
  frameParent1: {
    alignItems: "center",
  },
  youRegularlyMakeNewFriendsParent: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  radioButtonsRow: {
    flexDirection: "row",
  },
  radioButton: {
    marginHorizontal: 10,
  },
  button1: {
    color: "#06361f",
    textAlign: "center",
  },
  stateLayer: {
    alignSelf: "stretch",
    justifyContent: "center",
  },
  button: {
    shadowColor: "rgba(103, 110, 118, 0.08)",
    shadowRadius: 5,
    elevation: 5,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "stretch",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: "30%",
    marginTop: "8%",
  },
  frameGroup: {
    height: "95%",
    justifyContent: "space-between",
    width: "100%",
    zIndex: 0,
  },
  frameItem: {
    top: 16,
    left: 125,
    width: 140,
    zIndex: 1,
    height: 7,
    borderRadius: 25,
  },
  frameParent: {
    top: "23%",
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    height: "85%",
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
    gap: 10,
    alignItems: "center",
    width: "100%",
    left: 0,
    position: "absolute",
  },
  button3: {
    color: "#161616",
    textAlign: "center",
  },
  heroiconsOutlinearrowRight: {
    width: 18,
    height: 18,
    overflow: "hidden",
  },
  stateLayer1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  button2: {
    top: "2%",
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRadius: 8,
    right: 16,
    justifyContent: "center",
    overflow: "hidden",
  },
  map: {
    fontFamily: "Whyte Inktrap",
  },
  personalityMap: {
    top: 20,
    fontSize: 20,
    lineHeight: 24,
    color: "#161616",
    textAlign: "left",
    textTransform: "capitalize",
    left: 16,
    position: "absolute",
  },
  progressBar: {
    height: 20,
    width: "100%",
    justifyContent: "center",
    marginBottom: 16,
  },
  progressBar1: {
    height: 10,
    width: "100%",
    backgroundColor: "rgba(132, 164, 2, 1)",
    borderRadius: 5,
    overflow: "hidden",
  },
  background: {
    height: "100%",
    width: "100%",
    backgroundColor: "#e0e0e0",
    position: "absolute",
  },
  progress: {
    height: "100%",
    backgroundColor: "rgba(132, 164, 2, 1)",
    position: "absolute",
  },
  tooltip: {
    position: "absolute",
    top: -30,
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  content: {
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  text1: {
    color: "#fff",
    fontSize: 12,
  },
  mbti: {
    height: "20%",
    overflow: "hidden",
    width: "100%",
    flex: 1,
    backgroundColor: "#fff",
  },
  sectionList: {
    flex: 1,
    marginBottom: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  subTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 15,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  contentContainer: {
    paddingBottom: 180,
  },
});