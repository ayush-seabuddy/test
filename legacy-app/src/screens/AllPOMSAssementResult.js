import React, { useRef, useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  SectionList,
  Dimensions,
} from "react-native";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import ResultModal from "../component/Modals/ResultModal";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiCallWithTokenPost, apiServerUrl } from "../Api";
import { Checkbox, ProgressBar, RadioButton } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import NetInfo from "@react-native-community/netinfo";
import LottieView from "lottie-react-native";
import { BlurView } from "@react-native-community/blur";
import { heightPercentageToDP } from "react-native-responsive-screen";
import Loader from "../component/Loader";
import RealmService from "../Realm/Realm";
import Toast from "react-native-toast-message";
import CustomDropdown from "../CommonApi";
import Slider from "@react-native-community/slider";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
const { width, height } = Dimensions.get("window");
var _userdata;

const AllPOMSAssementResult = ({ route }) => {
  const { result } = route.params;
  const [data, setData] = useState(result.questionsAndAnswers);
  const [dataresult, setDataresult] = useState(result);
  const navigation = useNavigation();
  const [answeredCount, setAnsweredCount] = useState(0);

  const firstResult = data[0];


  const [responses, setResponses] = useState(() => {
    const initialResponses = {};
    data.forEach((item) => {
      if (item.answerType === "Checkbox" && typeof item.answer === "string") {
        initialResponses[item.questionId] = {
          questionId: item.questionId,
          answer: item.answer.split(";;").map((option) => option.trim()),
          createdAt: new Date().toISOString(),
        };
      } else {
        initialResponses[item.questionId] = {
          questionId: item.questionId,
          answer: item.answer,
          createdAt: new Date().toISOString(),
        };
      }
    });
    return initialResponses;
  });
  const handleInputChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        answer: value,
        createdAt: new Date().toISOString(),
      }, // ✅ Clean and readable
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
          ? existingResponse.answer.filter((item) => item !== option) // Remove option
          : [...existingResponse.answer, option] // Add option
        : [option]; // Ensure it's always an array

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

  const numberOfQuestionsAnswered = Object.keys(responses).length;

  const isSubmitEnabled =
    data.length > 0 && numberOfQuestionsAnswered === data.length;

  const renderItem = ({ item, index }) => {
    const options = [
      "Not at all",
      "A little",
      "Moderately",
      "Quite a bit",
      "Extremely",
    ];

    return (
      <View style={styles.frameFlexBox}>
        <View
          style={[
            styles.youRegularlyMakeNewFriendsParent,
            styles.youParentSpaceBlock,
          ]}
        >
          <Text style={[styles.youRegularlyMake, styles.personalityTypo]}>
            {index + 1}. {item.question}
          </Text>
          <RadioButton.Group
            onValueChange={(value) => {
              handleInputChange(item.id, value);

            }}
            // value={
            //   responses[item.id]?.answer !== undefined
            //     ? responses[item.id]?.answer.toString()
            //     : ""
            // }

            value={responses[item.questionId]?.answer?.toString() || ""}
          >
            {options.map((option, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  // marginVertical: 4,
                }}
              >
                <RadioButton.Android
                  value={idx.toString()}
                  color="rgba(132, 164, 2, 1)"
                  uncheckedColor="#fff"
                  disabled={true} // Disables interaction
                />
                <Text style={{ color: "#fff" }}>{option}</Text>
              </View>
            ))}
          </RadioButton.Group>
        </View>
      </View>
    );
  };

  const formatMonth = (dateString) => {
    const [month, year] = dateString.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };
  const getScoreColors = (score) => {
    // POMS scoring: lower TMD = better mood
    if (score < 6) return { backgroundColor: "#A9DFBF", textColor: "#145A32" }; // Stable Mood
    if (score >= 6 && score < 21) return { backgroundColor: "#F9E79F", textColor: "#7D6608" }; // Mild Mood Disturbance
    if (score >= 21 && score <= 35) return { backgroundColor: "#F5B7B1", textColor: "#78281F" }; // Moderate Mood Disturbance
    return { backgroundColor: "#E74C3C", textColor: "#fff" }; // High Mood Disturbance
  };
  const colors = getScoreColors(firstResult.result);



  const classifyTMD = (tmd) => {
    if (!tmd || isNaN(tmd)) {
      return {
        mood: "No Data",
        message:
          "Calculated from your latest Monthly Wellbeing Pulse test results to help you spot patterns and manage stress better",
      };
    }

    tmd = Math.round(Number(tmd));
    if (tmd < 6) {
      return {
        mood: "Stable Mood",
        message: "Great job! Your mood is stable, keep up the positive vibes!",
      };
    } else if (tmd >= 6 && tmd < 21) {
      return {
        mood: "Mild Mood Disturbance",
        message: "You're doing well, but there's room to boost your mood even further.",
      };
    } else if (tmd >= 21 && tmd <= 35) {
      return {
        mood: "Moderate Mood Disturbance",
        message: "Your mood is showing some disturbance. Try stress-relief techniques to get back on track.",
      };
    } else {
      return {
        mood: "High Mood Disturbance",
        message: "It looks like you're experiencing high stress. Consider connecting with a consultant for support.",
      };
    }
  };


  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
  // Transform data into section format
  const sectionedData = data.reduce((acc, item) => {
    const section = acc.find((sec) => sec.title === item.section);
    if (section) {
      section.data.push(item);
    } else {
      acc.push({ title: item.section, data: [item] });
    }
    return acc;
  }, []);
  return (
    <>
      <ProfleSettingHeader
        navigation={navigation}
        title={`Result ${formatMonth(dataresult?.month)}`}
      />
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          backgroundColor: "#fff",
        }}
      >
        {/* <Loader isLoading={loading} /> */}
        <View>
          <LottieView
            source={require("../assets/Background.json")}
            autoPlay
            loop
            resizeMode="cover"
            style={{ height: "100%" }}
          />

          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={30}
            reducedTransparencyFallbackColor="white"
          >
            <View
              style={{ backgroundColor: "rgba(215, 215, 215, 0.9)", flex: 1 }}
            >
              {/* <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 30,
                justifyContent: "space-between",
                marginHorizontal: 10,
                // backgroundColor: "red",
              }}
            >
                      <TouchableOpacity
                        onPress={() => {
                          navigation.goBack();
                        }}
                        style={styles.headerButton}
                      >
                        <View style={styles.iconBackground}>
                          <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
                        </View>
                      </TouchableOpacity>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <Text
                  style={{
                    lineHeight: 22,
                    fontSize: 15,
                    color: "#161616",
                    // fontWeight: "700",
                    // fontWeight: "bold",
                    fontFamily: "WhyteInktrap-Medium",
                  }}
                >
                  Monthly Wellbeing Pulse
                </Text>
                <Text
                  style={{
                    lineHeight: 22,
                    fontSize: 15,
                    color: "#161616",
                    // fontWeight: "700",
                    // fontWeight: "bold",
                    fontFamily: "WhyteInktrap-Medium",
                  }}
                >
                  Assessment
                </Text>
              </View>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                // onPress={() => {
                //   navigation.replace("HelperLanding");
                // }}
                // onPress={handleSkipBtn}
              ></TouchableOpacity>
            </View> */}
              <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false}>
                <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                  <Text
                    style={{
                      color: "#000",
                      fontSize: 14,
                      fontWeight: '700',
                      fontFamily: "Poppins-Bold",
                    }}
                  >
                    Just share how you feel honestly. Your input helps make ship life safer, healthier, and happier for you and everyone.
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginHorizontal: 14,
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    <Text
                      style={{
                        lineHeight: 22,
                        fontSize: 16,
                        fontWeight: '600',
                        color: "#161616",
                        fontFamily: "Poppins-SemiBold",
                      }}
                    >
                      Month :{" "}
                    </Text>
                    <Text
                      style={{
                        lineHeight: 22,
                        fontSize: 16,
                        fontWeight: '600',
                        color: "#161616",
                        fontFamily: "Poppins-SemiBold",
                      }}
                    >
                      {formatMonth(dataresult?.month)}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginHorizontal: 14,
                    marginBottom: 5,
                  }}
                >
                  <View style={{ flexDirection: "column", marginBottom: 10 }}>
                    <Text
                      style={{
                        lineHeight: 22,
                        fontSize: 16,
                        fontWeight: '600',
                        color: "#161616",
                        fontFamily: "Poppins-SemiBold",
                        marginBottom: 2,
                      }}
                    >
                      Result :  {firstResult.result}
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.backgroundColor,
                        paddingHorizontal: 10,
                        paddingVertical: 2,
                        borderRadius: 5,
                        marginVertical: 5,
                        alignSelf: 'flex-start', // <--- this makes the width shrink to content
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: colors.textColor,
                          fontFamily: "Poppins-SemiBold",
                        }}
                      >{classifyTMD(firstResult.result).mood}
                      </Text>
                    </View>


                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: "#5A5A5A",
                        fontFamily: "Poppins-Regular",
                      }}
                    >
                      {classifyTMD(firstResult.result).message}
                    </Text>

                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: "#00000066",
                    // height: "80%",
                    height: height * 0.83,
                    borderTopLeftRadius: 50,
                    borderTopRightRadius: 50,
                    // position: "absolute",
                    // bottom: 0,
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      height: 6,
                      width: "28%",
                      backgroundColor: "#FFFFFF66",
                      alignSelf: "center",
                      marginTop: 10,
                      borderRadius: 10,
                    }}
                  ></View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginHorizontal: 20,
                      marginTop: 20,
                      marginBottom: 5,
                    }}
                  >
                    <Text style={styles.personalityTest}>
                      Monthly Wellbeing Pulse
                    </Text>
                    <Text style={styles.personalityTest}>
                      {/* {answeredCount}/{data.length} */}
                      {numberOfQuestionsAnswered || 0}/{data.length}
                    </Text>
                  </View>
                  {/* <Text
                  style={{
                    width: width * 0.23,
                    backgroundColor: "#FBCF21",
                    color: "black",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 20,
                    fontSize: 16,
                    marginLeft: 16,
                    textAlign: "center",
                    // position: "absolute",
                    // right: 0,
                  }}
                >
                  Result: {firstResult.result}
                </Text> */}

                  <SectionList
                    nestedScrollEnabled={true}
                    sections={sectionedData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.contentContainer}
                    style={styles.sectionList}
                  />
                </View>
              </ScrollView>
            </View>
          </BlurView>
          <Toast />
        </View>
      </View>
    </>
  );
};

export default AllPOMSAssementResult;

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
  sectionHeader: {
    fontSize: 16,
    lineHeight: 28,
    fontFamily: "Poppins-SemiBold",
    // backgroundColor: "#e0e0e0",
    // paddingHorizontal: 10,
    // paddingTop: 10,
    marginTop: 10,
    marginHorizontal: 18,
    color: "#000",
  },
  frameFlexBox: {
    gap: 8,
    marginTop: 10,
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
    // For iOS
    shadowColor: "#000", // Color of the shadow
    shadowOffset: {
      width: 0, // Horizontal offset
      height: 2, // Vertical offset
    },
    shadowOpacity: 0.25, // Opacity of the shadow
    shadowRadius: 3.5, // Blur radius of the shadow
    // For Android
    elevation: 5, // Elevation for shadow on Android
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
    textAlign: "left",
    color: "#fff",
    fontSize: 18,
    fontFamily: "WhyteInktrap-Medium",
    // textTransform: "capitalize",
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
    flexDirection: "row", // Arrange radio buttons in a row
    // Optional: Align radio buttons vertically
  },
  radioButton: {
    marginHorizontal: 10,
    // Optional: Add margin between buttons
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
    backgroundColor: "#B0DB02",
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
    backgroundColor: "#B0DB02", // Green progress bar
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
  iconBackground: {
    borderRadius: 8,
    paddingVertical: 5,
  },
  headerIcon: {
    width: 20,
    height: 25,
    resizeMode: "contain",
  },
  sectionHeaderContainer: {
    backgroundColor: "rgb(122,124,122)",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginLeft: 15,
    marginRight: 15,
  },
  sectionHeaderText: {
    fontSize: 15,
    color: '#fff',
    fontFamily: "Poppins-SemiBold",
  },
  sectionList: {
    flex: 1,
    marginBottom: 10,
  },
  contentContainer: {
    paddingBottom: 150,
  },
});