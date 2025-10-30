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

const { height, width } = Dimensions.get("screen");

const Certifications = ({ navigation }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState(null); // Store as Date object
  const datePickerRef = React.useRef(null);
  const [endDate, setEndDate] = useState(null); // Store as Date object
  const [experiences, setExperiences] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteID] = useState("");
  const [editId, setEditID] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);


  const convertToISOString = (dateString) => {
    // Split the input date (assuming format is "DD/MM/YYYY")
    const [day, month, year] = dateString.split("/");

    // Create a Date object in UTC format
    const date = new Date(Date.UTC(year, month - 1, day, 11, 18, 0));

    // Convert to ISO string format
    return date.toISOString();
  };

  // const formatDate = (editId) => {
  //   if (!editId?.from) return "N/A";
  //   const parsedDate = moment(date, "DD/MM/YYYY", true);
  //   if (!parsedDate.isValid()) {
  //     return "Invalid date";
  //   }
  //   return parsedDate.format("YYYY-MM-DD");
  // };

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
          certifications: [
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
          text1: "Certificate deleted.",
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

  const validateInputs = () => {
    const newErrors = {
      jobTitle: jobTitle ? "" : "Certificate name is required.",
      company: company ? "" : "Organization name is required.",
      startDate: startDate ? "" : "Start Date is required.",
      endDate: endDate ? "" : "End Date is required.",
    };

    // Date validation: Start Date should not be later than End Date
    if (startDate && endDate && startDate > endDate) {
      newErrors.startDate = "Start Date cannot be later than End Date.";
      newErrors.endDate = "End Date cannot be earlier than Start Date.";
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


    // Update the state immediately to show the new experience in the UI
    // setExperiences((prevExperiences) => [...prevExperiences, newExperience]);

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
        certifications: updatedExperiences,
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
          text1: "Certificate added successfully.",
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
        setExperiences(response.data.result.certifications);

         if (response.data.result?.companyLogo) {
          userDetails.companyLogo = response?.data?.result?.companyLogo
        }
        if (response.data.result?.companyName) {
          userDetails.companyName = response?.data?.result?.companyName
        }
        if (response.data.result?.companyDescription) {
          userDetails.companyDescription = response?.data?.result?.companyDescription
        }
        await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
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
      <ProfileSettingHeader navigation={navigation} title="Certifications" />
      {loading && <Loader />}
      <View style={{ flex: 1, padding: 14 }}>
        {/* <TextInput
          label="Certificate Name"
          value={jobTitle}
          onChangeText={setJobTitle}
          mode="outlined"
          style={{
            marginBottom: 10,
            fontFamily: "Poppins-Regular",
            fontSize: 16,
          }}
        />
        {errors.jobTitle && (
          <Text style={{ color: "red" }}>{errors.jobTitle}</Text>
        )}

        <TextInput
          label="Organization Name"
          value={company}
          onChangeText={setCompany}
          mode="outlined"
          style={{
            marginBottom: 10,
            fontFamily: "Poppins-Regular",
            fontSize: 16,
          }}
        />
        {errors.company && (
          <Text style={{ color: "red" }}>{errors.company}</Text>
        )} */}

        <TextInput
          label="Certificate Name"
          value={jobTitle}
          onChangeText={handleJobTitleChange}
          mode="outlined"
          style={{
            marginBottom: 10,
            fontFamily: "Poppins-Regular",
            fontSize: 16,
          }}
        />
        {errors.jobTitle && (
          <Text style={{ color: "red" }}>{errors.jobTitle}</Text>
        )}

        <TextInput
          label="Organization Name"
          value={company}
          onChangeText={handleCompanyChange}
          mode="outlined"
          style={{
            marginBottom: 10,
            fontFamily: "Poppins-Regular",
            fontSize: 16,
          }}
        />
        {errors.company && (
          <Text style={{ color: "red" }}>{errors.company}</Text>
        )}

        {/* Start Date Picker */}
        <TouchableOpacity
          onPress={() => {
            setShowStartDatePicker(true);
          }}
        >
          <TextInput
            label="Start Date"
            value={startDate ? new Date(startDate).toLocaleDateString() : ""}
            mode="outlined"
            editable={false} // Prevents keyboard
            pointerEvents="none" // ⬅️ Important
            style={{
              marginBottom: 10,
              fontFamily: "Poppins-Regular",
              fontSize: 16,
            }}
          />
        </TouchableOpacity>

        {errors.startDate && (
          <Text style={{ color: "red" }}>{errors.startDate}</Text>
        )}
        {showStartDatePicker && (
          <CustomDateTimePicker
            ref={datePickerRef}
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
          //   ref={datePickerRef}
          //   // display="default"
          //   display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          //   textColor="black"
          //   onChange={handleStartDateConfirm}
          //   maximumDate={new Date()}
          // />
        )}

        {/* End Date Picker */}
        <TouchableOpacity
          onPress={() => {
            setShowEndDatePicker(true);
          }}
        >
          <TextInput
            label="End Date"
            value={endDate ? new Date(endDate).toLocaleDateString() : ""}
            mode="outlined"
            editable={false} // Prevents keyboard
            pointerEvents="none" // ⬅️ Important
            style={{
              marginBottom: 10,
              fontFamily: "Poppins-Regular",
              fontSize: 16,
            }}
          />
        </TouchableOpacity>
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
              Add Certification
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
              Edit Certification
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
            // <Card
            //   style={{
            //     marginBottom: 10,
            //     padding: 10,
            //     backgroundColor: "rgba(255, 255, 255, 0.8)",
            //     // backgroundColor: "gray",
            //   }}
            // >
            //   <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 16 }}>
            //     {item.companyName}
            //   </Text>
            //   <Text style={{ fontFamily: "Poppins-Regular", fontSize: 14 }}>
            //     {item.role}
            //   </Text>
            //   <Text style={{ fontFamily: "Poppins-Regular", fontSize: 14 }}>
            //     {item.from} - {item.to}
            //   </Text>
            //   <TouchableOpacity
            //     onPress={() => {
            //       setEditID(item.id);
            //       setCompany(item.companyName);
            //       setJobTitle(item.role);
            //       const fromDate = convertToISOString(item.from);
            //       setStartDate(fromDate);
            //       const toDate = convertToISOString(item.to);
            //       setEndDate(toDate);
            //       setIsUpdate(true);
            //     }}
            //   >
            //     <Image
            //       source={ImagesAssets.editIcon}
            //       style={{
            //         height: 25,
            //         width: 25,
            //         top: -75,
            //         right: -5,
            //         position: "absolute",
            //         // backgroundColor: "red",
            //       }}
            //     />
            //   </TouchableOpacity>
            //   <TouchableOpacity
            //     onPress={() => {
            //       setDeleteID(item.id);
            //       setModalVisible(true);
            //     }}
            //     // onPress={() => handleDelete(item.id)}
            //     style={{
            //       top: 45,
            //       right: -5,
            //       position: "absolute",
            //       // backgroundColor: "red",
            //       // height: height * 0.1,
            //       // width: 100,
            //     }}
            //   >
            //     <Ionicons
            //       name={"trash-outline"}
            //       size={25}
            //       color="red"
            //       // style={styles.leftIcon}
            //     />
            //   </TouchableOpacity>
            // </Card>
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
              <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 12 }}>
                  {item.role}
                </Text>
                <Text style={{ fontFamily: "Poppins-Regular", fontSize: 10}}>
                  {item.companyName}
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
        {/* // ) : (
        //   <Text>No certification added yet.</Text>
        // )} */}
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
              Are you sure you want to delete this certifications?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteID("");
                  setModalVisible(false);
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete()}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Yes</Text>
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

export default Certifications;
