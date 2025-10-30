import React, { useRef, useState } from "react";
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
  Modal,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import AppointmentFormHeader from "../../component/headers/HelpLineScreensHeader/AppointmentFormHeader";
import DoctorProfileDeatilsCard from "../../component/Cards/HelpLineScreensCards/DoctorProfileDeatilsCard";
import DateTimePicker from "@react-native-community/datetimepicker";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ImageCropPicker from "react-native-image-crop-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiServerUrl } from "../../Api";
import Loader from "../../component/Loader";
import Toast from "react-native-toast-message";
import CustomLottie from "../../component/CustomLottie";
import CustomDateTimePicker from "../../component/Modals/CustomDateTimePicker";

const { width, height } = Dimensions.get("window");

const AppointmentForm = ({ navigation, route }) => {
  const { data } = route?.params;
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [appointmentReason, setAppointmentReason] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const modalRef = useRef(null)
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showImageViewerModal, setShowImageViewerModal] = useState(false);
  const [formattedDate, setFormattedDate] = useState("Set date");
  const [formattedTime, setFormattedTime] = useState("Set time");
  const [imageUris, setImageUris] = useState([]);
  const [selectedImageUri, setSelectedImageUri] = useState(null);


  const [errors, setErrors] = useState({
    appointmentReason: "",
    date: "",
    time: "",
    images: "",
  });

  const handleDateChange = (event, selectedDate) => {
    modalRef.current = false
    if (event.type === "set") {
      const newDate = selectedDate || date;
      setDate(newDate);
      const formatted = newDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      setFormattedDate(formatted);

      // Clear date error when a date is selected
      setErrors((prevErrors) => ({ ...prevErrors, date: "" }));
    }
    setShowDatePickerModal(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    modalRef.current = false
    if (event.type === "set") {
      const newTime = selectedTime || time;
      setTime(newTime);
      const formatted = newTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setFormattedTime(formatted);

      // Clear time error when a time is selected
      setErrors((prevErrors) => ({ ...prevErrors, time: "" }));
    }
    setShowTimePickerModal(false);
  };

  const openCamera = () => {
    launchCamera({ mediaType: "photo" }, (response) => {
      if (!response.didCancel && !response.error) {
        const newImages = response.assets.map((asset) => asset.uri);
        // cropImages(newImages);
        uploadImages(newImages);
      }
      setShowImagePickerModal(false);
    });
  };

  const openLibrary = () => {


    launchImageLibrary(
      { mediaType: "photo", selectionLimit: 0 },
      (response) => {
        if (!response.didCancel && !response.error) {
          const newImages = response.assets.map((asset) => asset.uri);
          uploadImages(newImages);
          // cropImages(newImages);
        }
        setShowImagePickerModal(false);
      }
    );
  };

  const cropImages = async (uris) => {
    const croppedUris = [];
    for (const uri of uris) {
      try {
        const image = await ImageCropPicker.openCropper({
          path: uri,
          width: 300,
          height: 300,
        });
        croppedUris.push(image.path);
      } catch (error) {
        console.error("Image cropping failed:", error);
      }
    }
    uploadImages(croppedUris);
  };

  const uploadImages = async (uris) => {
    const uploadedImages = [];
    for (const uri of uris) {
      const fileName = uri.split("/").pop();
      const userDetailsString = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(userDetailsString);
      const data = new FormData();
      data.append("file", {
        uri: uri,
        name: fileName,
        type: "image/jpeg",
      });

      try {
        setLoadingImage(true);
        const response = await axios.post(
          `${apiServerUrl}/user/uploadFile`,
          data,
          {
            headers: {
              authToken: userDetails.authToken,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.responseCode === 200) {
          uploadedImages.push(response.data.result);
          // setImageUris((prevUris) => [...prevUris, ...uploadedImages]);
          setImageUris((prevUris) => {
            const newUris = [...prevUris, ...uploadedImages];
            return Array.from(new Set(newUris)); // Removes duplicates
          });
        }

        setLoadingImage(false);
      } catch (error) {
        setLoadingImage(false);
        console.error("Error uploading image:", error);
      }
    }

    // Clear image error when an image is selected
    setErrors((prevErrors) => ({ ...prevErrors, images: "" }));
  };

  const openImageModal = (uri) => {
    setSelectedImageUri(uri);
    setShowImageViewerModal(true);
  };

  const closeImageViewerModal = () => {
    setShowImageViewerModal(false);
    setSelectedImageUri(null);
  };

  const removeImage = (uriToRemove) => {
    setImageUris((prevUris) => prevUris.filter((uri) => uri !== uriToRemove));

    // Show image error if no images are left
    if (imageUris.length === 1) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        images: "At least one image is required.",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!appointmentReason) {
      newErrors.appointmentReason = "Reason for appointment is required.";
    }
    if (formattedDate === "Set date") {
      newErrors.date = "Date is required.";
    }
    if (formattedTime === "Set time") {
      newErrors.time = "Time is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookForm = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) throw new Error("No user details found");
      const userDetails = JSON.parse(dbResult);

      const body = {
        doctorId: data.id,
        description: appointmentReason,
        dateTime: `${date.toISOString().split("T")[0]}T${time.toTimeString().split(" ")[0]
          }`,
        images: imageUris,
      };

      const response = await axios.post(
        `${apiServerUrl}/helpline/bookAppointmentWithDoctor`,
        body,
        {
          headers: {
            authToken: userDetails.authToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.responseCode === 200) {
        Toast.show({
          type: "success",
          text1: "Appointment booked successfully.",
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: 10
          },
          text2Style: {
            fontFamily: "Poppins-Regular",
            fontSize: 14,
            color: "#000",
          },
        });

        // Delay navigation by 2 seconds
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Update Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };


  const getMinimumTime = () => {
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      // Return the current time if the selected date is today
      return now;
    }
    // Return the start of the day if the selected date is not today
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0);
  };

  return (
    <View style={styles.container}>
      <View style={{ zIndex: 1000 }} >
        <Toast />
      </View>
      <AppointmentFormHeader navigation={navigation} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      {loadingImage && <Loader />}


      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <View>
            <DoctorProfileDeatilsCard data={data} />
          </View>
          <View style={{ marginTop: 10 }}>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: 20,
                padding: 16
              }}
            >
              <View style={styles.inputConatiner}>
                <Text style={styles.label}>Reason for Appointment</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Add some description"
                  value={appointmentReason}
                  onChangeText={(text) => {
                    setAppointmentReason(text);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      appointmentReason: "",
                    }));
                  }}
                  multiline
                  placeholderTextColor="#B0B0B0"
                />
                {errors.appointmentReason ? (
                  <Text style={styles.errorText}>
                    {errors.appointmentReason}
                  </Text>
                ) : null}
              </View>
              {/* <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  marginTop: 4,
                }}
              >
                <Image
                  style={{ height: 14, width: 14 }}
                  source={ImagesAssets.helping_icon}
                />
                <Text style={{ fontSize: 12 }}>Helping text for user</Text>
              </View> */}
            </View>
          </View>

          <View style={{ marginTop: 10 }}>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: 20,
                padding: 16,
              }}
            >
              <View style={styles.inputConatiner}>
                <Text style={styles.label}>Requested Date & Time</Text>
                <TouchableOpacity
                  onPress={() => {
                    modalRef.current = true
                    setShowDatePickerModal(true)
                  }}
                >
                  <View style={styles.rowContainer}>
                    <Text style={styles.dateText}>{formattedDate}</Text>

                    <Image
                      style={styles.calendarIcon}
                      source={ImagesAssets.uil_calendar}
                    />

                  </View>
                </TouchableOpacity>
                {errors.date ? (
                  <Text style={styles.errorText}>{errors.date}</Text>
                ) : null}
                {showDatePickerModal === true && (
                  Platform.OS === "ios" ? <CustomDateTimePicker
                    value={date}
                    mode="date"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    isVisible={showDatePickerModal}
                    onClose={() => setShowDatePickerModal(false)}
                    cancelText="Cancel"
                    confirmText="Done"
                    containerStyle={{ backgroundColor: "#fff" }}
                    buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
                  /> :
                    modalRef.current == true && <DateTimePicker
                      style={{ backgroundColor: "white" }}
                      value={date}
                      minimumDate={new Date()}
                      mode="date"
                      textColor="black"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleDateChange}
                    />
                )}
                <TouchableOpacity
                  onPress={() => {
                    modalRef.current = true; // Set modalRef.current to true
                    setShowTimePickerModal(true); // Toggle the modal visibility
                  }}
                >
                  <View style={[styles.rowContainer, { marginTop: 10 }]}>
                    <Text style={styles.dateText}>{formattedTime}</Text>

                    <Image
                      style={styles.calendarIcon}
                      source={ImagesAssets.uil_calendar}
                    />

                  </View>
                </TouchableOpacity>
                {errors.time ? (
                  <Text style={styles.errorText}>{errors.time}</Text>
                ) : null}
                {showTimePickerModal === true && (

                  Platform.OS === "ios" ?
                    <CustomDateTimePicker
                      value={time}
                      mode="time"
                      onChange={handleTimeChange}
                      minimumDate={getMinimumTime()}
                      isVisible={showTimePickerModal}
                      onClose={() => {
                        setShowTimePickerModal(false)
                      }}
                      cancelText="Cancel"
                      confirmText="Done"
                      containerStyle={{ backgroundColor: "#fff" }}
                      buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
                    /> :
                    modalRef.current == true && <DateTimePicker
                      value={time}
                      mode="time"
                      textColor="black"
                      style={{ backgroundColor: "white", }}
                      // display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleTimeChange}
                      minimumDate={getMinimumTime()} // Use the updated function here
                    />
                )}
              </View>
              {/* <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  marginTop: 4,
                }}
              >
                <Image
                  style={{ height: 14, width: 14 }}
                  source={ImagesAssets.helping_icon}
                />
                <Text style={{ fontSize: 12 }}>Helping text for user</Text>
              </View> */}
            </View>
          </View>
          {/* 
          <View style={{ marginTop: 7 }}>
            <View
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: 32,
                padding: 16,
              }}
            >
              <View style={styles.inputConatiner}>
                <Text style={styles.label}>Upload picture</Text>
                <View style={styles.inputConatiner}>
                  <TouchableOpacity
                    style={styles.rowContainerpicPHoto}
                    onPress={() => setShowImagePickerModal(true)}
                  >
                    <Image
                      style={{ height: 18, width: 18 }}
                      source={ImagesAssets.camra_icon}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins-SemiBold",
                        color: "black",
                      }}
                    >
                      Upload{" "}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.images ? (
                  <Text style={styles.errorText}>{errors.images}</Text>
                ) : null}
              </View>
            </View>
          </View> */}

          {/* {imageUris.length > 0 && (
            <View style={{ marginTop: 7 }}>
              <Text style={styles.label}>Selected Images</Text>
              <ScrollView horizontal style={{ marginTop: 8 }}>
                {imageUris.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => openImageModal(uri)}>
                      <Image
                        source={{ uri }}
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: 12,
                        }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(uri)}
                    >
                      <Text style={styles.removeText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )} */}
        </View>
      </ScrollView>

      <View
        style={{
          marginTop: 8,
          position: "absolute",
          width: "100%",
          bottom: "2%",
          paddingHorizontal: 14,
        }}
      >
        <View style={styles.inputConatiner}>
          <TouchableOpacity
            style={styles.rowContainerbutton}
            onPress={handleBookForm}
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
      </View>

      <View style={styles.bottomCard}>
        {/* <LottieView
          source={require("../../assets/Background.json")}
          autoPlay
          loop
          style={styles.lottieBackground}
          resizeMode="cover"
        /> */}
        <CustomLottie />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showImageViewerModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeImageViewerModal}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showImagePickerModal}
      >
        <View style={styles.optionModalContainer}>
          <View style={styles.optionModalContent}>
            <TouchableOpacity style={styles.optionButton} onPress={openCamera}>
              <Text
                style={[styles.optionText, { color: "rgba(6, 54, 31, 1)" }]}
              >
                Camera
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={openLibrary}>
              <Text
                style={[styles.optionText, { color: "rgba(6, 54, 31, 1)" }]}
              >
                Library
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setShowImagePickerModal(false)}
            >
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>




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
    paddingBottom: "20%",
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
    borderRadius: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "rgb(15, 15, 15)",
    marginBottom: 8,
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
    borderRadius: 8,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalImage: {
    width: "90%",
    height: "80%",
    borderRadius: 12,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    borderRadius: 18,
    padding: 5,
  },
  closeText: {
    fontSize: 40,
    color: "white",
  },
  imageContainer: {
    position: "relative",
    marginRight: 8,
  },
  removeButton: {
    position: "absolute",
    top: -16,
    right: -8,
    borderRadius: 12,
    padding: 2,
  },
  removeText: {
    fontSize: 25,
    color: "red",
  },
  optionModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  optionModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    width: "100%",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "red",
  },
  dateTimeModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dateTimeModalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});

export default AppointmentForm;
