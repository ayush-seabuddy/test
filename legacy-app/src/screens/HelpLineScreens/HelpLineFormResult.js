import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  TextInput,
  Platform,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import ImagePicker from "react-native-image-crop-picker";

import HelpLineFormHeader from "../../component/headers/HelpLineScreensHeader/HelpLineFormHeader";
import DateTimePicker from "@react-native-community/datetimepicker";
import { apiCallWithToken, apiServerUrl } from "../../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RadioButton } from "react-native-paper";
import moment from "moment";
import Toast from "react-native-toast-message";
import CustomLottie from "../../component/CustomLottie";
const { width, height } = Dimensions.get("window");

const HelpLineFormResult = ({ navigation, route }) => {
  const { dataType } = route.params;
  const [loading, setLoading] = useState(false);
  const [appointmentReason, setAppointmentReason] = useState("");
  const [date, setDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState("Set date & Time");
  const [selectedImage, setSelectedImage] = useState(null);
  const [ListData, setListData] = useState([]);
  const [responses, setResponses] = useState({});
  const [showPicker, setShowPicker] = useState(null);
  const [selectedDates, setSelectedDates] = useState({});
  const [selectedTime, setSelectedTime] = useState({});
  const [FormattedData, setFormattedData] = useState([]);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [status, setStatus] = useState("");


  const GetData = useCallback(async () => {
    const authToken = await AsyncStorage.getItem("authToken");
    try {
      setLoading(true);
      const response = await apiCallWithToken(
        apiServerUrl +
        `/helpline/getOneHelplineFormAnswers?helplineFormId=${dataType}`,
        "GET",
        null,
        authToken
      );

      if (response.responseCode) {
        const allHelplineForms = response.result.helplineAnswers;
        const AdminResponsess = response.result.adminResponse;
        const status = response.result.status

        setAdminResponse(AdminResponsess);
        setStatus(status);
        // Extract unique questions and set ListData
        const questionMap = new Map();
        allHelplineForms.forEach((form) => {
          questionMap.set(form.helplineQuestion.id, form.helplineQuestion);
        });
        setListData(Array.from(questionMap.values()));

        // Prefill responses, selectedDates, and selectedTime
        const initialResponses = {};
        const initialSelectedDates = {};
        const initialSelectedTime = {};

        allHelplineForms.forEach((form) => {
          const questionId = form.helplineQuestion.id;
          const answerValue = form.answer;
          initialResponses[questionId] = answerValue;

          if (form.helplineQuestion.answerType === "Date") {
            initialSelectedDates[questionId] = answerValue;
          } else if (form.helplineQuestion.answerType === "Time") {
            // Convert 12-hour format to 24-hour format
            const timeIn24HourFormat = convertTo24HourFormat(answerValue);
            initialSelectedTime[questionId] = answerValue
          }
        });

        setResponses(initialResponses);
        setSelectedDates(initialSelectedDates);
        setSelectedTime(initialSelectedTime);
        setLoading(false);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
      setLoading(false);
    }
  }, [dataType]);

  useEffect(() => {
    GetData();
  }, [GetData]);

  // Store all answers dynamically
  const handleInputChange = useCallback(
    (questionId, value) => {
      setResponses((prev) => {
        const updatedResponses = { ...prev, [questionId]: value };

        // Convert responses to the required format
        const formattedResponses = Object.entries(updatedResponses).map(
          ([id, answer]) => ({
            helplineQuestionId: id,
            answer: answer.toString(),
            createdAt: new Date().toISOString(), // Current timestamp in ISO format
          })
        );

        setFormattedData(formattedResponses);

        // Check if all fields are filled
        const allFieldsFilled = ListData.every((item) =>
          updatedResponses.hasOwnProperty(item.id)
        );
        setIsFormComplete(allFieldsFilled);

        return updatedResponses;
      });
    },
    [ListData]
  );

  const handleDateChange = useCallback(
    (event, date, id) => {
      if (date) {
        setShowPicker(null);
        const formattedDate = moment(date).format("DD/MMM/YYYY");
        setSelectedDates((prev) => ({ ...prev, [id]: formattedDate }));
        handleInputChange(id, formattedDate);
      }
      setShowPicker(null);
    },
    [handleInputChange]
  );

  // Toggle Date Picker
  const toggleDatePicker = useCallback((id) => {
    setShowPicker((prev) => (prev === id ? null : id));
  }, []);

  const toggleTimePicker = (id) => {
    setShowPicker((prevId) => (prevId === id ? null : id));
  };

  const handleTimeChange = (event, time, id) => {
    if (event.type === "set" && time instanceof Date) {
      setShowPicker(null);
      setSelectedTime((prevTimes) => ({
        ...prevTimes,
        [id]: time, // Store the Date object
      }));
      const _time = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      handleInputChange(id, _time);
    }
    setShowPicker(null); // Hide the picker after selection
  };

  const formatTime = (time) => {
    if (!(time instanceof Date)) return "";
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const convertTo24HourFormat = (time12hr) => {
    const [time, modifier] = time12hr.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "pm" && hours !== "12") {
      hours = parseInt(hours, 10) + 12;
    }
    if (modifier === "am" && hours === "12") {
      hours = "00";
    }
    return `${hours}:${minutes}`;
  };

  const renderList = useMemo(
    () =>
      ({ item, index }) => {
        return (
          <View style={styles.contentContainer}>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: 10,
                padding: 16,
                marginHorizontal: 10,
                marginVertical: 10,
              }}
            >
              <Text style={styles.label}>
                {index + 1}. {item.question}
              </Text>
              {item.answerType === "Textfield" && (
                <TextInput
                  style={{
                    backgroundColor: "#fff",
                    padding: 8,
                    borderRadius: 8,
                    height: 50,
                    fontFamily: "Poppins-Regular",
                    fontSize: 15,
                  }}
                  editable={false}
                  placeholder={"Enter your answer"}
                  value={responses[item.id] || ""}
                  onChangeText={(value) => handleInputChange(item.id, value)}
                />
              )}
              {item.answerType === "Textarea" && (
                <TextInput
                  style={{
                    backgroundColor: "#fff",
                    padding: 8,
                    borderRadius: 8,
                    fontFamily: "Poppins-Regular",
                    fontSize: 15,
                    textAlignVertical: "top",
                  }}
                  editable={false}
                  placeholder={"Enter your answer"}
                  value={responses[item.id] || ""}
                  multiline
                  onChangeText={(value) => handleInputChange(item.id, value)}
                />
              )}
              {item.answerType === "Radio" && (
                <RadioButton.Group
                  onValueChange={(value) => handleInputChange(item.id, value)}
                  value={responses[item.id] || ""}
                >
                  {item.answerOptions.map((option, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 0, // Increased space between radio buttons
                        // backgroundColor: "red",
                        paddingVertical: 2,
                      }}
                    >
                      <RadioButton.Android
                        value={option}
                        color="#B0DB02"
                        disabled={true}
                      />
                      <Text
                        style={{
                          marginLeft: 8,
                          color: "#000",
                          fontSize: 15,
                          width: "85%",
                        }}
                      >
                        {option}
                      </Text>
                    </View>
                  ))}
                </RadioButton.Group>
              )}
              {item.answerType === "Date" && (
                <>
                  <TouchableOpacity
                    onPress={() => toggleDatePicker(item.id)}
                    disabled
                  >
                    <TextInput
                      style={{
                        backgroundColor: "#fff",
                        padding: 8,
                        borderRadius: 8,
                        fontFamily: "Poppins-Regular",
                        fontSize: 15,
                        color: "#c1c1c1",
                      }}
                      placeholder={item.question}
                      value={selectedDates[item.id] || ""}
                      editable={false}
                    />
                  </TouchableOpacity>
                  {showPicker === item.id && (
                    <DateTimePicker
                      value={
                        selectedDates[item.id]
                          ? new Date(selectedDates[item.id])
                          : new Date()
                      }
                      mode="date"
                      textColor="black"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, date) =>
                        handleDateChange(event, date, item.id)
                      }
                      disabled={true}
                    />
                  )}
                </>
              )}
              {item.answerType === "Time" && (
                <>
                  <TouchableOpacity
                    onPress={() => toggleTimePicker(item.id)}
                    disabled
                  >
                    <TextInput
                      style={{
                        backgroundColor: "#fff",
                        padding: 8,
                        borderRadius: 8,
                        fontFamily: "Poppins-Regular",
                        fontSize: 15,
                        color: "#c1c1c1",
                      }}
                      placeholder={item.question}
                      value={selectedTime[item.id] || ""}
                      editable={false}
                    />
                  </TouchableOpacity>
                  {showPicker === item.id && (
                    <DateTimePicker
                      value={
                        selectedTime[item.id]
                          ? new Date(selectedTime[item.id])
                          : new Date()
                      }
                      mode="time" // Ensure this is set to "time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(event, time) =>
                        handleTimeChange(event, time, item.id)
                      }
                      textColor="black"
                      disabled={true}
                    />
                  )}
                </>
              )}
            </View>
          </View>
        );
      },
    [
      responses,
      selectedDates,
      showPicker,
      toggleDatePicker,
      handleInputChange,
      handleDateChange,
      selectedTime,
      formatTime,
      toggleTimePicker,
      handleTimeChange,
    ]
  );

  const PostHelineData = async () => {
    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem("authToken");

      const body = {
        helplineId: dataType,
        answers: FormattedData,
      };

      const response = await apiCallWithToken(
        apiServerUrl + "/helpline/addHelplineFormAnswers",
        "POST",
        body,
        authToken
      );

      if (response?.responseCode === 200) {
        Toast.show({
          type: "success",
          text1: "Helpline form created successfully.",
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
          },
        });

        // Delay navigation by 2 seconds
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error) {
      setLoading(false);
      console.log(error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <HelpLineFormHeader navigation={navigation} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          borderRadius: 10,
          padding: 16,
          marginHorizontal: 10,
          marginTop: 15,
        }}
      >
        <Text style={styles.label}>
          Status:{" "}
          <Text style={[styles.label, { fontFamily: "WhyteInktrap-SemiBold", marginRight: 5 }]}>
            {status ? status : "---"}
          </Text>
        </Text>
        {adminResponse && <Text style={styles.label}>
          Response:{" "}
          <Text style={[styles.label, { fontFamily: "WhyteInktrap-SemiBold", marginRight: 5 }]}>
            {adminResponse ? adminResponse : "---"}
          </Text>
        </Text>}
      </View>
      {loading && <ActivityIndicator size="large" color={"#06361f"} />}

      <FlatList
        data={ListData}
        renderItem={renderList}
        style={{ marginBottom: 5, marginTop: 10 }}
      />
      <View style={styles.bottomCard}>
        {/* <LottieView
          source={require("../../assets/Background.json")}
          autoPlay
          loop
          style={styles.lottieBackground}
          resizeMode="cover"
        /> */}
        <CustomLottie customSyle={styles.lottieBackground} />
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },

  cardsContainer: {
    marginTop: "1%",
  },
  cardWrapper: {
    marginTop: 7,
  },
  bottomCard: {
    position: "absolute",
    width: "100%",
    height: "92%",
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: -1,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  lottieBackground: {
    width: width,
    height: height,
    position: "absolute",
  },
  inputConatiner: {
    borderRadius: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: "WhyteInktrap-Bold",
    color: "rgba(69, 69, 69, 1)",
    marginBottom: 8,
    lineHeight: 25,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top", // Ensures the text starts from the top
    padding: 16,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "black",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  rowContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  calendarIcon: {
    height: 15,
    width: 15,
  },
  rowContainerpicPHoto: {
    flexDirection: "row",
    backgroundColor: "#E6EBE9",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  rowContainerbutton: {
    flexDirection: "row",
    backgroundColor: "black",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
});

export default HelpLineFormResult;
