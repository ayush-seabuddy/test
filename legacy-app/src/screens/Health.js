import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  Platform,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
import HealthHeader from "../component/headers/HealthHeader";
import HelpLineCrad from "../component/Cards/HealthCards/HelpLineCrad";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import AssessmentTestCard from "../component/Cards/HealthCards/AssessmentTestCard";
import EmergencyModal from "../component/Modals/EmergencyModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../Api";
import { useFocusEffect } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import axios from "axios";
import UnifiedContentCard from "../component/Cards/CommonScrollCard";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ImagesAssets } from "../assets/ImagesAssets";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");
const isProMax = height >= 926;

const Health = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [testData, setTestData] = useState(null);
  const [data, setData] = useState(null);
  const [showAllAssessments, setShowAllAssessments] = useState(false);
  const [visibleCards, setVisibleCards] = useState([false, false, false, false]);
  const [categoryList, setCategoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileDetails, setProfileDetails] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [locale, setlocale] = useState('');
  const { t } = useTranslation();
  let initialLng = "en";
  const loadPersistedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem("userLanguage");
      if (saved === "en" || saved === "zh") {
        initialLng = saved;
        setlocale(initialLng);
        return;
      }
    } catch (e) {
      console.warn("Failed to load saved language", e);
    }

    const device = Localization.getLocales()[0]?.languageTag || "en";
    initialLng = device.startsWith("zh") ? "zh" : "en";
  };
  const toggleAssessments = useCallback(() => {
    setShowAllAssessments((prev) => !prev);
    setVisibleCards((prev) => (prev[0] ? [false, false, false, false] : [true, true, true, true]));
  }, []);

  const viewProfileDetails = useCallback(async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      const response = await apiCallWithToken(
        `${apiServerUrl}/user/viewUserProfile`,
        "GET",
        null,
        userDetails.authToken
      );
      if (response.responseCode === 200) {
        setProfileDetails(response.result);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getAssessment = useCallback(async () => {
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
        const offlineData = await firestore().collection("assessmentResults").doc(token).get();
        if (offlineData.exists) {
          setApiData(offlineData.data().result);
        }
        await firestore()
          .collection("assessmentResults")
          .doc(token)
          .set({ flag: 0, timestamp: new Date().toISOString() }, { merge: true });
      }
    } catch (err) {
      console.log("Error", err);
    }
  }, []);

  const getUserDetails = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("userDetails");
      const parsedData = JSON.parse(userData);
      setTestData(parsedData.isPersonalityTestCompleted);
    } catch (error) { }
  }, []);

  const fetchUserList = useCallback(
    async (department) => {
      try {
        setIsLoading(true);
        const dbResult = await AsyncStorage.getItem("userDetails");
        const userDetails = JSON.parse(dbResult);

        const result = await apiCallWithToken(
          `${apiServerUrl}/content/getAllContents?subCategory=${department}`,
          "GET",
          null,
          userDetails.authToken
        );

        if (result.responseCode === 200) {
          setData((prev) => ({
            ...prev,
            [department]: result.result || [],
          }));
        }
      } catch (error) {
        console.log(`API Error for ${department}:`, error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchCategory = useCallback(async () => {
    try {
      setIsLoading(true);
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);

      const result = await apiCallWithToken(
        `${apiServerUrl}/content/getAllCategory`,
        "GET",
        null,
        userDetails.authToken
      );

      if (result.responseCode === 200) {
        setCategoryList(result.result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const ViewUserTest = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) return null;

      const userDetails = JSON.parse(dbResult);
      console.log('====================================');
      console.log(userDetails);
      console.log('====================================');
      const fetchWithTimeout = (url, method, body, token, timeout = 3000) => {
        return Promise.race([
          apiCallWithToken(url, method, body, token), // API Call
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
          ),
        ]);
      };

      const requestUrl = `${apiServerUrl}/user/viewUserTest`;

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

  // useEffect(() => {
  //   ViewUserTest().then((result) => {
  //     setTestArray(result);
  //   });
  // }, []);
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
          apiCallWithToken(url, method, body, token), // API Call
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
  //     setCustomSurvey(customSurveysList)
  //     result.forEach((item) => {
  //       if (item.type === "HAPPINESS_INDEX") {
  //         setHappinessData(item)
  //       } else if (item.type === "POMS") {
  //         setPomsData(item)
  //       } else if (item.type === "PERSONALITY") {
  //         setPersonalityData(item)
  //       }
  //     })
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


  useFocusEffect(
    useCallback(() => {
      loadPersistedLanguage();
      viewProfileDetails();
      getAssessment();
      fetchCategory();
    }, [viewProfileDetails, getAssessment, fetchCategory])
  );

  useEffect(() => {
    getUserDetails();
  }, [getUserDetails]);

  useEffect(() => {
    if (categoryList.length > 0) {
      categoryList.forEach((item) => fetchUserList(item.id));
    }
  }, [categoryList, fetchUserList]);

  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = useMemo(
    () => currentDate.toLocaleString(locale || "en", { month: "long" }),
    [currentDate, locale]
  );
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th'; // covers 11th–13th
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const lastDayOfMonth = useMemo(() => {
    const day = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    return day;
  }, [currentDate]);

  const ordinalSuffix = getOrdinalSuffix(lastDayOfMonth);


  const handleHappinessPress = useCallback(() => {
    navigation.navigate(
      testArray && testArray[0]?.open ? "HappinessIndex" : "AllAssessmentTest",
      { assessmentType: "HAPPINESS", showPopup: testArray && testArray[0]?.isRequires }
    );
  }, [navigation, profileDetails]);

  const handlePOMSPress = useCallback(() => {
    navigation.navigate(
      testArray && testArray[1]?.open ? "POMSTest" : "AllAssessmentTest",
      { assessmentType: "POMS", showPopup: testArray && testArray[1]?.isRequires }
    );
  }, [navigation, profileDetails]);

  const handleCategoryPress = useCallback(
    (item) => {
      navigation.navigate("ShowAllContent", {
        data: data?.[item?.id].allContents || data?.[item?.id],
        headerName: item?.Name,
        contentSubCategory: item?.id,
      });
    },
    [navigation, data]
  );

  return (
    <View style={styles.container}>
      <EmergencyModal
        navigation={navigation}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      <HealthHeader navigation={navigation} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 14 }}>
          <HelpLineCrad navigation={navigation} />
        </View>

        <View style={styles.openerContainer}>
          <TouchableOpacity
            style={styles.assessmentBox}
            onPress={toggleAssessments}
            activeOpacity={0.7}
          >
            <View style={styles.rowBetween}>
              <View style={[styles.row, { alignItems: "center" }]}>
                <Text style={styles.sectionTitle}>{t('myassessments')}</Text>
                {(profileDetails?.isPOMSAssessment || profileDetails?.isHappinessIndex) && (
                  <Image
                    style={[styles.frameItem, { tintColor: "red", marginLeft: 15, marginBottom: 5, width: 14, height: 14 }]}
                    resizeMode="cover"
                    source={ImagesAssets.warningImage}
                  />
                )}
              </View>
              <Image
                style={[styles.icon, { height: 18, width: 18, marginRight: 10 }]}
                source={showAllAssessments ? ImagesAssets.arrow_up_icon : ImagesAssets.arrow_icon}
              />
            </View>

            <Text style={styles.subText}>
              {t('myassessments_description')}
            </Text>

            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={[styles.tagText, testArray && testArray[0]?.open ? { color: "red" } : {}]}>
                  {t('monthlyhappinessindex')}
                </Text>
              </View>
              <View style={styles.tag}>
                <Text style={[styles.tagText, testArray && testArray[1]?.open ? { color: "red" } : {}]}>
                  {t('monthlywellbeingpulse')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 14 }}>
          {visibleCards[0] && (
            <View style={{ marginBottom: 15 }}>
              <AssessmentTestCard navigation={navigation} data={testData} ApiData={apiData} testArray={testArray} />
            </View>
          )}

          {visibleCards[1] && (
            <View style={{ marginBottom: 15 }}>
              <Pressable style={styles.frameParent} onPress={handleHappinessPress}>
                <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
                  <Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.Happiness} />
                  <View style={[styles.frameContainer, styles.frameFlexBox]}>
                    <View style={styles.personalityMapParent}>
                      <View style={styles.row}>
                        <Text
                          style={[styles.personalityMap, { color: testArray && testArray[0]?.open ? '#06361f' : 'grey' }]}
                        >
                          {t('monthlyhappinessindex')}
                        </Text>
                      </View>

                      <View style={[styles.musicWrapper, styles.frameGroupFlexBox]}>
                        <Text style={[styles.music, { color: "#444444", fontSize: 10, lineHeight: 16 }]}>
                          {t('monthlyhappinessindex_description')}
                        </Text>
                      </View>

                      {testArray && testArray[0]?.open && (
                        <Pressable style={styles.happinessFormbutton} onPress={handleHappinessPress}>
                          <View style={[styles.tag, { flexDirection: "row", alignItems: "center" }]}>
                            <Image style={[styles.frameItem, { tintColor: "#f45050" }]} resizeMode="cover" source={ImagesAssets.warningImage} />
                            <Text style={[styles.music, { color: "#f45050", fontSize: 10, lineHeight: 15, paddingHorizontal: 8 }]}>
                              {t("submitbefore", { currentMonth: currentMonth })}
                            </Text>
                          </View>
                        </Pressable>
                      )}
                    </View>
                    <View style={styles.iconBox}>
                      <Image style={styles.frameItem} resizeMode="cover" source={ImagesAssets.baseicon2} />
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          )}

          {visibleCards[2] && (
            <View style={{ marginBottom: 15 }}>
              <Pressable style={styles.frameParent} onPress={handlePOMSPress}>
                <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
                  <Image style={styles.frameChild} resizeMode="cover" source={ImagesAssets.POMS} />
                  <View style={[styles.frameContainer, styles.frameFlexBox]}>
                    <View style={styles.personalityMapParent}>
                      <View style={styles.row}>
                        <Text
                          style={[styles.personalityMap, { color: testArray && testArray[1]?.open ? '#06361f' : 'grey' }]}
                        >
                          {t('monthlywellbeingpulse')}
                        </Text>
                      </View>

                      <View style={styles.musicWrapper}>
                        <Text style={[styles.music, { color: "#444444", fontSize: 10, lineHeight: 16, width: "100%" }]}>
                          {t('monthlywellbeingpulse_description')}
                        </Text>
                      </View>

                      {testArray && testArray[1]?.open && (
                        <Pressable style={styles.happinessFormbutton} onPress={handlePOMSPress}>
                          <View style={[styles.tag, { flexDirection: 'row', alignItems: 'center' }]}>
                            <Image style={[styles.frameItem, { tintColor: "#f45050" }]} resizeMode="cover" source={ImagesAssets.warningImage} />
                            <Text style={[styles.music, { color: "#f45050", fontSize: 10, lineHeight: 15, paddingHorizontal: 8 }]}>
                              Submit before {currentMonth} {lastDayOfMonth}{ordinalSuffix}
                            </Text>
                          </View>
                        </Pressable>
                      )}
                    </View>
                    <View style={styles.iconBox}>
                      <Image style={styles.frameItem} resizeMode="cover" source={ImagesAssets.baseicon2} />
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          )}



          {/* {customSurvey?.length > 0 && visibleCards[3] && (
            customSurvey.map((survey, index) => (
              <View key={index} style={{ marginBottom: 15 }}>
                <Pressable
                  style={styles.frameParent}
                  onPress={() =>
                    navigation.navigate("CustomSurvey",
                      { surveyId: survey?.id }
                    )
                  }
                >
                  <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
                    <Image
                      style={styles.frameChild}
                      resizeMode="cover"
                      src={survey.image} // Fallback image
                    />
                    <View style={[styles.frameContainer, styles.frameFlexBox]}>
                      <View style={styles.personalityMapParent}>
                        <View style={styles.row}>
                          <Text
                            style={[
                              styles.personalityMap,
                              { color: survey?.open ? '#06361f' : 'grey' },
                            ]}
                            numberOfLines={1}
                          >
                            {survey?.title || 'Custom Survey'}
                          </Text>
                        </View>

                        <View style={[styles.musicWrapper, styles.frameGroupFlexBox]}>
                          <Text
                            style={[
                              styles.music,
                              { color: '#444444', fontSize: 10, lineHeight: 16 },
                            ]}
                            numberOfLines={3}
                          >
                            {survey?.description || 'No description available'}
                          </Text>
                        </View>

                        {survey?.isAlert && (
                          <Pressable
                            style={styles.happinessFormbutton}
                            onPress={() =>
                              navigation.navigate("CustomSurvey",
                                { surveyId: survey?.id }
                              )}
                          >
                            <View style={[styles.tag, { flexDirection: 'row', alignItems: 'center' }]}>
                              <Image
                                style={[styles.frameItem, { tintColor: '#f45050' }]}
                                resizeMode="cover"
                                source={ImagesAssets.warningImage}
                              />
                              <Text
                                style={[
                                  styles.music,
                                  {
                                    color: '#f45050',
                                    fontSize: 10,
                                    lineHeight: 15,
                                    paddingHorizontal: 8,
                                  },
                                ]}
                              >
                                {survey?.alertMessage || 'Take the survey now!'}
                              </Text>
                            </View>
                          </Pressable>
                        )}
                      </View>
                      <View style={styles.iconBox}>
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
            ))
          )} */}
        </View>

        {categoryList?.map((item, index) => {
          if (!data?.[item?.id]?.allContents?.length) return null;

          return (
            <View key={index + item.id}>
              <View style={{ paddingHorizontal: 15 }}>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.categoryTitle}>{item?.Name?.split("(")[0]}</Text>
                    {item?.Name?.split("(")[1] && (
                      <Text style={styles.categorySub}>
                        {item?.Name?.split("(")[1]?.split(")")[0]}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity onPress={() => handleCategoryPress(item)}>
                    <Ionicons name="chevron-forward" size={20} color="#404040" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 16 }}
                style={{ marginBottom: 20, marginTop: 10 }}
              >
                <UnifiedContentCard
                  navigation={navigation}
                  data={data?.[item?.id] || {}}
                  headerName={item?.Name || ""}
                />
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  assessmentBox: {
    margin: 15,
    paddingHorizontal: 14,
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    paddingVertical: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    lineHeight: 24,
    fontSize: isProMax ? 22 : 20,
    fontWeight: "500",
    color: Colors.green,
    fontFamily: "WhyteInktrap-Medium",
  },
  subText: {
    fontSize: isProMax ? 12 : 10,
    lineHeight: 18,
    fontWeight: "500",
    color: "#333333",
    fontFamily: "Poppins-Regular",
    paddingRight: 30,
    marginTop: 5,
  },
  tagContainer: { flexDirection: "row", gap: 5, marginTop: 10, alignItems: "center" },
  tag: { backgroundColor: "#f5f5f5", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 5 },
  tagText: { fontFamily: "Poppins-Regular", fontSize: 10, fontWeight: "500", color: "#333333" },
  frameGroupFlexBox: { alignItems: "center", flexDirection: "row" },
  frameFlexBox: { alignItems: "center", flexDirection: "row" },
  frameChild: { borderRadius: 25, width: 70, height: 70 },
  personalityMap: {
    fontSize: isProMax ? 14 : 12,
    lineHeight: 18,
    fontWeight: "500",
    fontFamily: "Poppins-SemiBold",
    color: "#1e1f1e",
    textAlign: "left",
  },
  music: { fontSize: 8, lineHeight: 10, fontFamily: "Poppins-Regular", color: "#fff", textAlign: "left" },
  musicWrapper: { borderRadius: 32 },
  personalityMapParent: { gap: 4, flex: 1 },
  frameItem: { width: 12, height: 12 },
  frameContainer: { gap: 8, flex: 1 },
  frameGroup: { gap: 16, alignSelf: "stretch" },
  frameParent: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  iconBox: { backgroundColor: "white", padding: 8, borderRadius: 8 },
  happinessFormbutton: { flexDirection: "row", borderRadius: 5 },
  categoryTitle: {
    lineHeight: 24,
    fontSize: isProMax ? 16 : 15,
    fontWeight: "500",
    fontFamily: "Poppins-SemiBold",
    color: "#404040",
  },
  categorySub: {
    lineHeight: 24,
    fontSize: isProMax ? 13 : 12,
    fontWeight: "500",
    fontFamily: "Poppins-Regular",
    color: "#404040",
  },
});

export default Health;