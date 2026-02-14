import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import PhoneInput, { getCountryByPhoneNumber } from "react-native-international-phone-number";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { apiServerUrl } from "../Api";
import { ImagesAssets } from "../assets/ImagesAssets";
import Colors from "../colors/Colors";
import CustomDropdown from "../CommonApi";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import Loader from "../component/Loader";
import CustomDateTimePicker from "../component/Modals/CustomDateTimePicker";

const { width, height } = Dimensions.get("screen");

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  dob: Yup.string().required("Date of birth is required"),
  maritalStatus: Yup.string().required("Relationship status is required"),
  gender: Yup.string().required("Gender is required"),
  experience: Yup.string().required("Experience is required"),
  ethnicity: Yup.string().required("Ethnicity is required"),
  religion: Yup.string().required("Religion is required"),
  hobbies: Yup.array()
    .min(1, "Select at least one hobby")
    .required("Hobbies are required"),
  favoriteActivity: Yup.array()
    .min(1, "Select at least one Onboard interests")
    .required("Favorite activities are required"),
  about: Yup.string()
    .required("About is required")
    .min(20, "About should be at least 20 characters")
    .max(600, "About should not exceed 600 characters"),
});
const validationSchemaForSoreStaf = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  dob: Yup.string().required("Date of birth is required"),
  maritalStatus: Yup.string().optional("Relationship status is required"),
  gender: Yup.string().required("Gender is required"),
  experience: Yup.string().optional("Experience is required"),
  ethnicity: Yup.string().optional("Ethnicity is required"),
  religion: Yup.string().optional("Religion is required"),
  hobbies: Yup.array()
    .optional("Hobbies are required"),
  favoriteActivity: Yup.array()
    .optional("Favorite activities are required"),
  about: Yup.string()
    .required("About is required")
    .min(20, "About should be at least 20 characters")
    .max(600, "About should not exceed 600 characters"),
});

const EditProfile = ({ navigation, route }) => {
  const screen = route.params.screen;
  const scrollViewRef = useRef(null);
  const [inputRefs, setInputRefs] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() - 18))
  );
  const [errors, setErrors] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [selectedFavourite, setSelectedFavourite] = useState(profile?.favoriteActivity || []);
  const [selectedHobbies, setSelectedHobbies] = useState(profile?.hobbies || []);
  const [aboutContentHeight, setAboutContentHeight] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ start: 0, end: 0 });
  const [isInitialRender, setIsInitialRender] = useState(true);

  function extractLocalPhoneNumber(fullPhoneNumber, callingCode) {
    if (!callingCode?.startsWith("+")) {
      callingCode = `+${callingCode}`;
    }
    return fullPhoneNumber?.replace(callingCode, "") || "";
  }

  const GetDetails = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      if (!userDetails) throw new Error("User details not found");

      setLoading(true);
      const response = await axios({
        method: "GET",
        url: `${apiServerUrl}/user/viewUserProfile`,
        headers: {
          authToken: userDetails.authToken,
        },
        params: {
          userId: userDetails.id,
        },
      });

      if (response.data.responseCode === 200) {
        setProfile(response.data.result);
        const countryData = getCountryByPhoneNumber(response.data.result.mobileNumber);
        const localNumber = extractLocalPhoneNumber(
          response.data.result.mobileNumber,
          countryData?.callingCode
        );
        setInputValue(localNumber);
        setSelectedCountry(countryData);
      } else {
        console.error("Error fetching profile data");
      }
    } catch (error) {
      console.error("GetDetails error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetDetails();
  }, []);

  // New: Reset ScrollView position after profile data is loaded
  useEffect(() => {
    if (!loading && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
      setIsInitialRender(false); // Allow focus handling after initial render
    }
  }, [loading]);

  function handleInputValue(phoneNumber) {
    setInputValue(phoneNumber);
  }

  function handleSelectedCountry(country) {
    setSelectedCountry(country);
  }

  const hobbiesOptions = [
    { label: "🎨 Art & Craft", value: "🎨 Art & Craft" },
    { label: "🎵 Music", value: "🎵 Music" },
    { label: "📸 Photography", value: "📸 Photography" },
    { label: "💃 Dancing", value: "💃 Dancing" },
    { label: "🧘‍♀️ Yoga", value: "🧘‍♀️ Yoga" },
    { label: "🏋️‍♀️ Gym/Fitness", value: "🏋️‍♀️ Gym/Fitness" },
    { label: "🎮 Gaming", value: "🎮 Gaming" },
    { label: "📖 Reading", value: "📖 Reading" },
    { label: "🎬 Movies", value: "🎬 Movies" },
    { label: "🍳 Cooking", value: "🍳 Cooking" },
    { label: "⚽ Sports", value: "⚽ Sports" },
    { label: "🧘‍♂️ Meditation", value: "🧘‍♂️ Meditation" }
  ];

  const relationshipOptions = [
    { label: "Select Relationship Status", value: "" },
    { label: "Single", value: "single" },
    { label: "Married", value: "married" },
    { label: "Divorced", value: "divorced" },
    { label: "Widowed", value: "widowed" },
  ];

  const favoriteActivityOptions = [
    { label: "Movie Night", value: "Movie Night" },
    { label: "Gym Session", value: "Gym Session" },
    { label: "Karaoke", value: "Karaoke" },
    { label: "Crew Games (Cards, Ludo etc.)", value: "Crew Games (Cards, Ludo etc.)" },
    { label: "Jam Session", value: "Jam Session" },
    { label: "Meditation", value: "Meditation" },
    { label: "Cooking Challenge", value: "Cooking Challenge" },
    { label: "Sports Match", value: "Sports Match" },
    { label: "Drinks and Chats", value: "Drinks and Chats" }
  ];
  const genderOptions = [
    { label: "Gender", value: "" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  const experienceOptions = [
    { label: "0-1 years", value: "0-1" },
    { label: "2-5 years", value: "2-5" },
    { label: "5+ years", value: "5+" },
  ];

  const ethnicityOptions = [
    { label: "Ethnicity", value: "" },
    { label: "Asian", value: "asian" },
    { label: "Black / African Descent", value: "black" },
    { label: "Caucasian / White", value: "caucasian" },
    { label: "Hispanic / Latino", value: "hispanic" },
    { label: "Middle Eastern / North African", value: "middle_eastern" },
    { label: "Native American / Indigenous", value: "native_american" },
    { label: "Pacific Islander", value: "pacific_islander" },
    { label: "Mixed / Multiracial", value: "mixed" },
  ];

  const religionOptions = [
    { label: "Religion", value: "" },
    { label: "Buddhism", value: "buddhism" },
    { label: "Christianity", value: "christianity" },
    { label: "Hinduism", value: "hinduism" },
    { label: "Islam", value: "islam" },
    { label: "Judaism", value: "judaism" },
    { label: "Sikhism", value: "sikhism" },
    { label: "Jainism", value: "jainism" },
    { label: "Zoroastrianism", value: "zoroastrianism" },
    { label: "Taoism", value: "taoism" },
    { label: "Shinto", value: "shinto" },
    { label: "Other", value: "other" },
    { label: "No Religion", value: "no_religion" },
  ];

  const formik = useFormik({
    initialValues: {
      name: profile?.fullName || "",
      email: profile?.email || "",
      phone: profile?.mobileNumber || "",
      dob: profile?.dob || "",
      maritalStatus: profile?.relationshipStatus || "",
      gender: profile?.gender || "",
      experience: profile?.experience || "",
      ethnicity: profile?.ethnicity || "",
      religion: profile?.religion || "",
      country: profile?.nationality || "",
      title: profile?.designation || "",
      about: profile?.bio || "",
      hobbies: profile?.hobbies || [],
      favoriteActivity: profile?.favoriteActivity || [],
    },
    enableReinitialize: true,
    // validationSchema,
    onSubmit: async (values) => {
      try {
        const dbResult = await AsyncStorage.getItem("userDetails");
        const userDetails = JSON.parse(dbResult);
        if(userDetails?.department === "Shore_Staff"){
           await validationSchemaForSoreStaf.validate(values,{abortEarly: false});
          setErrors({});
        }
        else{
         const data = await validationSchema.validate(values, { abortEarly: false });
         console.log("data:sdlfksflksdf ", data);
          setErrors({});
        }
       
        if (!userDetails) throw new Error("User details not found");

        const body = {
          userId: userDetails.id,
          countryCode: userDetails.countryCode,
          dob: values.dob,
          mobileNumber: userDetails.mobileNumber,
          email: userDetails.email,
          fullName: values.name,
          relationshipStatus: values.maritalStatus,
          nationality: values.country,
          hobbies: values.hobbies,
          ethnicity: values.ethnicity,
          gender: values.gender,
          religion: values.religion,
          experience: values.experience,
          bio: values.about,
          favoriteActivity: values.favoriteActivity,
          isProfileCompleted: true,
        };
        for (const key in body) {
          const value = body[key];
        
          const isEmptyString = typeof value === "string" && value.trim() === "";
          const isEmptyArray = Array.isArray(value) && value.length === 0;
        
          if (isEmptyString || isEmptyArray) {
            delete body[key];
          }
        }

        setLoading(true);
        const response = await axios.put(`${apiServerUrl}/user/updateProfile`, body, {
          headers: {
            authToken: userDetails.authToken,
            "Content-Type": "application/json",
          },
        });

        if (response.data.responseCode === 200) {
          Toast.show({
            type: "success",
            text1: "Profile updated successfully",
            autoHide: true,
            visibilityTime: 2000,
            text1Style: {
              fontFamily: "WhyteInkTrap-Bold",
              lineHeight: 22,
              fontSize: 16,
              color: "#000",
            },
          });
          navigation.goBack();
        }
      } catch (error) {
        console.log("error:sdfdsjlfksdlfsdk ", error);
        if (error.name === "ValidationError") {
          const validationErrors = {};
          // Collect all error messages
          const errorMessages = error.inner.map((err) => err.message).join("\n");
          error.inner.forEach((err) => {
            validationErrors[err.path] = err.message;
          });
          setErrors(validationErrors);
          Toast.show({
            type: "error",
            text1: "Validation Error",
            text2: errorMessages || "Please fill all required fields correctly",
            autoHide: true,
            visibilityTime: 4000, // Increased to ensure readability
            text2Style: {
              fontSize: 14,
              color: "#000",
            },
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to update profile. Please try again",
            autoHide: true,
            visibilityTime: 2000,
            text2Style: {
              fontSize: 14,
              color: "#000",
            },
          });
          console.error("Error updating profile:", error);
        }
      } finally {
        setLoading(false);
      }
    }
  });

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  const handleDateConfirm = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const formattedDate = date.toLocaleDateString("en-GB");
      formik.setFieldValue("dob", formattedDate);
    }
  };

  const datePickerRef = useRef(null);

  const handleInputFocus = (inputName, cursorLine = 0) => {
    // Modified: Prevent focus handling during initial render
    if (isInitialRender) return;

    if (inputRefs[inputName] && scrollViewRef.current) {
      inputRefs[inputName].current.measureLayout(
        scrollViewRef.current.getInnerViewNode
          ? scrollViewRef.current.getInnerViewNode()
          : scrollViewRef.current,
        (x, y, width, height) => {
          const lineHeight = 16 * 1.5;
          const cursorOffset = cursorLine * lineHeight;
          const extraPadding = 80;
          const scrollTo = y - (height + extraPadding - cursorOffset);
          scrollViewRef.current.scrollTo({ y: scrollTo, animated: true });
        },
        (error) => {
          console.warn("Error measuring layout:", error);
        }
      );
    }
  };

  const handleSelectionChange = ({ nativeEvent: { selection } }) => {
    const text = formik.values.about || "";
    const lines = text.slice(0, selection.start).split("\n");
    const cursorLine = lines.length - 1;
    setCursorPosition(selection);
    if (aboutInputRef.current.isFocused()) {
      handleInputFocus("about", cursorLine);
    }
    // handleInputFocus("about", cursorLine);
  };

  const handleContentSizeChange = ({ nativeEvent: { contentSize } }) => {
    setAboutContentHeight(contentSize.height);
  };

  const aboutInputRef = useRef(null);
  useEffect(() => {
    setInputRefs({ about: aboutInputRef });
  }, []);

  return (
    <>
      <ProfleSettingHeader navigation={navigation} title="Edit Profile" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
        enabled
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
            {loading && <Loader />}
            <View style={styles.inputContainer}>
              <Image source={ImagesAssets.AccountIcon} style={styles.headerIcon} />
              <TextInput
                style={[styles.input, { marginLeft: 8, color: "#454545" }]}
                placeholder="Enter your name"
                placeholderTextColor="#B7B7B7"
                value={formik.values.name}
                onChangeText={(text) => formik.setFieldValue("name", text.trimStart())}
                editable={false}
                autoFocus={false} // New: Prevent auto-focus
              />
            </View>
            <ErrorMessage error={errors.name} />

            <View style={styles.inputContainer}>
              <Image source={ImagesAssets.EmailIcon} style={styles.headerIcon} />
              <TextInput
                style={[styles.input, { marginLeft: 8, color: "#454545" }]}
                placeholder="Enter your email"
                value={formik.values.email}
                keyboardType="email-address"
                onChangeText={formik.handleChange("email")}
                autoCapitalize="none"
                editable={false}
                autoFocus={false} // New: Prevent auto-focus
              />
            </View>
            <ErrorMessage error={errors.email} />

            <View style={styles.phoneInputContainer} pointerEvents="none">
              <PhoneInput
                value={inputValue}
                onChangePhoneNumber={handleInputValue}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={handleSelectedCountry}
                textInputStyle={{ backgroundColor: "#ffffff" }}
                flagButtonStyle={{ backgroundColor: "#ffffff" }}
                codeTextStyle={{ backgroundColor: "#ffffff" }}
                placeholder="Input your phone"
                defaultCountry="SG"
                disableCountryChange={true}
                phoneInputStyles={{ container: { borderWidth: 0 } }}
                editable={false}
                autoFocus={false} // New: Prevent auto-focus
              />
            </View>

            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => {
                setShowDatePicker(true);
                datePickerRef.current?.click();
              }}
            >
              <Image source={ImagesAssets.Calender} style={styles.headerIcon} />
              <Text style={styles.dateText}>{formik.values.dob || "Select Your DOB"}</Text>
            </TouchableOpacity>
            {formik.errors.dob && formik.touched.dob && <ErrorMessage error={formik.errors.dob} />}
            {showDatePicker && (
              <CustomDateTimePicker
                ref={datePickerRef}
                value={selectedDate}
                mode="date"
                onChange={handleDateConfirm}
                isVisible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                cancelText="Cancel"
                confirmText="Done"
                containerStyle={{ backgroundColor: "#fff" }}
                buttonTextStyle={{ fontSize: 18, color: "#84A402" }}
                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
              />
            )}

            <View style={styles.postOption}>
              <View style={styles.TextInputText}>
                <CustomDropdown
                  data={genderOptions}
                  value={formik.values.gender}
                  onChange={(value) => formik.setFieldValue("gender", value)}
                  placeholder="Select Gender"
                  dropdownStyle={{ width: "100%" }}
                  renderLeftIcon={() => (
                    <Image
                      style={[styles.icon, { width: 20, height: 20, marginLeft: -2, marginRight: 10 }]}
                      source={ImagesAssets.gender}
                    />
                  )}
                />
              </View>
            </View>
            <ErrorMessage error={errors.gender} />

            <View style={styles.postOption}>
              <View style={styles.TextInputText}>
                <CustomDropdown
                  data={experienceOptions}
                  value={formik.values.experience}
                  onChange={(value) => formik.setFieldValue("experience", value)}
                  placeholder="Select Experience"
                  dropdownStyle={{ width: "100%" }}
                  renderLeftIcon={() => (
                    <Image
                      style={[styles.icon, { width: 20, height: 20, marginLeft: -2, marginRight: 10 }]}
                      source={ImagesAssets.expertiseIcon}
                    />
                  )}
                />
              </View>
            </View>
            <ErrorMessage error={errors.experience} />

            <View style={styles.postOption}>
              <View style={styles.TextInputText}>
                <CustomDropdown
                  data={ethnicityOptions}
                  value={formik.values.ethnicity}
                  onChange={(value) => formik.setFieldValue("ethnicity", value)}
                  placeholder="Select Ethnicity"
                  dropdownStyle={{ width: "100%" }}
                  renderLeftIcon={() => (
                    <Image
                      style={[styles.icon, { width: 20, height: 20, marginLeft: -2, marginRight: 10 }]}
                      source={ImagesAssets.ethnicityIcon}
                    />
                  )}
                />
              </View>
            </View>
            <ErrorMessage error={errors.ethnicity} />

            <View style={styles.postOption}>
              <View style={styles.TextInputText}>
                <CustomDropdown
                  data={relationshipOptions}
                  value={formik.values.maritalStatus}
                  onChange={(value) => formik.setFieldValue("maritalStatus", value)}
                  placeholder="Select Relationship Status"
                  dropdownStyle={{ width: "100%" }}
                  renderLeftIcon={() => (
                    <Image
                      style={[styles.icon, { width: 20, height: 20, marginLeft: -2, marginRight: 10 }]}
                      source={ImagesAssets.relationshipIcon}
                    />
                  )}
                />
              </View>
            </View>
            <ErrorMessage error={errors.maritalStatus} />

            <View style={styles.postOption}>
              <View style={styles.TextInputText}>
                <CustomDropdown
                  data={religionOptions}
                  value={formik.values.religion}
                  onChange={(value) => formik.setFieldValue("religion", value)}
                  placeholder="Select Religion"
                  dropdownStyle={{ width: "100%" }}
                  renderLeftIcon={() => (
                    <Image
                      style={[styles.icon, { width: 20, height: 20, marginLeft: -2, marginRight: 10 }]}
                      source={ImagesAssets.religionIcon}
                    />
                  )}
                />
              </View>
            </View>
            <ErrorMessage error={errors.religion} />

            <MultiSelect
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              itemSelectedStyle={styles.itemSelectedStyle}
              activeColor={Colors.secondary}
              data={hobbiesOptions}
              labelField="label"
              valueField="value"
              placeholder="Pick your hobbies (Multi-Select)"
              value={formik.values.hobbies}
              // onChange={(items) => {
              //   if (items.length <= 3) {
              //     setSelectedHobbies(items);
              //     formik.setFieldValue("hobbies", items);
              //   } else {
              //   }
              // }}
              onChange={(items) => {
                // if (items.length >3) return
                setSelectedHobbies(items);
                formik.setFieldValue("hobbies", items);
              }}
              renderSelectedItem={(item, unSelect) => (
                <TouchableOpacity
                  style={styles.selectedStyle}
                  onPress={() => unSelect && unSelect(item)}
                >
                  <Text style={styles.textSelectedStyle}>{item.label}</Text>
                  <Image
                    style={[styles.icon, { height: 18, width: 18, marginLeft: 5 }]}
                    source={ImagesAssets.closeIcons}
                  />
                </TouchableOpacity>
              )}
              renderLeftIcon={() => (
                <Image
                  style={[styles.icon, { width: 20, height: 20, marginLeft: 4, marginRight: 10 }]}
                  source={ImagesAssets.hobbiesIcon}
                />
              )}
            />
            <ErrorMessage error={errors.hobbies} />

            <MultiSelect
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              itemSelectedStyle={styles.itemSelectedStyle}
              activeColor={Colors.secondary}
              data={favoriteActivityOptions}
              labelField="label"
              valueField="value"
              placeholder="Favourite onboard activity (Multi-Select)"
              value={formik.values.favoriteActivity}
              onChange={(items) => {
                // if (items.length >3) return
                setSelectedFavourite(items);
                formik.setFieldValue("favoriteActivity", items);
              }}
              renderSelectedItem={(item, unSelect) => (
                <TouchableOpacity
                  style={styles.selectedStyle}
                  onPress={() => unSelect && unSelect(item)}
                >
                  <Text style={styles.textSelectedStyle}>{item.label}</Text>
                  <Image
                    style={[styles.icon, { height: 18, width: 18, marginLeft: 5 }]}
                    source={ImagesAssets.closeIcons}
                  />
                </TouchableOpacity>
              )}
              renderLeftIcon={() => (
                <Image
                  style={[styles.icon, { width: 20, height: 20, marginLeft: 4.5, marginRight: 10 }]}
                  source={ImagesAssets.favoriteIcon}
                />
              )}
            />
            <ErrorMessage error={errors.favoriteActivity} />

            <View style={[styles.inputContainerTextArea, { height: 100, marginTop: 10 }]}>
              <TextInput
                ref={aboutInputRef}
                mode="outlined"
                label="About You"
                placeholder="Tell Us About Yourself."
                placeholderTextColor="#B7B7B7"
                value={formik.values.about}
                onChangeText={formik.handleChange("about")}
                multiline
                maxLength={600}
                style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                onFocus={() => {
                  handleInputFocus("about")
                }}
                onSelectionChange={handleSelectionChange}
                onContentSizeChange={handleContentSizeChange}
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                keyboardType="default"
                autoFocus={false} // New: Prevent auto-focus
              />
            </View>
            <ErrorMessage error={errors.about} />

            <TouchableOpacity style={styles.button} onPress={formik.handleSubmit}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
        <Toast />
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 10,
    marginTop: 5
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 10,
  },
  scrollView: {
    paddingBottom: Platform.OS === "ios" ? 200 : 150,
  },
  itemSelectedStyle: {
    backgroundColor: Colors.secondary,
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#c1c1c1",
    borderRadius: 20,
    backgroundColor: Colors.secondary,
  },
  textSelectedStyle: {
    color: "#000",
    fontSize: 12,
  },
  inputContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainerTextArea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  dropdown: {
    marginTop: 5,
    marginBottom: 5,
    height: 50,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  placeholderStyle: {
    color: "#B7B7B7",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  phoneInputContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#454545",
    paddingLeft: 10,
  },
  button: {
    height: 50,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    lineHeight: 22,
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#fff",
  },
  headerIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginLeft: 2,
  },
  postOption: {
    flexDirection: "row",
    paddingHorizontal: 10,
    width: "100%",
    height: height * 0.055,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFFB2",
    borderRadius: 10,
    borderWidth: 0.5,
    marginBottom: 10,
    borderColor: "#ccc",
  },
  TextInputText: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 5,
  },
});

export default EditProfile;