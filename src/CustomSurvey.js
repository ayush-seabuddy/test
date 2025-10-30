import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import Slider from "@react-native-community/slider";
import Ionicons from "react-native-vector-icons/Ionicons";
import { launchImageLibrary } from "react-native-image-picker";
import DatePicker from "react-native-date-picker";
import Colors from "./colors/Colors";
import { ImagesAssets } from "./assets/ImagesAssets";
import RenderHtml from "react-native-render-html";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { apiCallWithToken, apiServerUrl } from "./Api";
import axios from "axios";
import ProfleSettingHeader from "./component/headers/ProfileHeader/ProfleSettingHeader";
import { useNavigation } from "@react-navigation/native";

const CustomSurvey = ({ route, navigation }) => {
  const { surveyId } = route.params;
  const [surveyData, setSurveyData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showDatePickers, setShowDatePickers] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollViewRef = useRef(null);
  const questionRefs = useRef({});

  // Calculate progress based on answered required questions
  const calculateProgress = () => {
    if (!surveyData) return 0;
    const requiredQuestions = surveyData.SurveyQuestionsDetails.filter(
      (q) => q.isRequired
    );
    if (requiredQuestions.length === 0) return 100;

    const answeredQuestions = requiredQuestions.filter((question) => {
      const answer = answers[question.id];
      // Consider an answer valid only if it's explicitly set by the user
      if (answer === null || answer === undefined) return false;
      if (Array.isArray(answer) && answer.length === 0) return false;
      if (typeof answer === "string" && answer.trim() === "") return false;
      if (question.answerType === "file" && !answer.url) return false;
      // For date/time/datetime, ensure the answer is not the default Date object
      if (
        ["date", "time", "datetime"].includes(question.answerType) &&
        answer instanceof Date &&
        answer.getTime() === new Date().getTime()
      ) {
        return false;
      }
      // For range questions, ensure the answer is explicitly set (not default)
      if (
        ["range1-5", "range1-10"].includes(question.answerType) &&
        answer === (question.answerType === "range1-5" ? 1 : 5)
      ) {
        return false;
      }
      return true;
    });

    return Math.round((answeredQuestions.length / requiredQuestions.length) * 100);
  };

  // Fetch survey data
  const fetchSurvey = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) {
        setError("User details not found");
        return;
      }

      const fetchWithTimeout = (url, method, body, token, timeout = 3000) => {
        return Promise.race([
          apiCallWithToken(url, method, body, token),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
          ),
        ]);
      };
      const userDetails = JSON.parse(dbResult);
      const requestUrl = `${apiServerUrl}/user/getSurveyById?surveyId=${surveyId}`;

      const response = await fetchWithTimeout(
        requestUrl,
        "GET",
        null,
        userDetails.authToken,
        3000
      );

      const data = response;
      if (data.responseCode === 200) {
        setSurveyData(data.result);
        const initialAnswers = {};
        data.result.SurveyQuestionsDetails.forEach((question) => {
          // Initialize all answers as null to ensure progress starts at 0%
          initialAnswers[question.id] = null;
        });
        setAnswers(initialAnswers);
      } else {
        setError("Failed to fetch survey data");
      }
    } catch (err) {
      console.error("Error fetching survey:", err);
      setError("Error fetching survey data");
    }
  };

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  // Handle answer changes
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Handle checkbox toggle for multiselect
  const toggleCheckbox = (questionId, option) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      return {
        ...prev,
        [questionId]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
  };

  // Handle file upload
  const handleDocumentPick = async (questionId) => {
    try {
      setIsUploading(true);
      const result = await launchImageLibrary({
        mediaType: "mixed",
        includeBase64: false,
        quality: 1,
      });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const media = result.assets[0];
        console.log("Selected File:", {
          uri: media.uri,
          fileName: media.fileName,
          fileSize: media.fileSize,
          type: media.type,
        });
        const uploadedUrl = await uploadFileToApi(media);
        handleAnswerChange(questionId, {
          fileName: media.fileName || `file_${Date.now()}`,
          fileSize: media.fileSize || 0,
          url: uploadedUrl,
        });
      } else {
        console.log("File selection cancelled or no assets returned");
      }
    } catch (err) {
      console.error("Error handling file:", err);
      Alert.alert(
        "Error",
        err.message === "User details or auth token not found"
          ? "Please log in again to upload files."
          : "Failed to upload file. Please check your network and try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // File upload function
  const uploadFileToApi = async (media) => {
    try {
      const extension = (media.uri.split(".").pop() || "jpg").toLowerCase();
      const mimeType =
        extension === "pdf"
          ? "application/pdf"
          : extension === "png"
            ? "image/png"
            : extension === "jpg" || extension === "jpeg"
              ? "image/jpeg"
              : "application/octet-stream";

      const userDetailsString = await AsyncStorage.getItem("userDetails");
      if (!userDetailsString) {
        throw new Error("User details or auth token not found");
      }
      const userDetails = JSON.parse(userDetailsString);
      if (!userDetails.authToken) {
        throw new Error("User details or auth token not found");
      }

      console.log("Uploading file with details:", {
        uri: media.uri,
        name: media.fileName || `file_${Date.now()}.${extension}`,
        type: mimeType,
        authToken: userDetails.authToken,
        url: `${apiServerUrl}/user/uploadFile`,
      });

      const data = new FormData();
      data.append("file", {
        uri: Platform.OS === "android" ? media.uri : media.uri.replace("file://", ""),
        name: media.fileName || `file_${Date.now()}.${extension}`,
        type: mimeType,
      });

      const response = await axios.post(
        `${apiServerUrl}/user/uploadFile`,
        data,
        {
          headers: {
            authToken: userDetails.authToken,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("Upload Response:", response.data);

      if (response.data.responseCode === 200 && response.data.result) {
        return response.data.result;
      } else {
        throw new Error(
          "Upload failed: " + (response.data.responseMessage || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Upload error for", media.uri, ":", error.message);
      if (error.response) {
        console.error("Server Response:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  };

  // Handle date/time picker visibility
  const toggleDatePicker = (questionId, type) => {
    setShowDatePickers((prev) => ({ ...prev, [questionId]: type }));
  };

  // Format date/time
  const formatDate = (date) => date.toLocaleDateString();
  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDateTime = (date) =>
    `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

  // Validate required questions and scroll to the first unanswered one
  const validateAnswers = () => {
    const requiredQuestions = surveyData.SurveyQuestionsDetails.filter(
      (q) => q.isRequired
    );
    for (const question of requiredQuestions) {
      const answer = answers[question.id];
      if (
        answer === null ||
        answer === undefined ||
        (Array.isArray(answer) && answer.length === 0) ||
        (typeof answer === "string" && answer.trim() === "") ||
        (question.answerType === "file" && !answer.url)
      ) {
        const questionRef = questionRefs.current[question.id];
        if (questionRef && scrollViewRef.current) {
          questionRef.measureLayout(
            scrollViewRef.current.getScrollableNode(),
            (x, y) => {
              scrollViewRef.current.scrollTo({ y, animated: true });
            },
            (error) => {
              console.error("Error measuring layout:", error);
            }
          );
        }
        Alert.alert("Error", "Please answer all required questions.");
        return false;
      }
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (submitting) return;

    const isValid = validateAnswers();
    if (!isValid) {
      return;
    }

    setSubmitting(true);
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) {
        Alert.alert("Error", "User details not found");
        setSubmitting(false);
        return;
      }

      const userDetails = JSON.parse(dbResult);
      const responseJson = Object.entries(answers).map(([questionId, answer]) => {
        const questionDetails = surveyData.SurveyQuestionsDetails.find(
          (q) => q.id === questionId
        );
        return {
          ...questionDetails,
          answer:
            questionDetails?.answerType === "file"
              ? { fileName: answer.fileName, url: answer.url }
              : questionDetails?.answerType === "date" ||
                questionDetails?.answerType === "datetime"
                ? answer.toISOString()
                : questionDetails?.answerType === "time"
                  ? formatTime(answer)
                  : answer,
        };
      });

      const payloadToLog = {
        userId: userDetails.id || "unknown",
        surveyId,
        responseJson,
      };
      console.log("Submission Payload:", JSON.stringify(payloadToLog, null, 2));

      const requestUrl = `${apiServerUrl}/user/submitSurvey`;
      const payload = {
        userId: userDetails.id || "unknown",
        surveyId,
        responseJson: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer:
            surveyData.SurveyQuestionsDetails.find((q) => q.id === questionId)
              ?.answerType === "file"
              ? { fileName: answer.fileName, url: answer.url }
              : surveyData.SurveyQuestionsDetails.find((q) => q.id === questionId)
                ?.answerType === "date" ||
                surveyData.SurveyQuestionsDetails.find((q) => q.id === questionId)
                  ?.answerType === "datetime"
                ? answer.toISOString()
                : surveyData.SurveyQuestionsDetails.find((q) => q.id === questionId)
                  ?.answerType === "time"
                  ? formatTime(answer)
                  : answer,
        })),
      };

      const response = await apiCallWithToken(
        requestUrl,
        "POST",
        payload,
        userDetails.authToken
      );

      if (response.responseCode === 200) {
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to submit survey. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting survey:", err);
      Alert.alert("Error", "An error occurred while submitting the survey.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render question based on answerType
  const renderQuestion = (question) => {
    const { id, question: questionText, answerType, answerOptions, isRequired } = question;

    return (
      <View
        key={id}
        ref={(ref) => (questionRefs.current[id] = ref)}
        style={styles.questionContainer}
      >
        <Text style={styles.questionText}>
          {questionText} {isRequired && <Text style={styles.requiredText}>*</Text>}
        </Text>
        {(() => {
          switch (answerType) {
            case "text":
            case "textarea":
              return (
                <TextInput
                  style={[
                    styles.textInput,
                    answerType === "textarea" && {
                      height: 100,
                      textAlignVertical: "top",
                    },
                  ]}
                  placeholder="Type your answer..."
                  placeholderTextColor="#999"
                  value={answers[id] || ""}
                  onChangeText={(text) => handleAnswerChange(id, text)}
                  multiline={answerType === "textarea"}
                />
              );

            case "radio":
              return (
                <FlatList
                  data={answerOptions}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => {
                    const selected = answers[id] === item;
                    return (
                      <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => handleAnswerChange(id, item)}
                      >
                        <View style={styles.radioOuter}>
                          {selected && (
                            <View
                              style={[
                                styles.radioInner,
                                { backgroundColor: Colors.secondary },
                              ]}
                            />
                          )}
                        </View>
                        <Text style={styles.optionText}>{item}</Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              );

            case "multiselect":
              return (
                <FlatList
                  data={answerOptions}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => {
                    const selected = (answers[id] || []).includes(item);
                    return (
                      <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => toggleCheckbox(id, item)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selected && { backgroundColor: Colors.secondary },
                          ]}
                        >
                          {selected && (
                            <Ionicons name="checkmark" size={16} color="white" />
                          )}
                        </View>
                        <Text style={styles.optionText}>{item}</Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              );

            case "dropdown":
              return (
                <View style={styles.dropdown}>
                  <Picker
                    selectedValue={answers[id] || ""}
                    onValueChange={(value) => handleAnswerChange(id, value)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Select an option..." value="" />
                    {answerOptions.map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                </View>
              );

            case "number":
              return (
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter a number..."
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={answers[id] || ""}
                  onChangeText={(text) => handleAnswerChange(id, text)}
                />
              );

            case "yesno":
              return (
                <View style={styles.yesNoContainer}>
                  {["Yes", "No"].map((option) => {
                    const selected = answers[id] === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={styles.optionRow}
                        onPress={() => handleAnswerChange(id, option)}
                      >
                        <View style={styles.radioOuter}>
                          {selected && (
                            <View
                              style={[
                                styles.radioInner,
                                { backgroundColor: Colors.secondary },
                              ]}
                            />
                          )}
                        </View>
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );

            case "file":
              return (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => handleDocumentPick(id)}
                    disabled={isUploading}
                  >
                    <Text style={styles.dateButtonText}>
                      {answers[id]?.fileName || "Select a file..."}
                    </Text>
                  </TouchableOpacity>
                  {answers[id] && (
                    <Text style={styles.documentInfo}>
                      Selected: {answers[id].fileName} (
                      {(answers[id].fileSize / 1024).toFixed(2)} KB)
                    </Text>
                  )}
                </>
              );

            case "range1-5":
            case "range1-10":
              const maxValue = answerType === "range1-5" ? 5 : 10;
              return (
                <>
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={1}
                    maximumValue={maxValue}
                    step={1}
                    value={answers[id] || 1}
                    minimumTrackTintColor={Colors.secondary}
                    maximumTrackTintColor="#CBD5E1"
                    thumbTintColor={Colors.secondary}
                    onValueChange={(value) => handleAnswerChange(id, value)}
                  />
                  <Text style={styles.sliderValueText}>
                    Selected: {answers[id] || "Not selected"}
                  </Text>
                </>
              );

            case "date":
              return (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => toggleDatePicker(id, "date")}
                  >
                    <Text style={styles.dateButtonText}>
                      {answers[id] ? formatDate(answers[id]) : "Select date..."}
                    </Text>
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    mode="date"
                    open={showDatePickers[id] === "date"}
                    date={answers[id] || new Date()}
                    onConfirm={(date) => {
                      handleAnswerChange(id, date);
                      toggleDatePicker(id, null);
                    }}
                    onCancel={() => toggleDatePicker(id, null)}
                  />
                </>
              );

            case "time":
              return (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => toggleDatePicker(id, "time")}
                  >
                    <Text style={styles.dateButtonText}>
                      {answers[id] ? formatTime(answers[id]) : "Select time..."}
                    </Text>
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    mode="time"
                    open={showDatePickers[id] === "time"}
                    date={answers[id] || new Date()}
                    onConfirm={(time) => {
                      handleAnswerChange(id, time);
                      toggleDatePicker(id, null);
                    }}
                    onCancel={() => toggleDatePicker(id, null)}
                  />
                </>
              );

            case "datetime":
              return (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => toggleDatePicker(id, "datetime")}
                  >
                    <Text style={styles.dateButtonText}>
                      {answers[id]
                        ? formatDateTime(answers[id])
                        : "Select date and time..."}
                    </Text>
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    mode="datetime"
                    open={showDatePickers[id] === "datetime"}
                    date={answers[id] || new Date()}
                    onConfirm={(dateTime) => {
                      handleAnswerChange(id, dateTime);
                      toggleDatePicker(id, null);
                    }}
                    onCancel={() => toggleDatePicker(id, null)}
                  />
                </>
              );

            default:
              return null;
          }
        })()}
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!surveyData) {
    return (
      <View style={styles.overlayForLoading}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <ProfleSettingHeader navigation={navigation} />

      <ScrollView
        style={styles.container}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: "center",
            gap: 10,
            flexDirection: "row",
            marginBottom: 16,
          }}
        >
          <Image
            style={styles.imageStyle}
            source={ImagesAssets.SurveyImage}
            resizeMode="contain"
          />
          <Text style={styles.header}>{surveyData.title}</Text>
        </View>

        <RenderHtml
          source={{ html: surveyData.description || "" }}
          tagsStyles={{
            p: { marginVertical: 0, paddingVertical: 0 },
          }}
        />
              <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${calculateProgress()}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{calculateProgress()}% Complete</Text>
      </View>
        {surveyData.SurveyQuestionsDetails.sort(
          (a, b) => parseInt(a.order) - parseInt(b.order)
        ).map((question) => renderQuestion(question))}

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isUploading}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.secondary} />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CustomSurvey;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 5,
  },
  progressBarContainer: {
    position: "sticky",
    top: 0,
    marginTop:10,
    zIndex: 10,
    paddingVertical: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.secondary,
    borderRadius: 5,
    transition: "width 0.3s ease-in-out",
  },
  progressText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#1E293B",
    textAlign: "center",
  },
  header: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "black",
    flexShrink: 1,
  },
  subHeading: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    color: "grey",
    marginVertical: 10,
  },
  questionContainer: {
    marginTop: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imageStyle: {
    height: 100,
    width: 100,
  },
  questionText: {
    fontSize: 14,
    color: "#0F172A",
    fontFamily: "Poppins-Regular",
    marginBottom: 5,
  },
  requiredText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#1E293B",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 6,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#334155",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  sliderValueText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.secondary,
    fontWeight: "600",
    textAlign: "center",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#1E293B",
    textAlign: "center",
  },
  documentInfo: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.secondary,
    fontWeight: "600",
    textAlign: "center",
  },
  iconBackground: {
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    borderRadius: 50,
    width: 40,
  },
  headerIcon: {
    height: 25,
    width: 25,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: Platform.OS === "ios" ? 200 : 50,
    fontFamily: "Poppins-Regular",
    color: "#1E293B",
    textAlign: "center",
  },
  pickerItem: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  yesNoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#1E293B",
    textAlign: "center",
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "#06361f",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayForLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#1E293B",
  },
});