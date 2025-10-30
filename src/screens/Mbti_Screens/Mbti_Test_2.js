import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import ResultModal from "../../component/Modals/ResultModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithTokenPost, apiServerUrl } from "../../Api";
import { ProgressBar, RadioButton } from "react-native-paper";
import NetInfo from "@react-native-community/netinfo";
import { BlurView } from "@react-native-community/blur";
import { heightPercentageToDP } from "react-native-responsive-screen";
import AntDesign from 'react-native-vector-icons/AntDesign';
import Loader from "../../component/Loader";
import RealmService from "../../Realm/Realm";
import Toast from "react-native-toast-message";
import CustomLottie from "../../component/CustomLottie";

const Mbti_Test_2 = ({ navigation, route }) => {
  const { from , isRequired = false} = route.params;
  console.log("route.params: ", route.params);

  const [skipDate, setSkipDate] = useState(3);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [visibleData, setVisibleData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedValues, setSelectedValues] = useState({});
  const [answeredCount, setAnsweredCount] = useState(0);
  const [diffDays, setDiffDays] = useState(30);
  const flatListRef = useRef(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const getLastDate = async () => {
      try {
        const lastDate = await AsyncStorage.getItem("lastDate");
        if (lastDate) {
          const nowDate = new Date();
          const skipDate = new Date(lastDate);
          const diffMs = skipDate - nowDate;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          setDiffDays(diffDays);
        }
      } catch (error) {
        console.error("Failed to get last date:", error);
      }
    };
    getLastDate();
  }, []);

  useEffect(() => {
    const loadResponses = async () => {
      try {
        const [savedResponses, answerPercentage] = await Promise.all([
          AsyncStorage.getItem("userSavedTest"),
          AsyncStorage.getItem("answerPercentage"),
        ]);
        if (savedResponses) setSelectedValues(JSON.parse(savedResponses) || {});
        if (answerPercentage) setAnsweredCount(JSON.parse(answerPercentage) || 0);
      } catch (error) {
        console.error("Failed to load responses:", error);
      }
    };
    loadResponses();
  }, []);

  useEffect(() => {
    const getAssessment = async () => {
      setLoading(true);
      try {
        const allData = RealmService.getAllData("assessmentData", "UserDatabase.realm");
        const parsedData = allData.map((element) => JSON.parse(element.item));
        setData(parsedData);
        setVisibleData(parsedData.slice(0, itemsPerPage));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getAssessment();
  }, []);

  const saveResponses = useCallback(async (responses, answer) => {
    try {
      await Promise.all([
        AsyncStorage.setItem("userSavedTest", JSON.stringify(responses)),
        AsyncStorage.setItem("answerPercentage", JSON.stringify(answer)),
      ]);
    } catch (error) {
      console.error("Failed to save responses:", error);
    }
  }, []);

  const scrollToUnansweredQuestion = useCallback(() => {
    const unansweredIndex = data.findIndex((item) => !selectedValues[item.id]);
    if (unansweredIndex !== -1) {
      flatListRef.current?.scrollToIndex({
        index: unansweredIndex,
        animated: true,
      });
    }
  }, [data, selectedValues]);

  const handleNextPress = useCallback(() => {
    if (progressPercentage === 100) {
      generateJSON();
    } else {
      scrollToUnansweredQuestion();
    }
  }, [progressPercentage, generateJSON, scrollToUnansweredQuestion]);

  const handleSelection = useCallback((questionId, value, facet) => {
    setSelectedValues((prevState) => {
      const isNewAnswer = !prevState[questionId];
      if (isNewAnswer) {
        setAnsweredCount((prevCount) => prevCount + 1);
      }
      return { ...prevState, [questionId]: { score: value, facet } };
    });
  }, []);

  const handleSkipBtn = useCallback(async () => {
    if (diffDays < 0) {
      console.log("Cannot skip: diffDays is less than 0");
      return;
    }
    setLoading(true);
    try {
      await saveResponses(selectedValues, answeredCount);
      await personalityTestSkip();
      if (from === "Mbti_Start_Test") {
        navigation.replace("HelperLanding");
      } else {
        navigation.goBack();
      }

    } catch (error) {
      console.error("Error in saving the test:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [diffDays, selectedValues, answeredCount, from, navigation, saveResponses]);

  const personalityTestSkip = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const result = Object.keys(selectedValues).map((questionId) => ({
        questionId,
        answer: selectedValues[questionId].score,
        createdAt: new Date().toISOString(),
      }));
      const body = JSON.stringify({ answers: result });
      RealmService.addOrUpdateData("PostAssismentData", body, "UserDatabase.realm");

      const { isConnected } = await NetInfo.fetch();
      if (isConnected) {
        const postData = RealmService.getAllData("PostAssismentData", "UserDatabase.realm");
        const mostRecentItem = postData.reduce((latest, current) =>
          new Date(latest.createdDateTime) > new Date(current.createdDateTime) ? latest : current,
          postData[0]
        );
        const response = await apiCallWithTokenPost(
          `${apiServerUrl}/user/saveAssessmentResponses`,
          token,
          JSON.parse(mostRecentItem.item)
        );

        Toast.show({
          type: response.responseCode === 200 ? "success" : "error",
          text1: response.responseCode === 200 ? "Success" : "Error",
          text2: response.responseMessage,
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 10 : 0,
          },
          text2Style: {
            fontFamily: "Poppins-Regular",
            fontSize: 14,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 10 : 0,
          },
        });
      } else {
        Toast.show({
          type: "info",
          text1: "Info",
          text2: "You are offline",
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
          },
        });
        navigation.replace(from === "Mbti_Start_Test" ? "HelperLanding" : "HelthScreen");
      }
    } catch (error) {
      console.error("Error in personalityTestSkip:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedValues, from, navigation]);

  const generateJSON = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const result = Object.keys(selectedValues).map((questionId) => ({
        questionId,
        answer: selectedValues[questionId].score,
        createdAt: new Date().toISOString(),
      }));
      const body = JSON.stringify({ answers: result });
      RealmService.addOrUpdateData("PostAssismentData", body, "UserDatabase.realm");

      const { isConnected } = await NetInfo.fetch();
      if (isConnected) {
        const postData = RealmService.getAllData("PostAssismentData", "UserDatabase.realm");
        const mostRecentItem = postData.reduce((latest, current) =>
          new Date(latest.createdDateTime) > new Date(current.createdDateTime) ? latest : current,
          postData[0]
        );
        const response = await apiCallWithTokenPost(
          `${apiServerUrl}/user/saveAssessmentResponses`,
          token,
          JSON.parse(mostRecentItem.item)
        );

        if (response.responseCode === 200) {
          await saveResponses(selectedValues, answeredCount);
          const userDetailsString = await AsyncStorage.getItem("userDetails");
          if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            userDetails.isPersonalityTestCompleted = true;
            await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
          }
          setModalVisible(true);
        }
      } else {
        Toast.show({
          type: "info",
          text1: "Info",
          text2: "You are offline",
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
          },
        });
      }
    } catch (error) {
      console.error("Error in generateJSON:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedValues, answeredCount, saveResponses]);

  const loadMoreData = useCallback(() => {
    if (isFetchingMore || visibleData.length >= data.length) return;
    setIsFetchingMore(true);
    setTimeout(() => {
      const currentLength = visibleData.length;
      const nextData = data.slice(currentLength, currentLength + itemsPerPage);
      setVisibleData((prevData) => [...prevData, ...nextData]);
      setIsFetchingMore(false);
    }, 1000);
  }, [isFetchingMore, visibleData, data]);

  const progressPercentage = data.length > 0 ? Math.floor((answeredCount / data.length) * 100) : 0;
  const progressPercentage1 = data.length > 0 ? answeredCount / data.length : 0;
  const textLeftPosition = 3 + progressPercentage1 * 100;

  const calculateDataRight = (textLeftPosition) => {
    const roundedPosition = Math.floor(textLeftPosition);
    const minPosition = 20;
    const maxPosition = 103;
    const minDataRight = 0;
    const maxDataRight = -80;
    const clampedPosition = Math.max(minPosition, Math.min(maxPosition, roundedPosition));
    return Math.round(maxDataRight + ((clampedPosition - maxPosition) / (minPosition - maxPosition)) * (minDataRight - maxDataRight));
  };

  const RenderItem = memo(({ item, index }) => {
    const sortedOptions = item.answerOptions.sort((a, b) => a.score - b.score);
    return (
      <View style={styles.frameFlexBox}>
        <View style={[styles.youRegularlyMakeNewFriendsParent, styles.youParentSpaceBlock]}>
          <Text style={[styles.youRegularlyMake, styles.personalityTypo]}>{item.question}</Text>
          <RadioButton.Group
            onValueChange={(value) => handleSelection(item.id, value, item.facet)}
            value={selectedValues[item.id]?.score || null}
          >
            <View style={styles.radioContainer}>
              {sortedOptions.map((option) => (
                <View style={styles.radioItem} key={option.score}>
                  <TouchableOpacity
                    onPress={() => handleSelection(item.id, option.score, item.facet)}
                    style={[
                      styles.radioButton,
                      {
                        backgroundColor: selectedValues[item.id]?.score === option.score ? "rgba(132, 164, 2, 1)" : "white",
                        borderColor: selectedValues[item.id]?.score === option.score ? "rgba(176, 219, 2, 0.12)" : "white",
                      },
                    ]}
                  >
                    {selectedValues[item.id]?.score === option.score && (
                      <View style={styles.radioInnerCircle} />
                    )}
                  </TouchableOpacity>
                  {(option.score === 1 || option.score === 5) && (
                    <Text style={styles.radioText}>{option.option}</Text>
                  )}
                </View>
              ))}
            </View>
          </RadioButton.Group>
        </View>
      </View>
    );
  });

  const renderItem = ({ item, index }) => <RenderItem item={item} index={index} />;

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      {isFetchingMore && <ActivityIndicator size="small" color={Colors.secondary} style={{ marginVertical: 20 }} />}
      <Text style={styles.disclaimerText}>
        * This survey is private and strictly confidential only to support crew wellbeing, not performance review or employment decisions.
      </Text>
      <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Loader isLoading={loading} />
      <CustomLottie type="fullscreen" />
      <ResultModal visible={modalVisible} setModalVisible={setModalVisible} navigation={navigation} />
      <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30}>
        <View style={styles.blurContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Personality Map</Text>
            {!isRequired > 0 && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkipBtn}>
                <Text style={styles.skipText}>Skip</Text>
                <Image
                  style={styles.skipIcon}
                  source={require("../../../src/assets/images/AnotherImage/arrow-right.png")}
                />
              </TouchableOpacity>
            )} 
          </View>
          <Text style={{marginHorizontal:10,marginVertical:5,fontFamily:'Poppins-Regular',fontSize:12,color:'black'}}>This personality map helps you understand your unique traits, behaviour, and way of thinking</Text>
         
          <ProgressBar
            progress={progressPercentage1}
            color="rgba(132, 164, 2, 1)"
            style={styles.progressBar}
          />
           <Text style={styles.mandatoryText}>
            {diffDays < 0
              ? "Personality map test is now mandatory. This test is not being used to profile the candidate and affect his employability."
              : `Personality map test will become mandatory in ${diffDays} days. This test is not being used to profile the candidate and affect his employability.`}
          </Text>
          <View style={[styles.progressTooltip, { left: `${textLeftPosition}%`, transform: [{ translateX: calculateDataRight(textLeftPosition) }] }]}>
            <Text style={styles.progressText}>{progressPercentage}%</Text>
          </View>
          <View style={styles.bottomContainer}>
            <View style={styles.divider} />
            <View style={styles.testProgress}>
              <Text style={styles.personalityTest}>{answeredCount}/{data.length}</Text>
            </View>
            <FlatList
              ref={flatListRef}
              data={visibleData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMoreData}
              onEndReachedThreshold={0.7}
              ListFooterComponent={renderFooter}
              style={styles.flatList}
            />
          </View>
        </View>
      </BlurView>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  blurContainer: {
    flex: 1,
    backgroundColor: "rgba(215, 215, 215, 0.9)",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  headerText: {
    fontSize: 20,
    lineHeight: 22,
    color: "#161616",
    fontFamily: "WhyteInktrap-Bold",
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  skipText: {
    fontSize: 14,
    color: "grey",
    fontFamily: "Poppins-Medium",
  },
  skipIcon: {
    height: 14,
    width: 14,
    tintColor: "grey",
    marginLeft: 4,
  },
  mandatoryText: {
    marginHorizontal: 10,
    marginVertical: 10,
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginTop:55,
    color: "#808080",
  },
  progressBar: {
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 6,
    height: 9,
  },
  progressTooltip: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 5,
    position: "absolute",
    top: 125,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    color: "#000",
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  bottomContainer: {
    backgroundColor: "#00000066",
    height: "67%",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  divider: {
    height: 3,
    width: "20%",
    backgroundColor: "#FFFFFF66",
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 10,
  },
  testProgress: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  personalityTest: {
    lineHeight: 17,
    color: "#fff",
    fontSize: 16,
    fontFamily: "WhyteInktrap-Medium",
    textTransform: "capitalize",
  },
  flatList: {
    marginBottom: 10,
  },
  footerContainer: {
    paddingBottom: 20,
  },
  disclaimerText: {
    marginHorizontal: 20,
    marginVertical: 20,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    fontStyle: "italic",
    color: "#fff",
  },
  nextButton: {
    height: 50,
    width: "90%",
    backgroundColor: "#fff",
    marginBottom: 10,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  nextButtonText: {
    color: "#06361F",
    fontSize: 18,
    fontWeight: "bold",
  },
  frameFlexBox: {
    gap: 8,
    marginTop: 10,
    marginHorizontal: 15,
  },
  youRegularlyMakeNewFriendsParent: {
    gap: 16,
    paddingVertical: 24,
    borderRadius: 16,
    alignSelf: "stretch",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  youRegularlyMake: {
    lineHeight: 19,
    fontSize: 16,
    textAlign: "left",
    color: "#fff",
    fontFamily: "WhyteInktrap-Bold",
    textTransform: "capitalize",
  },
  personalityTypo: {
    lineHeight: 25,
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: -10,
  },
  radioItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginBottom: 20,
    marginVertical: 10,
  },
  radioButton: {
    width: 25,
    height: 25,
    borderRadius: 15,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  radioText: {
    fontSize: 11,
    color: "#fff",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    marginBottom: -30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default Mbti_Test_2;