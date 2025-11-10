import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import VedioCard from "../component/Cards/VedioCard";
import ProfileSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import UpcomingEventCard from "../component/Cards/HealthCards/UpcomingEventCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../Api";
import Colors from "../colors/Colors";
import { useFocusEffect } from "@react-navigation/native";
import MusicCard from "../component/Cards/personaResultCards/MusicCard";
import LottieView from "lottie-react-native";
import WeeklyMeetingCard from "../component/Cards/WeeklyMeetingCard";
import axios from "axios";
import CustomLottie from "../component/CustomLottie";
import CompanyHeader from "../component/headers/ProfileHeader/CompanyHeader";

const { width, height } = Dimensions.get("window");
const PublicScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [TestData, setTestData] = useState(null);
  const [Data, setData] = useState(null);
  const [Announcement, setAnnouncement] = useState([]);
  const [loading, setLoading] = useState(false);

  isNoData = () => {
    let isEmpty = true;
    if (Data) {
      ["ANNOUNCEMENT", "MUSIC", "READ", "VIDEO"].forEach(item => {
        if (Data[item]?.length > 0) {
          isEmpty = false;
        }
      });
    }
    return isEmpty;
  };

  const GetUserDetails = async () => {
    try {
      const UserData = await AsyncStorage.getItem("userDetails");
      const mydata = JSON.parse(UserData);
      setTestData(mydata.isPersonalityTestCompleted);
    } catch (error) { }
  };
  React.useEffect(() => {
    GetUserDetails();
  }, []);


  const fetchUserList = async (department) => {
    
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      const result = await apiCallWithToken(
        `${apiServerUrl}/content/getAllContents?contentCategory=COMPANY_LIBRARY&contentType=${department}&limit=100`,
        "GET",
        null,
        userDetails.authToken
      );

      if (result.responseCode === 200) {
        setData((preData) => ({
          ...preData,
          [department]: result.result.allContents,
        }));
      }
    } catch (error) {
      console.log(
        `API Error for ${department}:`,
        error.response?.data || error.message
      );
    }
  };


  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      ["ANNOUNCEMENT", "MUSIC", "READ", "VIDEO"].forEach(fetchUserList);
      setLoading(false);
      return () => console.log("Screen unfocused");
    }, [])
  );

  return (
    <>
      <CompanyHeader navigation={navigation} title="Company Library" />

      <View style={{ flex: 1, marginTop: 20 }}>
        
        {/* {!loading && isNoData() && (
          <View style={styles.emptyContainer}>
            <Image
              style={{ height: 80, width: 80 }}
              source={require("../assets/images/AnotherImage/no-content.png")}
            />
            <Text style={styles.emptyText}>No Data Found</Text>
          </View>
        )} */}
        {Data ? (
          <>
            <ScrollView>
              {Data.ANNOUNCEMENT && Data.ANNOUNCEMENT.length > 0 ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginVertical: 10,
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: 22,
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        fontFamily: "WhyteInktrap-Medium",
                      }}
                    >
                      Bulletin
                    </Text>
                  </View>

                  <WeeklyMeetingCard
                    announcement={Data.ANNOUNCEMENT}
                    keyId={"PublicScreen"}
                    showSurvey={false}
                  />

                </>
              ) : null}

              {Data?.VIDEO?.length > 0 && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginVertical: 10,
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: 22,
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        fontFamily: "WhyteInktrap-Medium",
                      }}
                    >
                      Watch
                    </Text>
                    {Data.VIDEO.length > 3 && (
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate("ShowAllVideo", {
                            data: Data,
                          });
                        }}
                      >
                        <Ionicons name="chevron-forward" size={20} color="black"/>
                      </TouchableOpacity>
                    )}
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 16 }}
                    style={{ marginBottom: 20 }}
                  >
                    <VedioCard
                      navigation={navigation}
                      data={Data.VIDEO || {}}
                      keyId={"Home"}
                      type={"COMPANY_LIBRARY"}
                    />
                  </ScrollView>
                </>
              )}

              {Data?.MUSIC && Data.MUSIC.length > 0 ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginVertical: 10,
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: 22,
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        fontFamily: "WhyteInktrap-Medium",
                      }}
                    >
                      Listen
                    </Text>
                    {Data?.MUSIC?.length > 3 ? (
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate("ShowAllMusic", { data: Data });
                        }}
                      >
                       <Ionicons name="chevron-forward" size={20} color="black"/>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={{ paddingHorizontal: 14, marginBottom: 20 }}>
                    {Data ? (
                      <MusicCard
                        navigation={navigation}
                        data={Data?.MUSIC || {}}
                      />
                    ) : null}
                  </View>
                </>
              ) : null}

              {Data.READ && Data.READ.length > 0 ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginVertical: 10,
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text
                      style={{
                        lineHeight: 22,
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        fontFamily: "WhyteInktrap-Medium",
                      }}
                    >
                      Read
                    </Text>
                    {Data?.READ?.length > 3 ? (
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate("ShowAllActivity", {
                            data: Data,
                          });
                        }}
                      >
                        <Ionicons name="chevron-forward" size={20} color="black"/>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingLeft: 16,
                      paddingBottom: 40,
                    }}
                  >
                    {Data ? (
                      // <VedioCard navigation={navigation}  />
                      <UpcomingEventCard
                        navigation={navigation}
                        data={Data.READ || {}}
                        fetchUserList={fetchUserList}
                      />
                    ) : null}
                    {/* {[...Array(4)].map((_, index) => (
            <View key={index} style={{ marginRight: 12 }}>
              <UpcomingEventCard navigation={navigation} />
            </View>
          ))} */}
                  </ScrollView>
                </>
              ) : null}
            </ScrollView>
            <View
              style={{
                // flex: 1,
                backgroundColor: "#c1c1c1",
                overflow: "hidden",
                height: "50%",
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                zIndex: -1,
                // flexBasis: 200,
                position: "absolute",
                bottom: 0,
              }}
            >
              <CustomLottie customSyle={{
                width: width * 1,
                height: height * 0.68,
                borderTopLeftRadius: 50,
                borderTopRightRadius: 50,
              }} />
            </View>
          </>
        ) : (
          <>
            <View
              style={{
                flex: 1,
                width: width,
                height: height,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                style={{ height: 150, width: 150 }}
                source={require("../assets/images/AnotherImage/no-content.png")}
              />
              <Text
                style={{
                  fontSize: 20,
                  color: "gray",
                  fontFamily: "Poppins-Regular",
                }}
              >
                No data Found
              </Text>
            </View>
            <View
              style={{
                // flex: 1,
                backgroundColor: "#c1c1c1",
                overflow: "hidden",
                height: "50%",
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                zIndex: -1,
                // flexBasis: 200,
                position: "absolute",
                bottom: 0,
              }}
            >
              <CustomLottie customSyle={{
                width: width * 1,
                height: height * 0.68,
                borderTopLeftRadius: 50,
                borderTopRightRadius: 50,
              }} />
            </View>
          </>
        )}
      </View>
    </>
  );
};

export default PublicScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    // overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "40%",
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 40,
  },
  lottieBackground: {
    width: width * 1,
    height: height * 0.68,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    // position: "absolute",
    // bottom: 0,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: "90%",
    borderRadius: 10,
  },
  leftIcon: {
    marginRight: 10,
    marginLeft: 15,
  },
  rightIcon: {
    marginRight: 15,
  },
  textInput: {
    color: "#000",
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    textAlignVertical: "center",
    height: 50,
    flexBasis: 200,
    flexGrow: 1,
    flexShrink: 1,
    // borderWidth
  },
  errorText: {
    fontSize: 14,
    color: "red",
    marginHorizontal: 20,
    marginTop: 3,
    fontFamily: "Poppins-Regular",
  },
  strengthBox: {
    marginTop: 10,
    width: "80%",
    height: 10,
    borderRadius: 5,
  },
  strengthText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 10,
  },
  strengthContainer: {
    flexDirection: "row",
    marginTop: 10,
    width: "40%",
    height: 10,
    // borderRadius: 5,
    marginLeft: 20,
    marginVertical: 10,
    overflow: "hidden", // Ensure the blocks stay inside the container
  },
  strengthBlock: {
    flex: 1,
    height: "100%",
    marginHorizontal: 2,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.5,
    paddingVertical: 30,
    width,
  },
});