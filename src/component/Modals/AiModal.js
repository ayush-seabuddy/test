import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Pressable,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithTokenPost, apiServerUrl } from "../../Api";
import Toast from "react-native-toast-message";
import moment from "moment";
import DropdownFieldIOS from "../DropdownIOS";
const { width, height } = Dimensions.get("window"); // Get screen dimensions

const AiModal = ({ visible, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [UserName, setUserName] = useState("");

  const [feeling, setfeeling] = useState("");
  const [Because, setBecause] = useState("");
  const [ReasonText, setReasonText] = useState("");

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

  const handleSubmit = async () => {
    // Handle submission logic here
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
      try {
        const date = new Date()
        const todayDate = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          const userDetailsString = await AsyncStorage.getItem("userDetails");
          const userDetails = JSON.parse(userDetailsString);
          userDetails.isMoodTracker = true;
           userDetails.lastMoodDate = todayDate;
          await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
          onClose();
      } catch (error) {
        console.log(error);
        
      }
   
      Toast.show({
        type: "success",
        text1: "Success",
        text2: response.responseMessage,
        autoHide: true,
        visibilityTime: 2000,
        text1Style: {
          fontFamily: "WhyteInkTrap-Bold",
          fontSize: 16,
          color: "#000",
        },
        text2Style: {
          fontFamily: "Poppins-Regular",
          fontSize: 14,
          color: "#000",
        },
      });

      
     
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
        },
        text2Style: {
          fontFamily: "Poppins-Regular",
          fontSize: 14,
          color: "#000",
        },
      });
      onClose();
    }
    resetModal();
  };

  useEffect(() => {
    const selectResult = async () => {
      try {
        const dbResult = await AsyncStorage.getItem("userDetails");
        var Data = JSON.parse(dbResult);

        setUserName(Data?.fullName?.split(" ")[0] );
      } catch (err) {
        throw err;
      }
    };
    selectResult();
  }, []);

  const moodPopUp = [
    { emoji: require("../../assets/images/Emoji_1.png"), label: "Happy" },
    { emoji: require("../../assets/images/Emoji_5.png"), label: "Anxious" },
    { emoji: require("../../assets/images/Emoji_3.png"), label: "Sad" },
    { emoji: require("../../assets/images/Emoji_4.png"), label: "Angry" },
    { emoji: require("../../assets/images/Emoji_2.png"), label: "Calm" },
  ];
  const genderOptions = [
    { label: "Gender", value: "" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];
  const resetModal = () => {
    setStep(1);
    setSelectedMood(null);
    setBecause("");
    setReasonText("");
    setfeeling("");
  };
  const DropdownField = ({
    label,
    options,
    selectedValue,
    onValueChange,
    error,
  }) => (
    <View style={styles.dropdownContainer}>
      <View style={styles.dropdownRow}>
        <Image style={styles.icon} source={ImagesAssets.info_icon} />
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor="#949494"
        >
          {options.map((option, index) => (
            <Picker.Item
              style={{ fontFamily: "Poppins-Regular", fontSize: 14 }}
              key={index}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#262626",
                fontFamily: "Poppins-Regular",
                lineHeight: 26.4,
              }}
            >
              How’re you feeling today?
            </Text>
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
                    style={{
                      height: width * 0.14,
                      width: width * 0.14,
                      marginHorizontal: 5,
                    }}
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
        );

      case 2:
        return (
          <View style={[styles.stepContainer]}>
            <View>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "black",
                  fontFamily: "Poppins-Regular",
                  lineHeight: 26.4,
                }}
              >
                Would you like to share some details?
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
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good Afternoon";
    } else if (currentHour >= 18 && currentHour < 22) {
      return "Good Evening";
    } else {
      return "";
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <View style={styles.modalBackground} />
        <KeyboardAvoidingView
          style={{ width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 40}
        >
          {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
          <View style={styles.modalPopup}>
            <View style={styles.congratulationsParent}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "400",
                    fontFamily: "Poppins-Regular",
                    lineHeight: 19.2,
                  }}
                >
                  {getGreeting()}{" "}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "rgba(52, 52, 52, 1)",
                    fontFamily: "Poppins-SemiBold",
                    lineHeight: 19.2,
                  }}
                >
                  {UserName}!
                </Text>
              </View>

              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>{renderStep()}</View>
              </TouchableWithoutFeedback>

              {step === 1 ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                ></View>
              ) : null}
            </View>

            <View style={styles.mingcutecloseFillIcon}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Image
                  style={{ width: 24, height: 24 }}
                  resizeMode="cover"
                  source={ImagesAssets.closeicon}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[styles.default3dRenderedCartoonOf, styles.cartoonPosition]}
            />
            <Image
              style={[
                styles.default4dCartoonPixarManWIcon,
                styles.default4dIconPosition,
              ]}
              resizeMode="cover"
              source={ImagesAssets.resultmodal_img}
            />
            <Image
              style={[
                styles.default4dCartoonPixarHeIsIcon,
                styles.cartoonPosition,
              ]}
              resizeMode="cover"
              source={ImagesAssets.resultmodal_img}
            />
            <Image
              style={[
                styles.default4dCartoonPixarManWIcon1,
                styles.default4dIconPosition,
              ]}
              resizeMode="cover"
              source={ImagesAssets.resultmodal_img}
            />
            <Image
              style={styles.default4dCartoonPixarManWIcon2}
              resizeMode="cover"
              source={ImagesAssets.resultmodal_img}
            />
          </View>
          {/* </TouchableWithoutFeedback> */}
        </KeyboardAvoidingView>
      </Pressable>
      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalPopup: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: "#d9d9d9",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 105,
    paddingBottom: 32,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    backgroundColor: "#fff",
    marginVertical: 30,
  },
  textArea: {
    height: 50,
    textAlignVertical: "center",
    marginTop: 20,
  },
  itsAGreatFlexBox: {
    textAlign: "left",
    alignSelf: "stretch",
  },
  buttonFlexBox: {
    justifyContent: "center",
    alignSelf: "stretch",
  },
  button1Typo: {
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  cartoonPosition: {
    display: "none",
    position: "absolute",
  },
  default4dIconPosition: {
    left: 24,
    display: "none",
    position: "absolute",
  },
  congratulations: {
    fontSize: 22,
    lineHeight: 26,
    color: "#262626",
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  itsAGreat: {
    lineHeight: 17,
    fontFamily: "Poppins-Regular",
    color: "#454545",
    fontSize: 14,
  },
  congratulationsParent: {
    gap: 8,
    zIndex: 0,
    alignSelf: "stretch",
  },
  button1: {
    lineHeight: 21,
    color: "#06361f",
    textAlign: "center",
    fontSize: 14,
  },
  stateLayer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    shadowColor: "rgba(103, 110, 118, 0.08)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 5,
    elevation: 5,
    shadowOpacity: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 1,
    overflow: "hidden",
  },
  mingcutecloseFillIcon: {
    top: 30,
    right: 20,
    zIndex: 3,
    position: "absolute",
  },
  closeButton: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  default3dRenderedCartoonOf: {
    top: -203,
    left: 74,
    width: 252,
    height: 336,
    zIndex: 3,
  },
  default4dCartoonPixarManWIcon: {
    top: -215,
    width: 359,
    height: 359,
    zIndex: 4,
  },
  default4dCartoonPixarHeIsIcon: {
    top: -219,
    left: 21,
    width: 351,
    height: 351,
    zIndex: 5,
  },
  default4dCartoonPixarManWIcon1: {
    top: -221,
    width: 355,
    height: 355,
    zIndex: 6,
  },
  default4dCartoonPixarManWIcon2: {
    top: -249,
    left: 15,
    width: width,
    height: 403,
    zIndex: 7,
    position: "absolute",
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
  submitButton: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },

});

export default AiModal;