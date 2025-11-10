import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { TextInput, Card, Text } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import ProfileSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiServerUrl } from "../Api";
import Loader from "../component/Loader";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ImagesAssets } from "../assets/ImagesAssets";
import LottieView from "lottie-react-native";
import CustomLottie from "../component/CustomLottie";
import CustomDateTimePicker from "../component/Modals/CustomDateTimePicker";
import api from "../CustomAxios";
import { useTranslation } from "react-i18next";

const { height, width } = Dimensions.get("screen");

const WorkExperienceScreen = ({ navigation }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState(null); // Store as Date object
  const [endDate, setEndDate] = useState(null); // Store as Date object
  const [experiences, setExperiences] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteID] = useState("");
  const [editId, setEditID] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

  const convertToISOString = (dateString) => {
    const [day, month, year] = dateString.split("/");
    const date = new Date(Date.UTC(year, month - 1, day, 11, 18, 0));
    return date.toISOString();
  };

  const [errors, setErrors] = useState({
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
  });

  const handleJobTitleChange = (text) => {
    setJobTitle(text);
    if (text.trim() !== "") {
      setErrors((prev) => ({ ...prev, jobTitle: "" }));
    }
  };

  const handleCompanyChange = (text) => {
    setCompany(text);
    if (text.trim() !== "") {
      setErrors((prev) => ({ ...prev, company: "" }));
    }
  };

  const handleStartDateConfirm = (event, date) => {
    setShowStartDatePicker(false);

    if (date) {
      setStartDate(date);
    }
  };

  const handleEndDateConfirm = (event, date) => {
    setShowEndDatePicker(false);
    if (date) {
      setEndDate(date);
    }
  };

  const handleDelete = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      setLoading(true);
      const response = await axios({
        method: "PUT",
        url: `${apiServerUrl}/user/updateProfile`,
        headers: {
          authToken: userDetails.authToken,
        },
        data: {
          userId: userDetails.id,
          workingExperience: [
            {
              id: deleteId, // Replace with actual ID
              status: "DELETE",
            },
          ],
        },
      });


      if (response.data.responseCode === 200) {
        getProfileDetails();
        Toast.show({
          type: "success",
          text1: t('workingexperiencedeleted'),
          text2: response.responseMessage,
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            paddingTop: 10,
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
        setDeleteID("");
      }
    } catch (error) {
      console.log("API Error:", error.response?.data || error.message);
      Toast.show({
        type: "error",
        text1: "Something went wrong!",
        text2: response.responseMessage,
        autoHide: true,
        visibilityTime: 2000,
        text1Style: {
          paddingTop: 10,
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
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  // Validate Inputs on Submit
  const validateInputs = () => {
    const newErrors = {
      jobTitle: jobTitle.trim() ? "" : t('jobTitleRequired'),
      company: company.trim() ? "" : t('companyRequired'),
      startDate: startDate ? "" : t('startDateRequired'),
      endDate: endDate ? "" : t('endDateRequired'),
    };

    if (startDate && endDate && startDate > endDate) {
      newErrors.startDate = t('startAfterEnd');
      newErrors.endDate = t('endBeforeStart');
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const addExperience = async () => {
    if (!validateInputs()) return;

    const newExperience = {
      jobTitle,
      company,
      duration: `${new Date(startDate).toLocaleDateString()} - ${new Date(
        endDate
      ).toLocaleDateString()}`,
    };


    await updateWorkExperience(jobTitle, company, startDate, endDate);

    // Reset fields after adding the experience
    setJobTitle("");
    setCompany("");
    setStartDate(null);
    setEndDate(null);
  };

  const updateWorkExperience = async (
    jobTitle,
    company,
    startDate,
    endDate
  ) => {
    try {
      setLoading(true);

      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) {
        throw new Error("No user details found");
      }

      const userDetails = JSON.parse(dbResult);

      // Prepare the experience data
      let newExperience = {
        // id: editId || "",
        companyName: company,
        role: jobTitle,
        from: new Date(startDate).toLocaleDateString(),
        to: new Date(endDate).toLocaleDateString(),
      };

      if (isUpdate === true && editId !== "") {
        newExperience.id = editId;
      }

      // Send the updated work experience (include both new and previous experiences)
      const updatedExperiences = [...experiences, newExperience];

      const body = {
        userId: userDetails.id,
        workingExperience: updatedExperiences,
      };


      const response = await axios.put(
        `${apiServerUrl}/user/updateProfile`,
        body,
        {
          headers: {
            authToken: userDetails.authToken,
            "Content-Type": "application/json",
          },
        }
      );


      if (response.data.responseCode === 200) {
        getProfileDetails();
        if (isUpdate === true) {
          setIsUpdate(false);
          setEditID("");
        }
        Toast.show({
          type: "success",
          text1: t('workingexperienceaddedsuccessfully'),
        });
      } else {
        console.error("Error updating profile:", response.data);
      }
    } catch (error) {
      console.error("Update Profile Error:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileDetails = async () => {
    try {
      setLoading(true);
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) throw new Error("No user details found");
      const userDetails = JSON.parse(dbResult);

      const response = await api.get(`${apiServerUrl}/user/viewUserProfile`, {
        headers: { authToken: userDetails.authToken },
        params: { userId: userDetails.id },
      });

      if (response.data.responseCode === 200) {
        // Add existing experiences to state
        setExperiences(response.data.result.workingExperience);
      } else {
        console.error("Error fetching profile data:", response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfileDetails();
  }, []);

  return (
    <>
      <ProfileSettingHeader
        navigation={navigation}
        title={t('shipboard_experience')}
      />
      {loading && <Loader />}
      <View style={{ flex: 1, padding: 14 }}>
        <View style={{ marginBottom: 5 }}>
          <TextInput
            label={t('jobtitle')}
            value={jobTitle}
            onChangeText={handleJobTitleChange}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              fontFamily: "Poppins-Regular",
              fontSize: 16,
              backgroundColor: "#fff",
              color: "#000",
            }}
          />
          {errors.jobTitle && (
            <Text style={{ color: "red" }}>{errors.jobTitle}</Text>
          )}
        </View>

        <View style={{ marginBottom: 5 }}>
          <TextInput
            label={t('companyname')}
            value={company}
            onChangeText={handleCompanyChange}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              color: "#000",
              fontFamily: "Poppins-Regular",
              fontSize: 16,
              backgroundColor: "#fff",
            }}
          />
          {errors.company && (
            <Text style={{ color: "red" }}>{errors.company}</Text>
          )}

        </View>
        <View style={{ marginBottom: 5 }}>
          <Pressable onPress={() => setShowStartDatePicker(true)}>
            <TextInput
              label={t('startdate')}
              value={startDate ? new Date(startDate).toLocaleDateString() : ""}
              mode="outlined"
              editable={false}
              pointerEvents="none" // ⬅️ Important
              style={{
                fontFamily: "Poppins-Regular",
                fontSize: 16,
                backgroundColor: "#fff",
              }}
            />
          </Pressable>

          {errors.startDate && (
            <Text style={{ color: "red" }}>{errors.startDate}</Text>
          )}


        </View>


        {showStartDatePicker && (
          <CustomDateTimePicker
            value={new Date()}
            mode="date"
            onChange={handleStartDateConfirm}
            isVisible={showStartDatePicker}
            onClose={() => setShowStartDatePicker(false)}
            cancelText="Cancel"
            confirmText="Done"
            containerStyle={{ backgroundColor: "#fff" }}
            buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
            maximumDate={new Date()}
          />

          // <DateTimePicker
          //   value={new Date()}
          //   mode="date"
          //   textColor="black"
          //   // display="default"
          //   display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          //   onChange={handleStartDateConfirm}
          //   maximumDate={new Date()}
          // />
        )}

        <Pressable onPress={() => setShowEndDatePicker(true)}>
          <TextInput
            label={t('enddate')}
            value={endDate ? new Date(endDate).toLocaleDateString() : ""}
            mode="outlined"
            editable={false}
            pointerEvents="none" // ⬅️ Important
            style={{
              fontFamily: "Poppins-Regular",
              fontSize: 16,
              backgroundColor: "#fff",
            }}
          />
        </Pressable>

        {errors.endDate && (
          <Text style={{ color: "red" }}>{errors.endDate}</Text>
        )}

        {showEndDatePicker && (
          <CustomDateTimePicker
            value={new Date()}
            mode="date"
            onChange={handleEndDateConfirm}
            isVisible={showEndDatePicker}
            onClose={() => setShowEndDatePicker(false)}
            cancelText="Cancel"
            confirmText="Done"
            containerStyle={{ backgroundColor: "#fff" }}
            buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
            maximumDate={new Date()}
          />
          // <DateTimePicker
          //   value={new Date()}
          //   mode="date"
          //   // display="default"
          //   textColor="black"
          //   display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          //   onChange={handleEndDateConfirm}
          //   maximumDate={new Date()}
          // />
        )}

        {isUpdate === false ? (
          <TouchableOpacity
            onPress={addExperience}
            style={{
              borderRadius: 8,
              marginVertical: 20,
              height: 50,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000",
            }}
          >
            <Text
              style={{
                color: "#fff",
                lineHeight: 27,
                fontFamily: "WhyteInktrap-Medium",
                fontWeight: "500",
                fontSize: 18,
              }}
            >
              {t('addexperience')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={addExperience}
            style={{
              borderRadius: 8,
              marginVertical: 20,
              height: 50,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000",
            }}
          >
            <Text
              style={{
                color: "#fff",
                lineHeight: 27,
                fontFamily: "WhyteInktrap-Medium",
                fontWeight: "500",
                fontSize: 18,
              }}
            >
              {t('editexperience')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Date Pickers */}



        {/* Work Experience List */}
        {/* {experiences?.length > 0 ? ( */}
        <FlatList
          data={experiences}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 8,
                marginBottom: 10,
                padding: 10,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <View>
                <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 11 }}>
                  {item.companyName}
                </Text>
                <Text style={{ fontFamily: "Poppins-Regular", fontSize: 12 }}>
                  {item.role}
                </Text>
                <Text style={{ fontFamily: "Poppins-Regular", fontSize: 10 }}>
                  {item.from} - {item.to}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    setEditID(item.id);
                    setCompany(item.companyName);
                    setJobTitle(item.role);
                    const fromDate = convertToISOString(item.from);
                    setStartDate(fromDate);
                    const toDate = convertToISOString(item.to);
                    setEndDate(toDate);
                    setIsUpdate(true);
                  }}
                >
                  <Image
                    source={ImagesAssets.editIcon}
                    style={{
                      height: 16,
                      width: 16,
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    setDeleteID(item.id);
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        {/* ) : (
          <Text>No experience added yet.</Text>
        )} */}
      </View>
      <Toast />
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {t('deleteexperiencetitle')}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteID("");
                  setModalVisible(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>{t('no')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete()}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>{t('yes')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View
        style={{
          // flex: 1,
          backgroundColor: "#c1c1c1",
          overflow: "hidden",
          height: "50%",
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          zIndex: -1,
          // flexBasis: 200,
          position: "absolute",
          bottom: 0,
        }}
      >
        {/* <LottieView
          source={require("../assets/Background.json")}
          autoPlay
          loop
          resizeMode="cover"
          style={styles.lottieBackground}
        /> */}
        <CustomLottie />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  lottieBackground: {
    width: width * 1,
    height: height * 0.68,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    // position: "absolute",
    // bottom: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width * 0.8,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 10,
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
});

export default WorkExperienceScreen;
