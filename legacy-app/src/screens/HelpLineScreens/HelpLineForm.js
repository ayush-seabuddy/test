import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Switch,
  Modal, // Added Modal for the popup
} from "react-native";
import LottieView from "lottie-react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import ImagePicker from "react-native-image-crop-picker";
import HelpLineFormHeadercopy from "../../component/headers/HelpLineScreensHeader/HelpLineFormHeadercopy";
import { apiCallWithToken, apiServerUrl } from "../../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RadioButton } from "react-native-paper";
import moment from "moment";
import Toast from "react-native-toast-message";
import CustomLottie from "../../component/CustomLottie";
import CustomDateTimePicker from "../../component/Modals/CustomDateTimePicker";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width, height } = Dimensions.get("window");

const HelpLineForm = ({ navigation, route }) => {
  const { dataType, name } = route.params;
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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for controlling popup visibility
  const flatListRef = useRef(null); // Reference for FlatList to scroll



    // Add delay for modal
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalVisible(true);
    }, 500); // 1-second delay
    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  const GetData = useCallback(async () => {
    const authToken = await AsyncStorage.getItem("authToken");
    try {
      const response = await apiCallWithToken(
        apiServerUrl + "/helpline/getAllHelplineFormQuestions",
        "GET",
        null,
        authToken
      );
      if (response.responseCode) {
        setListData((prevData) =>
          JSON.stringify(prevData) === JSON.stringify(response.result)
            ? prevData
            : response.result
        );
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    GetData();
  }, [GetData]);

  const handleAnonymousToggle = useCallback(() => {
    setIsAnonymous((prev) => {
      const newAnonymousState = !prev;
      if (newAnonymousState) {
        const updatedResponses = { ...responses };
        ListData.forEach((item) => {
          if (
            item.question.toLowerCase() == "name" ||
            item.question.toLowerCase() == "rank"
          ) {
            updatedResponses[item.id] = "Anonymous";
          }
        });
        setResponses(updatedResponses);
        const formattedResponses = Object.entries(updatedResponses).map(
          ([id, answer]) => ({
            helplineQuestionId: id,
            answer: answer.toString(),
            createdAt: new Date().toISOString(),
          })
        );
        setFormattedData(formattedResponses);
        const allFieldsFilled = ListData.every((item) =>
          updatedResponses.hasOwnProperty(item.id)
        );
        setIsFormComplete(allFieldsFilled);
      } else {
        const updatedResponses = { ...responses };
        ListData.forEach((item) => {
          if (
            item.question.toLowerCase() == "name" ||
            item.question.toLowerCase() == "rank"
          ) {
            delete updatedResponses[item.id];
          }
        });
        setResponses(updatedResponses);
        const formattedResponses = Object.entries(updatedResponses).map(
          ([id, answer]) => ({
            helplineQuestionId: id,
            answer: answer.toString(),
            createdAt: new Date().toISOString(),
          })
        );
        setFormattedData(formattedResponses);
        const allFieldsFilled = ListData.every((item) =>
          updatedResponses.hasOwnProperty(item.id)
        );
        setIsFormComplete(allFieldsFilled);
      }
      return newAnonymousState;
    });
  }, [responses, ListData]);

  const handleInputChange = useCallback(
    (questionId, value) => {
      const question = ListData.find((item) => item.id === questionId);
      if (
        isAnonymous &&
        question &&
        (question.question.toLowerCase() == "name" ||
          question.question.toLowerCase() == "rank")
      ) {
        return;
      }
      setResponses((prev) => {
        const updatedResponses =
          prev[questionId] === value ? prev : { ...prev, [questionId]: value };
        const formattedResponses = Object.entries(updatedResponses).map(
          ([id, answer]) => ({
            helplineQuestionId: id,
            answer: answer.toString(),
            createdAt: new Date().toISOString(),
          })
        );
        setFormattedData(formattedResponses);
        const allFieldsFilled = ListData.every((item) =>
          updatedResponses.hasOwnProperty(item.id)
        );
        setIsFormComplete(allFieldsFilled);
        return updatedResponses;
      });
    },
    [ListData, isAnonymous]
  );

  const isDateUpdating = useRef(false);

  const handleDateChange = useCallback(
    (event, date, id) => {
      if (isDateUpdating.current) return;

      if (event.type === "set" && date) {
        isDateUpdating.current = true;
        setShowPicker(null);
        const formattedDate = moment(date).format("DD/MMM/YYYY");

        setSelectedDates((prev) => ({
          ...prev,
          [id]: date,
        }));
        handleInputChange(id, formattedDate);
        setTimeout(() => {
          isDateUpdating.current = false;
        }, 300);
      } else {
        setShowPicker(null);
      }
    },
    [handleInputChange]
  );

  const getFormattedDate = useCallback((date) => {
    if (date instanceof Date) {
      return moment(date).format("DD/MMM/YYYY");
    }
    return "";
  }, []);

  const toggleDatePicker = useCallback((id) => {
    setShowPicker((prev) => (prev === id ? null : id));
  }, []);

  const toggleTimePicker = (id) => {
    console.log("id: dlskfks", id);
    setShowPicker((prevId) => (prevId === id ? null : id));
  };

  const isUpdatingDate = useRef(false);
  const handleTimeChange = (event, time, id) => {
    if (isUpdatingDate.current) {
      return;
    }

    if (event.type === "set" && time instanceof Date) {
      isUpdatingDate.current = true;
      setShowPicker(null);
      setSelectedTime((prevTimes) => ({
        ...prevTimes,
        [id]: time,
      }));
      const _time = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      handleInputChange(id, _time);
      setTimeout(() => {
        isUpdatingDate.current = false;
      }, 400);
    }
    setShowPicker(null);
  };

  const formatTime = (time) => {
    if (!(time instanceof Date)) return "";
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderList = useMemo(
    () =>
      ({ item, index }) => {
        const isNameOrRank =
          item.question.toLowerCase() == "name" ||
          item.question.toLowerCase() == "rank";
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
                  maxLength={60}
                  placeholder={isNameOrRank && isAnonymous ? "Anonymous" : "Enter your answer"}
                  value={responses[item.id] || ""}
                  onChangeText={(value) => handleInputChange(item.id, value)}
                  editable={!isAnonymous || !isNameOrRank}
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
                  maxLength={400}
                  placeholder={isNameOrRank && isAnonymous ? "Anonymous" : "Enter your answer"}
                  value={responses[item.id] || ""}
                  multiline
                  onChangeText={(value) => handleInputChange(item.id, value)}
                  editable={!isAnonymous || !isNameOrRank}
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
                        marginVertical: 0,
                        paddingVertical: 2,
                      }}
                    >
                      <RadioButton.Android value={option} color="#B0DB02" />
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
                  <TouchableOpacity onPress={() => toggleDatePicker(item.id)}>
                    <TextInput
                      style={{
                        backgroundColor: "#fff",
                        padding: 8,
                        borderRadius: 8,
                        fontFamily: "Poppins-Regular",
                        fontSize: 15,
                        color: "#000",
                      }}
                      placeholder={item.question}
                      value={getFormattedDate(selectedDates[item.id]) || ""}
                      editable={false}
                      pointerEvents="none"
                      importantForAccessibility="no"
                    />
                  </TouchableOpacity>
                  {showPicker === item.id && (
                    Platform.OS === "ios" ? (
                      <CustomDateTimePicker
                        value={
                          selectedDates[item.id]
                            ? selectedDates[item.id]
                            : new Date()
                        }
                        mode="date"
                        onChange={(event, date) =>
                          handleDateChange(event, date, item.id)
                        }
                        isVisible={showPicker}
                        onClose={() => setShowPicker(null)}
                        cancelText="Cancel"
                        confirmText="Done"
                        containerStyle={{ backgroundColor: "#fff" }}
                        buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
                      />
                    ) : (
                      <DateTimePicker
                        style={{ backgroundColor: "white" }}
                        value={
                          selectedDates[item.id]
                            ? selectedDates[item.id]
                            : new Date()
                        }
                        maximumDate={new Date()}
                        mode="date"
                        textColor="black"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event, date) =>
                          handleDateChange(event, date, item.id)
                        }
                      />
                    )
                  )}
                </>
              )}
              {item.answerType === "Time" && (
                <>
                  <TouchableOpacity onPress={() => toggleTimePicker(item.id)}>
                    <TextInput
                      style={{
                        backgroundColor: "#fff",
                        padding: 8,
                        borderRadius: 8,
                        fontFamily: "Poppins-Regular",
                        fontSize: 15,
                        color: "#000",
                      }}
                      placeholder={item.question}
                      value={formatTime(selectedTime[item.id]) || ""}
                      editable={false}
                      pointerEvents="none"
                      importantForAccessibility="no"
                    />
                  </TouchableOpacity>
                  {showPicker === item.id && (
                    <CustomDateTimePicker
                      value={
                        selectedTime[item.id]
                          ? new Date(selectedTime[item.id])
                          : new Date()
                      }
                      mode="time"
                      onChange={(event, time) =>
                        handleTimeChange(event, time, item.id)
                      }
                      isVisible={showPicker}
                      onClose={() => setShowPicker(false)}
                      cancelText="Cancel"
                      confirmText="Done"
                      containerStyle={{ backgroundColor: "#fff" }}
                      buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
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
      isAnonymous,
    ]
  );

  const PostHelineData = async () => {
    // Check for missing fields
    const missingField = ListData.find((item, index) => {
      const isNameOrRank =
        item.question.toLowerCase() == "name" ||
        item.question.toLowerCase() == "rank";
      // Skip Name and Rank fields if anonymous is enabled
      if (isAnonymous && isNameOrRank) {
        return false;
      }
      return !responses.hasOwnProperty(item.id) || responses[item.id] === "";
    });

    if (missingField) {
      const missingIndex = ListData.findIndex((item) => item.id === missingField.id);
      Toast.show({
        type: "error",
        text1: `Please fill in the "${missingField.question}" field.`,
        autoHide: true,
        visibilityTime: 3000,
        text1Style: {
          fontFamily: "WhyteInkTrap-Bold",
          fontSize: 16,
          color: "#000",
          paddingTop: 10,
        },
      });
      // Scroll to the missing field
      if (flatListRef.current && missingIndex !== -1) {
        flatListRef.current.scrollToIndex({
          index: missingIndex,
          animated: true,
          viewPosition: 0,
        });
      }
      return;
    }

    try {
      setLoading(true);
      const authToken = await AsyncStorage.getItem("authToken");
      const body = {
        helplineId: dataType,
        answers: FormattedData,
      };
      var response = await apiCallWithToken(
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
            paddingTop: 10,
          },
        });
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error) {
      console.log(error, "error");
    } finally {
      setLoading(false);
    }
  };

  const renderFooter = () => (
    <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
      <TouchableOpacity
        onPress={PostHelineData}
        style={{
          height: 50,
          backgroundColor: "#02130B",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator size={20} color={"white"} />
        ) : (
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Poppins-SemiBold",
              color: "white",
            }}
          >
            Submit
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Handle OK button press to close the modal
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <HelpLineFormHeadercopy navigation={navigation} title={name} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Submit as Anonymous</Text>
        <Switch
          value={isAnonymous}
          onValueChange={handleAnonymousToggle}
          trackColor={{ false: "#767577", true: "#B0DB02" }}
          thumbColor={isAnonymous ? "#fff" : "#f4f3f4"}
        />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            ref={flatListRef}
            data={ListData}
            renderItem={renderList}
            style={{ marginBottom: 5, marginTop: 10 }}
            keyExtractor={(item) => item.id.toString()}
            getItemLayout={(data, index) => ({
              length: 100, // Approximate height of each item
              offset: 100 * index,
              index,
            })}
            ListFooterComponent={renderFooter}
          />
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <View style={styles.bottomCard}>
        <CustomLottie componetHeight={height} />
      </View>
      {/* Popup Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              All helpline calls and chats are strictly confidential. Reaching out will not affect your job or standing onboard. These services exist solely to support and guide you.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleModalClose}
            >
              <Text style={styles.modalButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  toggleContainer: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#000",
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
    textAlignVertical: "top",
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: width * 0.85,
    alignItems: "center",
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#02130B",
    borderRadius: 8,
    width:'100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
});

export default HelpLineForm;