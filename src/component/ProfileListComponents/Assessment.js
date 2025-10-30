import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import AssessmentTestCard from "../Cards/HealthCards/AssessmentTestCard";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../../Api";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

const { height, width } = Dimensions.get("screen");
const isProMax = height >= 926;

const Assessment = ({ navigation }) => {
  const [TestData, setTestData] = useState(null);
  const [ApiData, setApiData] = useState(null);
  const [profiledetails, setProfiledetails] = useState();

  const ViewProfiledetails = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      const response = await apiCallWithToken(
        `${apiServerUrl}/user/viewUserProfile`,
        "GET",
        null,
        userDetails.authToken
      );
      if (response.responseCode === 200) {
        setProfiledetails(response.result);
        if (response.result?.companyLogo) {
          userDetails.companyLogo = response?.data?.result?.companyLogo;
        }
        if (response.result?.companyName) {
          userDetails.companyName = response?.data?.result?.companyName;
        }
        if (response.result?.companyDescription) {
          userDetails.companyDescription = response?.data?.result?.companyDescription;
        }
        await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("en-US", { month: "long" });
  // Utility for proper ordinal suffix
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th"; // Handles 11th, 12th, 13th
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  // Determine last day of month
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const ordinalSuffix = getOrdinalSuffix(lastDayOfMonth);

  useEffect(() => {
    ViewProfiledetails();
    GetAssessment();
  }, []);

  const GetUserDetails = async () => {
    try {
      const UserData = await AsyncStorage.getItem("userDetails");
      const mydata = JSON.parse(UserData);
      setTestData(mydata.isPersonalityTestCompleted);
    } catch (error) { }
  };

  const GetAssessment = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const netInfo = await NetInfo.fetch();

      if (netInfo.isConnected) {
        const res = await axios.get(
          `${apiServerUrl}/user/getAssessmentResult?questionType=PERSONALITY`,
          { headers: { authToken: token } }
        );
        if (res?.data?.responseCode === 200) {
          setApiData(res.data.result.data);
        }
      } else {
        const offlineData = await firestore()
          .collection("assessmentResults")
          .doc(token)
          .get();
        if (offlineData.exists) {
          setApiData(offlineData.data().result);
        }
        await firestore()
          .collection("assessmentResults")
          .doc(token)
          .set(
            { flag: 0, timestamp: new Date().toISOString() },
            { merge: true }
          );
      }
    } catch (err) {
      console.log("Error", err);
    }
  };

  React.useEffect(() => {
    GetUserDetails();
  }, []);

  const ViewUserTest = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) return null;
      console.log("dbResult: ", dbResult);

      const userDetails = JSON.parse(dbResult);

      const fetchWithTimeout = (url, method, body, token, timeout = 3000) => {
        return Promise.race([
          apiCallWithToken(url, method, body, token),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
          ),
        ]);
      };

      const requestUrl = `${apiServerUrl}/user/viewUserTest`;
      console.log("requestUrl: ", requestUrl);

      const response = await fetchWithTimeout(
        requestUrl,
        "GET",
        null,
        userDetails.authToken,
        3000
      );
      if (response.responseCode === 200) {
        return response.result;
      }

      return [];
    } catch (error) {
      console.error("Error fetching profile details:", error);
      return [];
    }
  };

  const [testArray, setTestArray] = useState([]);

  useFocusEffect(
    useCallback(() => {
      ViewUserTest().then((result) => {
        setTestArray(result);
      });
    }, [setTestArray]))

  const ViewUserTestList = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) return null;

      const userDetails = JSON.parse(dbResult);

      const fetchWithTimeout = (url, method, body, token, timeout = 3000) => {
        return Promise.race([
          apiCallWithToken(url, method, body, token),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
          ),
        ]);
      };

      const requestUrl = `${apiServerUrl}/user/viewUserTestList`;

      const response = await fetchWithTimeout(
        requestUrl,
        "GET",
        null,
        userDetails.authToken,
        3000
      );
      if (response.responseCode === 200) {
        return response.result;
      }

      return [];
    } catch (error) {
      console.error("Error fetching profile details:", error);
      return [];
    }
  };

  const [testArrayList, setTestArrayList] = useState([]);
  const [happinessData, setHappinessData] = useState({});
  const [pomsData, setPomsData] = useState({});
  const [personalityData, setPersonalityData] = useState({});
  const [customSurvey, setCustomSurvey] = useState([]);

  // useEffect(() => {
  //   ViewUserTestList().then((result) => {
  //     setTestArrayList(result);
  //     let customSurveysList = result.filter((item) => item.type === "CUSTOM_SURVEY");
  //     setCustomSurvey(customSurveysList);
  //     result.forEach((item) => {
  //       if (item.type === "HAPPINESS_INDEX") {
  //         setHappinessData(item);
  //       } else if (item.type === "POMS") {
  //         setPomsData(item);
  //       } else if (item.type === "PERSONALITY") {
  //         setPersonalityData(item);
  //       }
  //     });
  //   });
  // }, []);


  useFocusEffect(
    useCallback(() => {
      ViewUserTestList().then((result) => {
        setTestArrayList(result);
        let customSurveysList = result.filter((item) => item.type === "CUSTOM_SURVEY");
        setCustomSurvey(customSurveysList)
        result.forEach((item) => {
          if (item.type === "HAPPINESS_INDEX") {
            setHappinessData(item)
          } else if (item.type === "POMS") {
            setPomsData(item)
          } else if (item.type === "PERSONALITY") {
            setPersonalityData(item)
          }
        })
      });
    }, [])
  );
  return (
    <View style={{ paddingTop: 10, backgroundColor: "white", marginBottom: 80 }}>
      <View style={{ paddingHorizontal: 14 }}>
        <View style={{ marginBottom: 15 }}>
          <AssessmentTestCard
            navigation={navigation}
            data={TestData}
            ApiData={ApiData}
            testArray={testArray}
          />
        </View>
      </View>
      <View style={{ paddingHorizontal: 14, marginBottom: 15 }}>
        <Pressable
          style={styles.frameParent}
          onPress={() => {
            navigation.navigate(
              testArray && testArray[0]?.open
                ? "HappinessIndex"
                : "AllAssessmentTest",
              {
                assessmentType: "HAPPINESS",
                showPopup: testArray && testArray[0]?.isRequires,
              }
            );
          }}
        >
          <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
            <Image
              style={styles.frameChild}
              resizeMode="cover"
              source={ImagesAssets.Happiness}
            />
            <View style={[styles.frameContainer, styles.frameFlexBox]}>
              <View style={[styles.personalityMapParent]}>
                <Text
                  style={[
                    styles.personalityMap,
                    {
                      color: testArray && testArray[0]?.open ? "#06361f" : "grey",
                    },
                  ]}
                >
                  Monthly Happiness Index
                </Text>
                <View style={[styles.musicWrapper, styles.frameGroupFlexBox]}>
                  <Text
                    style={[
                      styles.music,
                      { color: "#444444", fontSize: 9, lineHeight: 14 },
                    ]}
                  >
                    Contribute to global insights that shape a better future for all
                    seafarers.
                  </Text>
                </View>
                <View style={[styles.frameView, styles.frameFlexBox]}>
                  {testArray && testArray[0]?.open && (
                    <Pressable
                      style={styles.happinessFormbutton}
                      onPress={() =>
                        navigation.navigate(
                          testArray && testArray[0]?.open
                            ? "HappinessIndex"
                            : "AllAssessmentTest",
                          {
                            assessmentType: "HAPPINESS",
                            showPopup: testArray && testArray[0]?.isRequires,
                          }
                        )
                      }
                    >
                      <View
                        style={[
                          styles.tag,
                          { flexDirection: "row", alignItems: "center" },
                        ]}
                      >
                        <Image
                          style={[styles.frameItem, { tintColor: "#f45050" }]}
                          resizeMode="cover"
                          source={ImagesAssets.warningImage}
                        />
                        <Text
                          style={[
                            styles.music,
                            {
                              color: "#f45050",
                              fontSize: 10,
                              lineHeight: 15,
                              paddingHorizontal: 8,
                            },
                          ]}
                        >
                          Submit before {currentMonth} 15th
                        </Text>
                      </View>
                    </Pressable>
                  )}
                </View>
              </View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <Image
                  style={styles.frameItem}
                  resizeMode="cover"
                  source={ImagesAssets.baseicon2}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 14, marginBottom: 15 }}>
        <Pressable
          style={styles.frameParent}
          onPress={() => {
            navigation.navigate(
              testArray && testArray[1]?.open ? "POMSTest" : "AllAssessmentTest",
              {
                assessmentType: "POMS",
                showPopup: testArray && testArray[1]?.isRequires,
              }
            );
          }}
        >
          <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
            <Image
              style={styles.frameChild}
              resizeMode="cover"
              source={ImagesAssets.POMS}
            />
            <View style={[styles.frameContainer, styles.frameFlexBox]}>
              <View style={[styles.personalityMapParent]}>
                <Text
                  style={[
                    styles.personalityMap,
                    {
                      color: testArray && testArray[1]?.open ? "#06361f" : "grey",
                    },
                  ]}
                >
                  Monthly Wellbeing Pulse
                </Text>
                <View style={[styles.musicWrapper]}>
                  <Text
                    style={[
                      styles.music,
                      {
                        color: "#444444",
                        fontSize: 9,
                        lineHeight: 14,
                        width: "100%",
                      },
                    ]}
                  >
                    Your monthly self check-in
                  </Text>
                </View>
                {testArray && testArray[1]?.open && (
                  <Pressable
                    style={styles.happinessFormbutton}
                    onPress={() => {
                      navigation.navigate(
                        testArray && testArray[1]?.open
                          ? "POMSTest"
                          : "AllAssessmentTest",
                        {
                          assessmentType: "POMS",
                          showPopup: testArray && testArray[1]?.isRequires,
                        }
                      );
                    }}
                  >
                    <View
                      style={[
                        styles.tag,
                        { flexDirection: "row", alignItems: "center" },
                      ]}
                    >
                      <Image
                        style={[styles.frameItem, { tintColor: "#f45050" }]}
                        resizeMode="cover"
                        source={ImagesAssets.warningImage}
                      />
                      <Text
                        style={[
                          styles.music,
                          {
                            color: "#f45050",
                            fontSize: 10,
                            lineHeight: 15,
                            paddingHorizontal: 8,
                          },
                        ]}
                      >
                        Submit before {currentMonth} {lastDayOfMonth}
                        {ordinalSuffix}
                      </Text>

                    </View>
                  </Pressable>
                )}
              </View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <Image
                  style={styles.frameItem}
                  resizeMode="cover"
                  source={ImagesAssets.baseicon2}
                />
              </View>
            </View>
          </View>
        </Pressable>
      </View>
      {customSurvey?.length > 0 && (
        <View style={{ paddingHorizontal: 14, marginBottom: 15 }}>
          {customSurvey.map((survey, index) => (
            <View key={index} style={{ marginBottom: 15 }}>
              <Pressable
                style={styles.frameParent}
                onPress={() =>
                  navigation.navigate("CustomSurvey", { surveyId: survey?.id })
                }
              >
                <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
                  <Image
                    style={styles.frameChild}
                    resizeMode="cover"
                    src={survey.image || ImagesAssets.Happiness} // Fallback image
                  />
                  <View style={[styles.frameContainer, styles.frameFlexBox]}>
                    <View style={[styles.personalityMapParent]}>
                      <Text
                        style={[
                          styles.personalityMap,
                          { color: survey?.open ? "#06361f" : "grey" },
                        ]}
                        numberOfLines={1}
                      >
                        {survey?.title || "Seafarers' Well-Being Survey"}
                      </Text>
                      <View style={[styles.musicWrapper, styles.frameGroupFlexBox]}>
                        <Text
                          style={[
                            styles.music,
                            { color: "#444444", fontSize: 9, lineHeight: 14 },
                          ]}
                          numberOfLines={3}
                        >
                          {survey?.description || "Help us understand the mental and emotional well-being of seafarers. Your responses will contribute to creating a happier and healthier life at sea."}
                        </Text>
                      </View>
                      {survey?.isAlert && (
                        <Pressable
                          style={styles.happinessFormbutton}
                          onPress={() =>
                            navigation.navigate("CustomSurvey", {
                              surveyId: survey?.id,
                            })
                          }
                        >
                          <View
                            style={[
                              styles.tag,
                              { flexDirection: "row", alignItems: "center" },
                            ]}
                          >
                            <Image
                              style={[styles.frameItem, { tintColor: "#f45050" }]}
                              resizeMode="cover"
                              source={ImagesAssets.warningImage}
                            />
                            <Text
                              style={[
                                styles.music,
                                {
                                  color: "#f45050",
                                  fontSize: 10,
                                  lineHeight: 15,
                                  paddingHorizontal: 8,
                                },
                              ]}
                            >
                              {survey?.alertMessage || "Take the survey now!"}
                            </Text>
                          </View>
                        </Pressable>
                      )}
                    </View>
                    <View
                      style={{
                        backgroundColor: "white",
                        padding: 8,
                        borderRadius: 8,
                      }}
                    >
                      <Image
                        style={styles.frameItem}
                        resizeMode="cover"
                        source={ImagesAssets.baseicon2}
                      />
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  frameGroupFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  happinessFormbutton: { flexDirection: "row", borderRadius: 5 },
  frameFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  tag: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  frameChild: {
    borderRadius: 20,
    width: 64,
    height: 64,
  },
  personalityMap: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    fontFamily: "Poppins-SemiBold",
    color: "#161616",
    textAlign: "left",
    alignSelf: "stretch",
  },
  music: {
    fontSize: 8,
    lineHeight: 10,
    fontFamily: "Poppins-Regular",
    color: "#fff",
    textAlign: "left",
  },
  musicWrapper: {
    borderRadius: 32,
  },
  frameView: {
    gap: 4,
    alignSelf: "stretch",
  },
  personalityMapParent: {
    gap: 4,
    flex: 1,
  },
  frameItem: {
    width: 12,
    height: 12,
  },
  frameContainer: {
    gap: 8,
    flex: 1,
  },
  frameGroup: {
    gap: 16,
    alignSelf: "stretch",
  },
  frameParent: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    borderRadius: 10,
    alignSelf: "stretch",
  },
  statusText: {
    marginTop: 5,
    color: "#06361F",
  },
  link: {
    color: "#B0DB02",
  },
});

export default Assessment;