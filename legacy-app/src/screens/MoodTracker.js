import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "@react-native-community/blur";
import NetInfo from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MonthPicker from 'react-native-month-year-picker';
import { Modal } from "react-native-paper";
import Toast from "react-native-toast-message";
import AntDesign from "react-native-vector-icons/AntDesign";
import { apiCallWithToken, apiCallWithTokenPost, apiServerUrl } from "../Api";
import { FontFamily } from "../GlobalStyle";
import { ImagesAssets } from "../assets/ImagesAssets";
import Colors from "../colors/Colors";
import CustomLottie from "../component/CustomLottie";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";

const { height, width } = Dimensions.get("screen");

const MoodTracker = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moodData, setMoodData] = useState(null);
  const [monthlyMoodAverage, setmonthlyMoodAverage] = useState(null);
  const [monthlyMoodAverage1, setmonthlyMoodAverage1] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [feeling, setfeeling] = useState("");
  const [Because, setBecause] = useState("");
  const [ReasonText, setReasonText] = useState("");
  const [details, setDetails] = useState([]);
  const [fullName, setfullName] = useState("");
  const [isloading, setIsloading] = useState(false);

  const scrollViewRef = useRef(null);

  const renderItem = ({ item }) => (
    <View
      style={{
        backgroundColor: "rgba(180, 180, 180, 0.4)",
        padding: 15,
        borderRadius: 12,
        marginVertical: 5,
        overflow: "hidden",
        marginHorizontal: 14,
      }}
    >
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={30}
        reducedTransparencyFallbackColor="white"
      />
      <View
        style={{
          width: "100%",
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            style={styles.imageEmogiIcon}
            source={getMoodEmoji(item.mood)}
          />
          <View style={{ flexDirection: "column", marginLeft: 10 }}>
            <Text
              style={{
                lineHeight: 28,
                fontSize: 18,
                fontWeight: "500",
                color: "#262626",
                fontFamily: "WhyteInktrap-Bold",
              }}
            >
              {item?.mood || ""}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: "#636363",
                fontFamily: "Poppins-Regular",
              }}
            >
              {moment(item.createdAt).format("DD MMM YYYY")}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ paddingHorizontal: 10 }}>
        {item?.details && <View style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 15, color: "black" }}>Note : {item?.details}</Text>
        </View>}
      </View>
    </View>
  );

  useEffect(() => {
    const selectResult = async () => {
      try {
        const dbResult = await AsyncStorage.getItem("userDetails");
        var Data = JSON.parse(dbResult);
        setfullName(Data.fullName);
      } catch (err) {
        throw err;
      }
    };
    selectResult();
  }, []);

  const moodPopUp = [
    { emoji: require("../assets/images/Emoji_1.png"), label: "Happy" },
    { emoji: require("../assets/images/Emoji_5.png"), label: "Anxious" },
    { emoji: require("../assets/images/Emoji_3.png"), label: "Sad" },
    { emoji: require("../assets/images/Emoji_4.png"), label: "Angry" },
    { emoji: require("../assets/images/Emoji_2.png"), label: "Calm" },
  ];

  const resetModal = () => {
    setStep(1);
    setMoodData(null);
    setBecause("");
    setReasonText("");
    setfeeling("");
  };

  const handleClose = () => {
    setIsloading(false);
    resetModal();
    hideModal();
  };

  const handleSubmit = async () => {
    setIsloading(true);
    const token = await AsyncStorage.getItem("authToken");
    const body = JSON.stringify({
      moodTrackers: [
        {
          mood: selectedMood.toUpperCase(),
          feeling: feeling,
          reason: Because,
          details: ReasonText,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    var response = await apiCallWithTokenPost(
      apiServerUrl + "/user/moodTracker",
      token,
      body
    );
    if (response.responseCode === 200) {
      Toast.show({
        type: "success",
        // text1: "Success",
        text1: "Mood Note Added Successfully",
        autoHide: true,
        visibilityTime: 2000,
        text1Style: {
          fontFamily: "WhyteInkTrap-Bold",
          fontSize: 16,
          color: "#000",
          paddingTop: 10,
        },
        text2Style: {
          fontFamily: "Poppins-Regular",
          fontSize: 14,
          color: "#000",
          paddingTop: 10,
        },
      });
      const date = new Date();
      const todayDate = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const userDetailsString = await AsyncStorage.getItem("userDetails");
      if (userDetailsString) {
        const userDetails = JSON.parse(userDetailsString);
        userDetails.isMoodTracker = true;
        userDetails.lastMoodDate = todayDate;
        setIsTodayData(true)
        await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
      }
      handleClose();
      const selectedMonth = currentDate.getMonth() + 1;
      const selectedYear = currentDate.getFullYear();
      fetchMoodData(selectedMonth, selectedYear);
    } else {
      Toast.show({
        type: "error",
        text1: "error",
        text2: response.responseMessage,
        autoHide: true,
        visibilityTime: 2000,
        text1Style: {
          fontFamily: "WhyteInkTrap-Bold",
          fontSize: 16,
          color: "#000",
          paddingTop: 10,
        },
        text2Style: {
          fontFamily: "Poppins-Regular",
          fontSize: 14,
          color: "#000",
          paddingTop: 10,
        },
      });
    }
    handleClose();
  };




  const moodOptions = [
    { label: "Feeling Happy 😊", value: "happy" },
    { label: "Excited 🎉", value: "excited" },
    { label: "Grateful 🙏", value: "grateful" },
    { label: "Motivated 🚀", value: "motivated" },
    { label: "Calm 😌", value: "calm" },
    { label: "Relaxed 🌿", value: "relaxed" },
    { label: "Hopeful 🌈", value: "hopeful" },
    { label: "Just Okay 🤷‍♂️", value: "okay" },
    { label: "Bored 😐", value: "bored" },
    { label: "Tired 😴", value: "tired" },
    { label: "Stressed 😟", value: "stressed" },
    { label: "Anxious 😬", value: "anxious" },
    { label: "Sad 😢", value: "sad" },
    { label: "Frustrated 😡", value: "frustrated" },
  ];
  const contextOptions = [
    { label: "Work Pressure", value: "work_pressure" },
    { label: "Deadlines", value: "deadlines" },
    { label: "Achievements", value: "achievements" },
    { label: "Workplace Environment", value: "workplace_environment" },
    { label: "Family", value: "family" },
    { label: "Relationships", value: "relationships" },
    { label: "Health", value: "health" },
    { label: "Financial Matters", value: "financial_matters" },
    { label: "Friends", value: "friends" },
    { label: "Events/Parties", value: "events_parties" },
    { label: "Social Media", value: "social_media" },
    { label: "Community", value: "community" },
    { label: "Lack of Sleep", value: "lack_of_sleep" },
    { label: "Overworking", value: "overworking" },
    { label: "Exercise/Health Activities", value: "exercise_health" },
    { label: "Travel/Commute", value: "travel_commute" },
    { label: "Weather", value: "weather" },
    { label: "Unexpected Situations", value: "unexpected_situations" },
    { label: "Personal Growth", value: "personal_growth" },
    { label: "Uncertain Feelings", value: "uncertain_feelings" },
  ];
  const DropdownField = ({
    label,
    options = [],
    selectedValue = "",
    onValueChange = () => { },
    error = "",
    placeholder = "Select an option",
  }) => (
    <View style={styles.dropdownContainer}>
      <View style={styles.dropdownRow}>
        <Image style={styles.icon} source={ImagesAssets.info_icon} />
        <Picker
          selectedValue={selectedValue}
          onValueChange={(value) => {
            if (value !== undefined) onValueChange(value);
          }}
          style={styles.picker}
          dropdownIconColor="#949494"
          mode={Platform.OS === "ios" ? "dropdown" : "dialog"}
        >
          <Picker.Item
            label={placeholder || "Select an option"}
            value=""
            style={{
              fontFamily: "Poppins-Regular",
              fontSize: 16,
              color: "#949494",
            }}
          />
          {(options ?? []).map((option, index) =>
            option?.value !== undefined ? (
              <Picker.Item
                key={index}
                label={option.label}
                value={option.value}
                style={{
                  fontFamily: "Poppins-Regular",
                  fontSize: 16,
                  color: "#000",
                }}
              />
            ) : null
          )}
        </Picker>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderStep = () => {
    const getGreeting = () => {
      const currentHour = new Date().getHours();

      if (currentHour >= 5 && currentHour < 12) {
        return "Good Morning";
      } else if (currentHour >= 12 && currentHour < 18) {
        return "Good Afternoon";
      } else if (currentHour >= 18 && currentHour < 22) {
        return "Good Evening";
      } else {
        return "Hello";
      }
    };


    switch (step) {
      case 1:
        return (
          <View
            style={{
              overflow: "hidden",
              borderTopRightRadius: 32,
              borderTopLeftRadius: 32,
            }}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={30}
              reducedTransparencyFallbackColor="white"
            />
            <View style={styles.stepContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
              <View style={{ marginVertical: 15 }}>
                <Text style={[styles.greeting]}>
                  {getGreeting()}{" "}
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#262626",
                      fontFamily: "Poppins-SemiBold",
                    }}
                  >
                    {fullName ? fullName.charAt(0).toUpperCase() + fullName.slice(1) : ""}!
                  </Text>
                </Text>
                <Text style={[styles.greetingMain]}>
                  How're you feeling today?
                </Text>
              </View>
              <View style={styles.moodContainer}>
                {moodPopUp.map((mood, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.moodButton,
                      {
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      selectedMood?.label === mood.label && styles.selectedMood,
                    ]}
                    onPress={() => {
                      setSelectedMood(mood.label);
                      setStep(2);
                    }}
                  >
                    <Image
                      source={mood.emoji}
                      style={{ height: 50, width: 50, marginHorizontal: 5 }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "rgba(52, 52, 52, 1)",
                        fontFamily: "Poppins-SemiBold",
                        lineHeight: 19.2,
                      }}
                    >
                      {mood.label.charAt(0).toUpperCase() + mood.label.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <TouchableOpacity
            style={{
              overflow: "hidden",
              borderTopRightRadius: 32,
              borderTopLeftRadius: 32,
              flex: 1,
            }}
            activeOpacity={1}
            onPress={() => Keyboard.dismiss()}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={30}
              reducedTransparencyFallbackColor="white"
            />
            <View style={[styles.stepContainer]}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
              {/* <Text style={[styles.greeting]}>
                {getGreeting()}{" "}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#262626",
                    fontFamily: "Poppins-SemiBold",
                  }}
                >
                  Your notes will be saved privately and can be viewed anytime in the Mood Tracker on the Health page
                </Text>
              </Text> */}
              <Text style={styles.greetingMain}>
                Would you like to share some details?
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "gray",
                  fontFamily: "Poppins-Regular",
                  marginBottom: 10,
                }}
              >
                Your notes will be saved privately and can be viewed anytime in the Mood Tracker on the Health page
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your thoughts here..."
                value={ReasonText}
                onChangeText={(value) => setReasonText(value)}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                {isloading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
    }
  };

  const today = new Date();

  const getFormattedDates = (year, month) => {
    const dates = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayMoment = moment(today);
    const currentWeek = todayMoment.isoWeek(); // Get the current week of the year

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateMoment = moment(date);
      const isCurrentWeek = dateMoment.isoWeek() === currentWeek && dateMoment.year() === todayMoment.year();

      dates.push({
        fullDate: date.toDateString(),
        date: date.getDate(),
        month: date.toLocaleString("default", { month: "short" }),
        day: date.toLocaleString("default", { weekday: "short" }),
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
        isCurrentWeek: isCurrentWeek,
      });
    }
    return dates;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const newMonth = newDate.getMonth();
    const newYear = newDate.getFullYear();

    // Only allow setting the new date if it is not in the future
    if (newYear < currentYear || (newYear === currentYear && newMonth <= currentMonth)) {
      setCurrentDate(newDate);
    }
  };

  const dates = getFormattedDates(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );


  useEffect(() => {
    if (scrollViewRef.current && dates.length > 0) {
      const firstDayOfCurrentWeekIndex = dates.findIndex((d) => d.isCurrentWeek);
      if (firstDayOfCurrentWeekIndex !== -1) {
        // Assuming each date item is 55px wide (45px width + 10px margin)
        const offset = firstDayOfCurrentWeekIndex * 55;
        scrollViewRef.current.scrollTo({ x: offset, animated: true });
      }
    }
  }, [dates]);

  const todayIndex = dates.findIndex((d) => d.isToday);

  const fetchMoodData = async (month, year) => {

    const token = await AsyncStorage.getItem("authToken");
    const docId = `moodData_${year}_${month}`;
    const docRef = firestore().collection("moodData").doc(docId);
    try {
      const connectivity = await NetInfo.fetch();
      setIsloading(true);
      if (connectivity.isConnected) {
        const result = await apiCallWithToken(
          `${apiServerUrl}/user/getMoodTrackerAnalysis?month=${month}&year=${year}`,
          "GET",
          null,
          token
        );
        if (result.responseCode === 200) {
          setIsloading(false);
          const moodTrackers = result?.result?.monthlyMoodTrackers || null;
          setDetails(result?.result?.lastFiveDaysMoodTracker);
          const moodAverage = mapMoodData(
            result?.result?.monthlyMoodAverage || {}
          );
          setMoodData(moodTrackers);
          setmonthlyMoodAverage(moodAverage);
          await docRef.set(
            {
              month: month || null,
              year: year || null,
              moodTrackers: moodTrackers || null,
              moodAverage: moodAverage || null,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } else {
        setIsloading(false);
        const snapshot = await docRef.get();
        if (snapshot.exists) {
          const data = snapshot.data();
          setMoodData(data.moodTrackers || null);
          setmonthlyMoodAverage(data.moodAverage || {});
        } else {
          console.warn("No offline data found for this month and year.");
          setMoodData(null);
          setmonthlyMoodAverage({});
        }
      }

    } catch (error) {
      console.error("Error fetching mood data:", error);
      const snapshot = await docRef.get();
      setIsloading(false);
      if (snapshot.exists) {

        const data = snapshot.data();
        setMoodData(data.moodTrackers || null);
        setmonthlyMoodAverage(data.moodAverage || {});
      } else {
        console.warn("No offline data found for this month and year.");
        setMoodData(null);
        setmonthlyMoodAverage({});
      }

    } finally {
      setIsloading(false);
    }
  };

  const mapMoodData = (monthlyMoodAverage) => {
    const moodMap = {
      HAPPY: {
        mood: "HAPPY",
        color: "#B0DB0266",
        emoji: require("../assets/images/Emoji_1.png"),
      },
      SAD: {
        mood: "SAD",
        color: "#DB8F0266",
        emoji: require("../assets/images/Emoji_3.png"),
      },
      CALM: {
        mood: "CALM",
        color: "#B0DB0266",
        emoji: require("../assets/images/Emoji_2.png"),
      },
      ANGRY: {
        mood: "ANGRY",
        color: "#E5424566",
        emoji: require("../assets/images/Emoji_4.png"),
      },
      ANXIOUS: {
        mood: "ANXIOUS",
        color: "#69BEDC66",
        emoji: require("../assets/images/Emoji_5.png"),
      },
    };
    const mappedMoods = Object.keys(monthlyMoodAverage).map((mood) => {
      const progress = parseFloat(monthlyMoodAverage[mood]);
      return {
        mood: moodMap[mood]?.mood || null,
        progress: progress / 100,
        color: moodMap[mood]?.color || "#FFFFFF",
        emoji: moodMap[mood]?.emoji || null,
      };
    });

    setmonthlyMoodAverage1(mappedMoods);
  };

  useEffect(() => {
    const selectedMonth = currentDate.getMonth() + 1;
    const selectedYear = currentDate.getFullYear();
    fetchMoodData(selectedMonth, selectedYear);
  }, [currentDate]);

  const getMoodEmoji = (mood) => {
    const moodImages = {
      HAPPY: require("../assets/images/Emoji_1.png"),
      SAD: require("../assets/images/Emoji_3.png"),
      CALM: require("../assets/images/Emoji_2.png"),
      ANGRY: require("../assets/images/Emoji_4.png"),
      ANXIOUS: require("../assets/images/Emoji_5.png"),
    };
    return moodImages[mood] || require("../assets/images/Emoji_1.png");
  };

  const DatewiseList = ({ item, moodData }) => {
    var matchingMood;
    if (moodData && moodData.length > 0) {
      moodData.forEach((element) => {
        const formattedDate = moment(element.createdAt).format("DD");
        if (String(item.date).padStart(2, "0") === formattedDate) {
          matchingMood = element;
        }
      });
    }
    return (
      <View style={[styles.dateItem]}>
        <Text style={[styles.dateText1, { marginTop: 10 }]}>{item.day}</Text>
        <View
          style={{
            backgroundColor: item.isToday ? "#B0DB02" : "#fff",
            height: 25,
            width: 25,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 10,
          }}
        >
          <Text style={[styles.dateText1]}>{item.date}</Text>
        </View>
        {matchingMood ? (
          <Image
            style={{ height: 30, width: 30, marginBottom: 10 }}
            source={getMoodEmoji(matchingMood.mood)}
          />
        ) : null}
      </View>
    );
  };

  const sleepData = [
    { date: "11 Oct", deepSleep: 0.3, normalSleep: 0.4, totalHours: "6hr" },
    { date: "12 Oct", deepSleep: 0.2, normalSleep: 0.2, totalHours: "8hr" },
    { date: "13 Oct", deepSleep: 0.4, normalSleep: 0.6, totalHours: "5hr" },
    { date: "14 Oct", deepSleep: 0.3, normalSleep: 0.6, totalHours: "7hr" },
    { date: "15 Oct", deepSleep: 0.9, normalSleep: 0.1, totalHours: "8hr" },
  ];

  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {
    backgroundColor: "white",
    width: "100%",
    position: "absolute",
    bottom: 0,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
  };

  const moods = [
    {
      progress: 0.65,
      color: "#B0DB0266",
      emoji: require("../assets/images/Emoji_1.png"),
    },
    {
      progress: 0.95,
      color: "#69BEDC66",
      emoji: require("../assets/images/Emoji_5.png"),
    },
    {
      progress: 0.3,
      color: "#DB8F0266",
      emoji: require("../assets/images/Emoji_3.png"),
    },
    {
      progress: 0.15,
      color: "#E5424566",
      emoji: require("../assets/images/Emoji_4.png"),
    },
    {
      progress: 0.65,
      color: "#A5A5A566",
      emoji: require("../assets/images/Emoji_2.png"),
    },
  ];

  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event, selectedDate) => {


    setShowPicker(false);
    if (selectedDate) {
      // setIsloading(true);
      const newDate = new Date(selectedDate);
      setCurrentDate(newDate);
    }
  };

  const [isTodayData, setIsTodayData] = useState();



  useEffect(() => {
    const date = new Date();
    const todayDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const fetchData = async () => {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const Data = JSON.parse(dbResult);
      const today = moment().format("YYYY-MM-DD");


      const lastMoodDate = Data.lastMoodDate
      if (Data.lastMoodDate &&today == lastMoodDate)
        setIsTodayData(Data.isMoodTracker);
      else if(!Data.lastMoodDate)
         setIsTodayData(Data.isMoodTracker);
    }

    fetchData()

  }, []);





  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <View style={styles.container}>
        {/* {isloading == true && <Loader />} */}
        {/* <View style={{ position: "absolute", top: "50%", right: 0, left: 0 }}>
          <Spinner visible={isloading} size="large" color="#000" />
        </View> */}

        {/* <Loader isLoading={isloading} />  */}
        <ProfleSettingHeader navigation={navigation} title="Mood Tracker" />
        <FocusAwareStatusBar
          barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
          backgroundColor={Colors.white}
          hidden={false}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 200, minHeight: height }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              backgroundColor: "rgba(180, 180, 180, 0.6)",
              marginHorizontal: 14,
              marginTop: 15,
              borderRadius: 30,
              padding: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 10,
                marginHorizontal: 10,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: "#000",
                  lineHeight: 22,
                  fontSize: 22,
                  paddingTop: 4,
                  fontFamily: "WhyteInktrap-Bold",
                  textTransform: "capitalize",
                }}
              >
                Hi, {fullName?.split(" ")[0]}!
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                  <AntDesign name="left" size={22} color={Colors.green} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowPicker(true)}>
                  <Text
                    style={{
                      color: "#000",
                      fontSize: 12,
                      fontWeight: "600",
                      marginHorizontal: 10,
                    }}
                    onPress={() => setShowPicker(true)}
                  >
                    {currentDate.toLocaleString("default", { month: "short" })}{" "}
                    {currentDate.getFullYear()}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                  <AntDesign name="right" size={22} color={Colors.green} />
                </TouchableOpacity>


              </View>
            </View>
            <View style={{ marginHorizontal: 10, marginTop: 10 }}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}
              >
                {dates.map((item, index) => (
                  <DatewiseList key={index} item={item} moodData={moodData} />
                ))}
              </ScrollView>
            </View>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginHorizontal: 10,
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                onPress={showModal}
                style={{
                  backgroundColor: isTodayData == true ? "#777" : "#000",
                  height: 50,
                  width: "100%",
                  marginBottom: 15,
                  borderRadius: 8,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                disabled={isTodayData}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontFamily: "Poppins-SemiBold",
                  }}
                >
                  {isTodayData == true ? "Already Checked in Today" : "Check In Today"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "rgba(180, 180, 180, 0.4)",
              padding: 20,
              marginVertical: 15,
              borderRadius: 35,
              overflow: "hidden",
              marginHorizontal: 14,
            }}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={30}
              reducedTransparencyFallbackColor="white"
            />
            <View style={styles.header}>
              <Text style={styles.title}>Monthly Mood Chart</Text>

              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 4, paddingVertical: 4, borderRadius: 8, backgroundColor: "#B0DB02" }} onPress={() => setShowPicker(true)}>
                <Text style={{ color: "#000", fontSize: 12, fontWeight: "600" }}>
                  {currentDate.toLocaleString("default", { month: "short" })}{" "}
                  {currentDate.getFullYear()}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              {(monthlyMoodAverage1 || []).map((mood, index) => (
                <View key={index}>
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.filledBar,
                        { flex: mood.progress, backgroundColor: mood.color },
                      ]}
                    />
                    <View
                      style={[styles.unfilledBar, { flex: 1 - mood.progress }]}
                    />
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Image source={mood.emoji} style={styles.emoji} />
                    <Text style={styles.percentageText}>
                      {Math.round(mood.progress * 100)}%
                    </Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "#000", fontSize: 10, fontFamily: "poppins-regular" }}>{mood.mood}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          {details.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginHorizontal: 20,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  lineHeight: 28,
                  fontSize: 20,
                  color: "#B7B7B7",
                  fontFamily: "WhyteInktrap-Bold",
                  marginBottom: 4,
                }}
              >
                Mood Notes
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("MoodTrackerHistory");
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#B7B7B7",
                    fontWeight: "400",
                    fontFamily: FontFamily.captionC10Regular,
                  }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={details}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </ScrollView>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={containerStyle}
        >
          <View>{renderStep()}</View>
        </Modal>
        <View
          style={{
            backgroundColor: "#c1c1c1",
            overflow: "hidden",
            height: "70%",
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            zIndex: -2,
            position: "absolute",
            bottom: 0,
            pointerEvents: "none",
          }}
        >
          <CustomLottie
            customSyle={{
              width: width * 1,
              height: height * 0.68,
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
            }}
          />
        </View>
        {/* { showPicker && <RNModal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        > */}
        {/* <View style={styles.modalContainers}> */}
        {/* <View style={styles.modalContent}> */}
        {/* <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Month and Year</Text>
                        <TouchableOpacity
                          onPress={() => setShowPicker(false)}
                          style={styles.closeButton}
                        >
                          <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View> */}
        {showPicker && <MonthPicker
          value={currentDate}
          onChange={onChange}
          mode="full" // Ensure full mode for better visibility
          minimumDate={new Date(2000, 0, 1)}
          locale="en"
          style={styles.monthPicker}
          maximumDate={new Date()}
        />}
        {/* </View> */}
        {/* </View> */}
        {/* </RNModal>} */}
      </View>
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default MoodTracker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  dateItem: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginRight: 10,
    borderRadius: 30,
    width: 45,
    alignItems: "center",
  },
  dateText1: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
  },
  title: {
    lineHeight: 22,
    fontSize: 18,
    color: "#262626",
    fontFamily: "WhyteInktrap-Bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  progressContainer: {
    width: 20,
    height: 150,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 10,
    flexDirection: "column-reverse",
    alignItems: "center",
  },
  filledBar: {
    width: "100%",
    borderRadius: 30,
  },
  unfilledBar: {
    backgroundColor: "#F0F0F0CC",
    width: "100%",
  },
  emoji: {
    height: 26,
    width: 26,
    marginTop: -10,
  },
  percentageText: {
    marginTop: 5,
    fontSize: 14,
    color: "#161616",
    fontWeight: "bold",
    textAlign: "center",
  },
  imageEmogiIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    margin: 5,
  },
  stepContainer: {
    backgroundColor: "#FFFFFFCC",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    bottom: 0,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    paddingRight: 20,
  },
  closeButtonText: {
    fontSize: 35,
    color: "#929292",
  },
  greeting: {
    fontSize: 16,
    fontWeight: "400",
    color: "#262626",
    marginTop: 10,
    fontFamily: "Poppins-Regular",
  },
  greetingMain: {
    fontSize: 22,
    fontWeight: "600",
    color: "#262626",
    fontFamily: "Poppins-SemiBold",
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  moodButton: {},
  selectedMood: {
    backgroundColor: "#e0e0e0",
    borderWidth: 2,
    borderColor: "#02130B",
  },
  input: {
    width: width * 0.9,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    paddingHorizontal: 10,
    fontFamily: "Poppins-Regular",
    zIndex: 5,
    backgroundColor: "#fff",
    marginVertical: 20,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    height: 18,
    width: 18,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#636363",
    fontFamily: "Poppins-Regular",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalContainers: {  // <-- singular here to match usage
    flex: 1,
    width: width,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: 'center', // Add this for center alignment horizontally
  }
});