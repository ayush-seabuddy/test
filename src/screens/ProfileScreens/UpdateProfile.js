import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import { Picker } from "@react-native-picker/picker";
import { Formik } from "formik";
import * as Yup from "yup";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import ProfilDetailsHeader from "../../component/headers/ProfilDetailsHeader";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Icon from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import { apiCall, apiCallWithToken, apiServerUrl } from "../../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width, height } = Dimensions.get("window");
import Spinner from "react-native-loading-spinner-overlay";
import { MultiSelect, Dropdown } from "react-native-element-dropdown";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import { Checkbox } from "react-native-paper";

import firestore from "@react-native-firebase/firestore";
import CustomLottie from "../../component/CustomLottie";
import DropdownFieldIOS from "../../component/DropdownIOS";
import axios from "axios";
import api from "../../CustomAxios";
const UpdateProfile = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [visibleSnackbar, setVisibleSnackbar] = React.useState("");
  const [SnackbarAlert, setSnackbarAlert] = React.useState(false);
  const [checked, setChecked] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isRelationshipOpen, setIsRelationshipOpen] = useState(false);
  const [ethnicityFocus, setEthnicityFocus] = useState(false);
  const [religionFocus, setReligionFocus] = useState(false);
  const [healthConcernsFocus, setHealthConcernsFocus] = useState(false);
  const [activeStatus, setActiveStatus] = useState(false);
  const [smokeFocus, setSmokeFocus] = useState(false);
  const [sociallyConnectedStatus, setsociallyConnectedStatus] = useState(false);
  const [alcoholFocus, setAlcoholFocus] = useState(false);

  const showAlert = (alert, _timeOut) => {
    setSnackbarAlert(alert);
    setVisibleSnackbar(true);
    setTimeout(() => {
      setVisibleSnackbar(false);
    }, _timeOut);
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  var myProfile = route.params.imageurl;
  const navigateProfile = () => {
    navigation.navigate("UploadPhoto");
  };
  const navigateTerm = () => {
    navigation.navigate("Terms and Conditions");
  };

  const [step, setStep] = React.useState(1);

  var _userdata;
  var token;
  React.useEffect(() => {
    const fetchEmail = async () => { };
    fetchEmail();
  }, []);
  // Dropdown options

  const [selected, setSelected] = useState([]);
  const [selectedFavourite, setSelectedFavourite] = useState([]);
  const [nationList, setNationList] = useState([])
  const [userDetails, setUserDetails] = useState(null);

  const ViewProfiledetails = async () => {
    try {

      const response = await api.get(
        `${apiServerUrl}/user/getAllCountries`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      // const response =
      //   await apiCall(
      //   `${apiServerUrl}/user/getAllCountries`,
      //   "GET",
      //   null,
      // );
      if (response?.data?.responseCode === 200) {
        let countryArray = []
        response?.data?.result?.map(item => {
          countryArray.push({ label: item.name, value: item.name })
        })
        setNationList(countryArray)
      }
    } catch (error) {
      console.log(error);
      //  setLoading(false);
    } finally {
      //  setLoading(false);
    }
  };

  useEffect(() => {
    ViewProfiledetails()
    getUserProfile()
  }, [])



  const getUserProfile = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) {
        Alert.alert("User data not found", "Please login again.");
        return;
      }

      try {
        const parsedUserDetails = JSON.parse(dbResult);
        setUserDetails(parsedUserDetails);
      } catch (e) {
        console.error("JSON parse error:", e);
        Alert.alert("Invalid user data", "Please re-login to continue.");
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      Alert.alert("An error occurred", "Please try again later.");
    }
  };





  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  // const rankOptions = [
  //   { label: "Rank", value: "" },
  //   { label: "Caption (Deck)", value: "Caption" },
  //   { label: "Chief Officer (Deck)", value: "Chief Officer" },
  //   { label: "Second Officer (Deck)", value: "Second Officer" },
  //   { label: "Third Officer (Deck)", value: "Third Officer" },
  //   { label: "Deck Cadet (Deck)", value: "Deck Cadet" },
  //   { label: "Deck Fitter (Deck)", value: "Deck Fitter" },
  //   { label: "Bosun (Deck)", value: "Bosun" },
  //   { label: "Able Seaman (Deck)", value: "Able Seaman" },
  //   { label: "Ordinary Seaman (Deck)", value: "Ordinary Seaman" },
  //   { label: "Chief Cook (Catering)", value: "Chief Cook" },
  //   { label: "Messman (Catering)", value: "Messman" },
  //   { label: "Chief Engineer (Engine)", value: "Chief Engineer" },
  //   { label: "Second Engineer (Engine)", value: "Second Engineer" },
  //   { label: "Third Engineer (Engine)", value: "Third Engineer" },
  //   { label: "Fourth Engineer (Engine)", value: "Fourth Engineer" },
  //   { label: "Junior Engineer (Engine)", value: "Junior Engineer" },
  //   { label: "Engine Cadet (Engine)", value: "Engine Cadet" },
  //   {
  //     label: "Electrical Engineer/ ETO (Engine)",
  //     value: "Electrical Engineer/ ETO",
  //   },
  //   { label: "Electrical Cabet (Engine)", value: "Electrical Cabet" },
  //   { label: "Engine Fitter (Engine)", value: "Engine Fitter" },
  //   { label: "Motarman/Oiler (Engine)", value: "Motarman/Oiler" },
  //   { label: "Wiper (Engine)", value: "Wiper" },
  //   { label: "Office Staff", value: "Office Staff" },
  //   { label: "Junior Officer", value: "Junior Officer" },
  //   { label: "Pumpman", value: "Pumpman" },
  // ];

  const experienceOptions = [
    { label: "0-1 years", value: "0-1" },
    { label: "2-5 years", value: "2-5" },
    { label: "5+ years", value: "5+" },
  ];

  const relationshipOptions = [
    { label: "Single", value: "single" },
    { label: "Married", value: "married" },
    { label: "Divorced", value: "divorced" },
    { label: "Widowed", value: "widowed" },
  ];

  const healthConditionOptions = [
    { label: "None", value: "None" },
    { label: "Hypertension", value: "Hypertension" },
    { label: "Diabetes", value: "Diabetes" },
    { label: "Anxiety", value: "Anxiety" },
    { label: "Depression", value: "Depression" },
    { label: "Other (specify)", value: "Other" },
    { label: "Prefer not to say", value: "Prefer not to say" },
  ];

  const howactiveYouAreOptions = [
    { label: "Mostly inactive (e.g. no intentional exercise)", value: "Mostly inactive (e.g. no intentional exercise)" },
    { label: "Lightly active (e.g. walking, basic tasks)", value: "Lightly active (e.g. walking, basic tasks)" },
    { label: "Moderately active (e.g. 2–3 workouts/week)", value: "Moderately active (e.g. 2–3 workouts/week)" },
    { label: "Very active (e.g. gym, sports, or yoga)", value: "Very active (e.g. gym, sports, or yoga)" },
    { label: "Prefer not to say", value: "Prefer not to say" },
  ];

  const ethnicityOptions = [
    { label: "Asian", value: "asian" },
    { label: "Black / African Descent", value: "Black / African Descent" },
    { label: "Caucasian / White", value: "Caucasian / White" },
    { label: "Hispanic / Latino", value: "Hispanic / Latino" },
    { label: "Middle Eastern / North African", value: "Middle Eastern / North African" },
    { label: "Native American / Indigenous", value: "Native American / Indigenous" },
    { label: "Pacific Islander", value: "Pacific Islander" },
    { label: "Mixed / Multiracial", value: "Mixed / Multiracial" },
  ];

  const religionOptions = [
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
    { label: "Other", value: "Other" },
    { label: "No Religion", value: "No Religion" }
  ];

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

  const SmokerOprions = [
    { label: "No", value: "No" },
    { label: "Occasionally (e.g. social or stress-related)", value: "Occasionally (e.g. social or stress-related)" },
    { label: "Regularly (daily or near-daily)", value: "Regularly (daily or near-daily)" },
    { label: "Trying to quit", value: "Trying to quit" },
    { label: "Prefer not to say", value: "Prefer not to say" }
  ];

  const sociallyConnectedOptions = [
    { label: "Yes, I have good connections", value: "Yes, I have good connections" },
    { label: "Somewhat isolated", value: "Somewhat isolated" },
    { label: "Mostly alone", value: "Mostly alone" },
  ];

  const AlcoholOptions = [
    { label: "I don’t drink", value: "I don’t drink" },
    { label: "Occasionally (e.g. social settings)", value: "Occasionally (e.g. social settings)" },
    { label: "Regularly (e.g. weekly)", value: "Regularly (e.g. weekly)" },
    { label: "Avoiding alcohol right now", value: "Avoiding alcohol right now" },
    { label: "Prefer not to say", value: "Prefer not to say" }
  ];


  const activityLevelOptions = [
    { label: "Mostly inactive (e.g. no intentional exercise)", value: "Mostly inactive (e.g. no intentional exercise)" },
    { label: "Lightly active (e.g. walking, basic tasks)", value: "Lightly active (e.g. walking, basic tasks)" },
    { label: "Moderately active (e.g. 2–3 workouts/week)", value: "Moderately active (e.g. 2–3 workouts/week)" },
    { label: "Very active (e.g. gym, sports, or yoga)", value: "Very active (e.g. gym, sports, or yoga)" },
    { label: "Prefer not to say", value: "Prefer not to say" }
  ];


  // Repeat similarly for Religion, Scriptures, etc.

  // Form validation schema
  const validationSchema = Yup.object().shape({
    gender: Yup.string().required("Gender is required."),
    // rank: Yup.string().required("Rank is required."),

    experience: Yup.string().required("Experience is required."),
    relationshipStatus: Yup.string().required(
      "Relationship Status is required."
    ),
    nationality: Yup.string().required("Nationality Status is required."),
    ethnicity: Yup.string().required("Ethnicity is required."),
    religion: Yup.string().required("Religion is required."),

    // hobbies: Yup.string().required("Hobbies Status is required"),
    // favoriteActivity: Yup.string().required("Onboard interests is required"),
    hobbies: Yup.array()
      .of(Yup.string().required("Hobby is required."))
      .min(1, "At least one hobby is required.")
      .required("Hobbies are required."),
    favoriteActivity: Yup.array()
      .of(Yup.string().required("Onboard interests is required."))
      .min(1, "At least one Onboard interests is required.")
      .required("Favorite Activities are required."),
    moodAndStressLevel: Yup.string().optional(),
    healthCondition: Yup.string().optional(),
    smoker: Yup.string().optional(),
    alcohol: Yup.string().optional(),

    socialInteraction: Yup.string().optional(),
    termsAccepted: Yup.boolean().oneOf(
      [true],
      "You must accept the terms and conditions."
    ),
  });

  const validationSchemaForSoreStaff = Yup.object().shape({
    gender: Yup.string().required("Gender is required."),
    // rank: Yup.string().required("Rank is required."),

    experience: Yup.string().optional(),
    relationshipStatus: Yup.string().optional(),
    nationality: Yup.string().optional(),
    ethnicity: Yup.string().optional(),
    religion: Yup.string().optional(),
    moodAndStressLevel: Yup.string().optional(),
    healthCondition: Yup.string().optional(),
    smoker: Yup.string().optional(),
    alcohol: Yup.string().optional(),

    socialInteraction: Yup.string().optional(),
    termsAccepted: Yup.boolean().oneOf(
      [true],
      "You must accept the terms and conditions."
    ),
  });

  const isStepValid = (errors, values, currentStepFields) => {
    return currentStepFields.every((field) => {
      if (
        userDetails?.department === "Shore_Staff" &&
        (field === "experience" || field === "relationshipStatus" || field === "nationality" || field === "ethnicity" || field === "religion")
      ) {
        return true; // Skip validation for these fields
      }
      return !errors[field] && values[field]?.trim() !== "";
    });
  };

  const nextStep = async (validateForm, values, currentStepFields) => {
    const errors = await validateForm();
    const valid = isStepValid(errors, values, currentStepFields);

    if (valid) {
      setStep((prevStep) => prevStep + 1); // Proceed only if no errors
    } else {
      console.log("Validation Errors:", errors);
    }
  };

  const retryOfflineRequests = async () => {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;

    if (isConnected) {
      const offlineQueueSnapshot = await firestore()
        .collection("offlineQueue")
        .get({ source: "cache" }); // Fetch only from cache

      if (offlineQueueSnapshot.empty) {
        return;
      }

      const offlineQueue = [];
      offlineQueueSnapshot.forEach((doc) => {
        offlineQueue.push({ id: doc.id, ...doc.data() });
      });
    }
  };

  // Set up NetInfo listener
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        retryOfflineRequests();
      }
    });

    return () => {
      unsubscribe(); // Clean up listener on unmount
    };
  }, []);

  const handleBackButtonPress = () => {
    if (step > 1) {
      setStep((prevStep) => prevStep - 1);
    } else {
      navigation.goBack();
    }
  }
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.uploadPhoto}>
      <View style={{ position: "absolute", top: "50%", right: 0, left: 0 }}>
        <Spinner visible={isLoading} size="large" color="#000" />
      </View>
      <ProfilDetailsHeader navigateProfile={navigateProfile} handleBackButtonPress={handleBackButtonPress} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={styles.bottomCard}>
        {/* <LottieView
          source={require("../../assets/Background.json")}
          autoPlay
          loop
          style={styles.lottieBackground}
        /> */}
        <CustomLottie />
      </View>
      <View style={styles.whiteOverlay} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.uploadTitle}>Update your Profile Details</Text>
          <Text style={styles.description}>
            Keep your profile details up to date to ensure accurate and
            personalized information. Updating your details helps others know
            more about you and enhances your overall experience.
          </Text>

          {/* Formik form */}
          <Formik
            initialValues={{
              gender: "",
              // rank: "",
              experience: "",
              relationshipStatus: "",
              nationality: "",
              ethnicity: "",
              religion: "",
              scriptures: "",
              hobbies: [],
              favoriteActivity: [],
              healthCondition: "",
              activeStatus: "",
              smoker: "",
              sociallyConnectedStatus: "",
              alcohol: "",
              // moodAndStressLevel: "",
              // socialInteraction: "",
            }}
            validationSchema={userDetails?.department === "Shore_Staff" ? validationSchemaForSoreStaff : validationSchema}
            // onSubmit={(values) => {
            //   console.log("Form Submitted:", values);
            //   // navigation.navigate("Mbti");
            // }}
            onSubmit={async (values) => {
              try {
                setIsLoading(true);

                // Check internet connectivity
                const netInfo = await NetInfo.fetch();
                const isConnected = netInfo.isConnected;

                // Retrieve token and user data from AsyncStorage
                const token = await AsyncStorage.getItem("authToken");
                const UserData = await AsyncStorage.getItem("userDetails");
                const _userdata = JSON.parse(UserData);

                let profileImageUrl = _userdata?.profileUrl || ""; // Default to stored profile URL

                // Prepare body for profile update
                const body = {
                  userId: _userdata.id,
                  fullName: _userdata.fullName,
                  countryCode: _userdata.countryCode,
                  mobileNumber: _userdata.mobileNumber,
                  email: _userdata.email,
                  profileUrl: myProfile[0],
                  gender: values.gender,
                  // rank: values.rank,
                  experience: values.experience,
                  relationshipStatus: values.relationshipStatus,
                  nationality: values.nationality,
                  ethnicity: values.ethnicity,
                  religion: values.religion,
                  hobbies: values.hobbies,
                  favoriteActivity: values.favoriteActivity,
                  smoker: values.smoker,
                  healthCondition: values.healthCondition,
                  alcohol: values.alcohol,
                  // socialInteraction: values.socialInteraction,
                  isProfileCompleted: true,
                };
                Object.keys(body).forEach((key) => {
                  const value = body[key];
                  if (!value || (Array.isArray(value) && value.length === 0)) {
                    delete body[key];
                  }
                });


                if (isConnected) {
                  // If online, upload image and update profile
                  if (myProfile?.length > 0) {
                    const data = new FormData();
                    const userDetailsString = await AsyncStorage.getItem(
                      "userDetails"
                    );
                    const userDetails = JSON.parse(userDetailsString);
                    data.append("file", {
                      uri: myProfile[0],
                      name: "image.jpg",
                      type: "image/jpeg",
                    });

                    const requestOptions = {
                      method: "POST",
                      headers: {
                        authToken: userDetails.authToken, // Adjust based on your API requirements
                      },
                      body: data,
                      redirect: "follow",
                    };

                    const uploadResponse = await fetch(
                      apiServerUrl + "/user/uploadFile",
                      requestOptions
                    );
                    const uploadResult = await uploadResponse.json();
                    if (uploadResult?.result) {
                      profileImageUrl = uploadResult.result;
                      body.profileUrl = profileImageUrl;
                    }
                  }
                  const result = await apiCallWithToken(
                    apiServerUrl + "/user/updateProfile",
                    "PUT",
                    body,
                    token
                  );

                  if (result.responseCode === 200) {
                    Toast.show({
                      type: "success",
                      text1: "Success",
                      text2: result.responseMessage,
                      autoHide: true,
                      visibilityTime: 2000,
                      text1Style: {
                        fontFamily: "WhyteInkTrap-Bold",
                        fontSize: 16,
                        color: "#000",
                      },
                      text2Style: {
                        fontFamily: "WhyteInkTrap-Regular",
                        fontSize: 14,
                        color: "#000",
                      },
                    });

                    // Update isProfileCompleted in AsyncStorage
                    const userDetailsString = await AsyncStorage.getItem(
                      "userDetails"
                    );
                    if (userDetailsString) {
                      const userDetails = JSON.parse(userDetailsString);
                      userDetails.isProfileCompleted = true;
                      await AsyncStorage.setItem(
                        "userDetails",
                        JSON.stringify(userDetails)
                      );
                    }
                    navigation.replace("Mbti");
                  } else {
                    Toast.show("Profile update failed");
                  }
                } else {
                  navigation.replace("Mbti");
                  setIsLoading(false);

                  Toast.show({
                    type: "info",
                    text1: "Info",
                    text2:
                      "You are offline. Profile will be updated when online.",
                    autoHide: true,
                    visibilityTime: 2000,
                    text1Style: {
                      fontFamily: "WhyteInkTrap-Bold",
                      fontSize: 16,
                      color: "#000",
                    },
                    text2Style: {
                      fontFamily: "WhyteInkTrap-Regular",
                      fontSize: 14,
                      color: "#000",
                    },
                  });
                  const userDetailsString = await AsyncStorage.getItem(
                    "userDetails"
                  );
                  if (userDetailsString) {
                    const userDetails = JSON.parse(userDetailsString);
                    userDetails.isProfileCompleted = true;
                    await AsyncStorage.setItem(
                      "userDetails",
                      JSON.stringify(userDetails)
                    );
                  }
                  const firestoreData = {
                    type: "profileUpdate",
                    body,
                    userId: _userdata.id,
                    profileUrl: myProfile[0], // Save local file URI for offline upload
                    timestamp: new Date().toISOString(),
                  };

                  // Save data to Firestore and ensure it's awaited
                  await firestore()
                    .collection("offlineQueue")
                    .doc(_userdata.id)
                    .set(firestoreData);

                  if (firestoreData.profileUrl?.length > 0) {
                    const data = new FormData();
                    const userDetailsString = await AsyncStorage.getItem(
                      "userDetails"
                    );
                    const userDetails = JSON.parse(userDetailsString);
                    data.append("file", {
                      uri: firestoreData.profileUrl,
                      name: "image.jpg",
                      type: "image/jpeg",
                    });

                    const requestOptions = {
                      method: "POST",
                      headers: {
                        authToken: userDetails.authToken, // Adjust based on your API requirements
                      },
                      body: data,
                      redirect: "follow",
                    };

                    const uploadResponse = await fetch(
                      apiServerUrl + "/user/uploadFile",
                      requestOptions
                    );
                    const uploadResult = await uploadResponse.json();
                    firestoreData.body.profileUrl = uploadResult.result;
                  }

                  const result = await apiCallWithToken(
                    apiServerUrl + "/user/updateProfile",
                    "PUT",
                    firestoreData.body,
                    token
                  );
                }
              } catch (error) {
                setIsLoading(false);
                console.error(
                  "Error uploading image or updating profile:",
                  error
                );
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: error.message || "An unexpected error occurred.",
                  autoHide: true,
                  visibilityTime: 2000,
                  text1Style: {
                    fontFamily: "WhyteInkTrap-Bold",
                    fontSize: 16,
                    color: "#000",
                  },
                  text2Style: {
                    fontFamily: "WhyteInkTrap-Regular",
                    fontSize: 14,
                    color: "#000",
                  },
                });
              } finally {
                setIsLoading(false);
              }
            }}
            enableReinitialize={true}
          >
            {({
              handleSubmit,
              handleChange,
              setFieldValue,
              values,
              errors,
              touched,
              validateForm,
            }) => (
              <View style={{ marginTop: "7%", flex: 1 }}>
                {console.log("errors", errors)}
                {step === 1 && (
                  <>
                    <DropdownFieldIOS
                      placeholder="Select Gender"
                      options={genderOptions}
                      selectedValue={values.gender}
                      onValueChange={(itemValue) => setFieldValue("gender", itemValue)}
                      error={touched.gender && errors.gender}
                      isFocus={isGenderOpen}
                      setIsFocus={setIsGenderOpen}
                    />

                    <DropdownFieldIOS
                      placeholder={`Select Year Of Experience${userDetails?.department === "Shore_Staff" ? " (Optional)" : ""
                        }`}
                      options={experienceOptions}
                      selectedValue={values.experience}
                      onValueChange={(itemValue) => setFieldValue("experience", itemValue)}
                      error={touched.experience && errors.experience}
                      isFocus={isExperienceOpen}
                      setIsFocus={setIsExperienceOpen}
                    />

                    <DropdownFieldIOS
                      placeholder={`Select Relationship Status${userDetails?.department === "Shore_Staff" ? " (Optional)" : ""
                        }`}
                      options={relationshipOptions}
                      selectedValue={values.relationshipStatus}
                      onValueChange={(itemValue) =>
                        setFieldValue("relationshipStatus", itemValue)
                      }
                      error={touched.relationshipStatus && errors.relationshipStatus}
                      isFocus={isRelationshipOpen}
                      setIsFocus={setIsRelationshipOpen}
                    />


                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        !isStepValid(errors, values, [
                          "gender",
                          // "rank",
                          "experience",
                          "relationshipStatus",
                        ]) && { backgroundColor: "#ccc" },
                      ]}
                      disabled={
                        !isStepValid(errors, values, [
                          "gender",
                          // "rank",
                          "experience",
                          "relationshipStatus",
                        ])
                      }
                      onPress={() =>
                        nextStep(validateForm, values, [
                          "gender",
                          // "rank",
                          "experience",
                          "relationshipStatus",
                        ])
                      }
                    >
                      <Text style={styles.submitButtonText}>Next</Text>
                    </TouchableOpacity>
                  </>
                )}

                {step === 2 && (
                  <>
                    {/* <View style={styles.container}>
                    <Dropdown
                      searchPlaceholder="Nationality"
                      // label="Nationality"
                      // options={nationList}
                      style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                      placeholder={!isFocus ? 'Select item' : '...'}
                      data={nationList}
                      value={values.nationality}
                      selectedValue={values.nationality}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      maxHeight={300}
                      onChange={item => {
                        setFieldValue("nationality", itemValue)
                        setIsFocus(false);
                      }}
                      // onValueChange={(itemValue) =>
                      //   setFieldValue("nationality", itemValue)
                      // }
                      // error={touched.nationality && errors.nationality}
                    />
                    </View> */}

                    <Dropdown
                      style={[styles.dropdown, { borderColor: "#c4c2c2", borderWidth: 1 }]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={nationList}
                      labelField="label"
                      valueField="value"
                      placeholder={`Select Nationality${userDetails?.department === "Shore_Staff" ? " (Optional)" : ""
                        }`}
                      value={values.nationality}
                      search
                      searchPlaceholder="Search..."
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={(item) => {
                        setIsFocus(false);
                        setFieldValue("nationality", item.value);
                      }}
                      renderRightIcon={() => (
                        <Image
                          style={[styles.icon, { height: 18, width: 18, marginRight: 10 }]}
                          source={
                            isFocus
                              ? ImagesAssets.arrow_up_icon
                              : ImagesAssets.arrow_icon
                          }
                        />
                      )}
                      renderSelectedItem={(item, unSelect) => (
                        <View>
                          <View
                            style={styles.selectedStyle}
                            onTouchEnd={() => unSelect && unSelect(item)}
                          >
                            <Text style={styles.textSelectedStyle}>{item.label}</Text>
                            <Image
                              style={[styles.icon, { height: 18, width: 18, marginLeft: 5 }]}
                              source={ImagesAssets.closeIcons}
                            />
                          </View>
                        </View>
                      )}
                      renderItem={(item) => (
                        <View
                          style={[
                            styles.itemContainer,
                            values.nationality === item.value && styles.selectedItemContainer,
                          ]}
                        >
                          <Text
                            style={[
                              styles.itemText,
                              values.nationality === item.value && styles.selectedItemText,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                      )}
                    />
                    <DropdownFieldIOS
                      placeholder={`Select Ethnicity${userDetails?.department === "Shore_Staff" ? " (Optional)" : ""
                        }`}
                      options={ethnicityOptions}
                      selectedValue={values.ethnicity}
                      onValueChange={(itemValue) =>
                        setFieldValue("ethnicity", itemValue)
                      }
                      error={touched.ethnicity && errors.ethnicity}
                      isFocus={ethnicityFocus}
                      setIsFocus={setEthnicityFocus}
                    />

                    <DropdownFieldIOS
                      placeholder={`Select Religion${userDetails?.department === "Shore_Staff" ? " (Optional)" : ""
                        }`}
                      options={religionOptions}
                      selectedValue={values.religion}
                      onValueChange={(itemValue) =>
                        setFieldValue("religion", itemValue)
                      }
                      error={touched.religion && errors.religion}
                      isFocus={religionFocus}
                      setIsFocus={setReligionFocus}
                    />

                    {userDetails?.department === "Shore_Staff" ? <>
                      <View
                        style={{
                          width: "100%",
                          marginTop: 10,
                          marginBottom: 30,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                          }}
                        >
                          <Checkbox.Android
                            status={checked ? "checked" : "unchecked"}
                            onPress={() => setChecked(!checked)}
                            color="#000000"
                            uncheckedColor="#000000"
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 12,
                                color: "#000000",
                                fontFamily: "Poppins-Regular",
                                lineHeight: 18,
                              }}
                            >
                              I agree to SeaBuddy collecting and using my well-being data to personalize support. I
                              understand this data will remain confidential and will not be shared with my employer.
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        disabled={!checked}
                        style={[
                          styles.submitButton,
                          !checked && styles.disabledButton, // Apply disabled styles if not checked
                        ]}
                        onPress={handleSubmit}
                      >
                        <Text
                          style={[
                            styles.submitButtonText,
                            !checked && styles.disabledButtonText, // Apply disabled text styles if not checked
                          ]}
                        >
                          Register
                        </Text>
                      </TouchableOpacity>
                    </>
                      :
                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          !isStepValid(errors, values, [
                            "nationality",
                            "ethnicity",
                            "religion",
                          ]) && { backgroundColor: "#ccc" },
                        ]}
                        disabled={
                          !isStepValid(errors, values, [
                            "nationality",
                            "ethnicity",
                            "religion",
                          ])
                        }
                        onPress={() =>
                          nextStep(validateForm, values, [
                            "nationality",
                            "ethnicity",
                            "religion",
                          ])
                        }
                      >
                        <Text style={styles.submitButtonText}>Next</Text>
                      </TouchableOpacity>}
                  </>
                )}

                {step === 3 && (
                  <>
                    <DropdownFieldIOS
                      placeholder=" Any Ongoing Health Concerns"
                      options={healthConditionOptions}
                      selectedValue={values.healthCondition}
                      onValueChange={(itemValue) =>
                        setFieldValue("healthCondition", itemValue)
                      }
                      error={touched.healthCondition && errors.healthCondition}
                      isFocus={healthConcernsFocus}
                      setIsFocus={setHealthConcernsFocus}
                    />
                    <DropdownFieldIOS
                      placeholder="How often do you smoke"
                      options={SmokerOprions}
                      selectedValue={values.smoker}
                      onValueChange={(itemValue) =>
                        setFieldValue("smoker", itemValue)
                      }
                      error={touched.smoker && errors.smoker}
                      isFocus={smokeFocus}
                      setIsFocus={setSmokeFocus}

                    />
                    <DropdownFieldIOS
                      placeholder="How often do you drink alcohol"
                      options={AlcoholOptions}
                      selectedValue={values.alcohol}
                      onValueChange={(itemValue) =>
                        setFieldValue("alcohol", itemValue)
                      }
                      error={touched.alcohol && errors.alcohol}
                      isFocus={alcoholFocus}
                      setIsFocus={setAlcoholFocus}
                    />

                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        !isStepValid(errors, values, [
                          "healthCondition",
                          "smoker",
                          "alcohol",
                        ]) && { backgroundColor: "#ccc" },
                      ]}
                      disabled={
                        !isStepValid(errors, values, [
                          "healthCondition",
                          "smoker",
                          "alcohol",
                        ])
                      }
                      onPress={() =>
                        nextStep(validateForm, values, [
                          "healthCondition",
                          "smoker",
                          "alcohol",
                        ])
                      }
                    >
                      <Text style={styles.submitButtonText}>Next</Text>
                    </TouchableOpacity>
                  </>
                )}

                {step === 4 && (
                  <>
                    <DropdownFieldIOS
                      placeholder=" How active are you in a typical week"
                      options={howactiveYouAreOptions}
                      selectedValue={values.activeStatus}
                      onValueChange={(itemValue) =>
                        setFieldValue("activeStatus", itemValue)
                      }
                      error={touched.activeStatus && errors.activeStatus}
                      isFocus={activeStatus}
                      setIsFocus={setActiveStatus}
                    />
                    <DropdownFieldIOS
                      placeholder=" Do you feel socially connected on board?"
                      options={sociallyConnectedOptions}
                      selectedValue={values.sociallyConnectedStatus}
                      onValueChange={(itemValue) =>
                        setFieldValue("sociallyConnectedStatus", itemValue)
                      }
                      error={touched.sociallyConnectedStatus && errors.sociallyConnectedStatus}
                      isFocus={sociallyConnectedStatus}
                      setIsFocus={setsociallyConnectedStatus}

                    />
                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        !isStepValid(errors, values, [
                          "activeStatus",
                          "sociallyConnectedStatus",
                        ]) && { backgroundColor: "#ccc" },
                      ]}
                      disabled={
                        !isStepValid(errors, values, [
                          "activeStatus",
                          "sociallyConnectedStatus",
                        ])
                      }
                      onPress={() =>
                        nextStep(validateForm, values, [
                          "activeStatus",
                          "sociallyConnectedStatus",
                        ])
                      }
                    >
                      <Text style={styles.submitButtonText}>Next</Text>
                    </TouchableOpacity>
                  </>
                )}

                {step === 5 && (
                  <>

                    <MultiSelect
                      style={styles.dropdown}
                      placeholderStyle={[
                        styles.placeholderStyle,
                        { color: selected.length > 0 ? '#000' : '#949494' }
                      ]}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={hobbiesOptions}
                      labelField="label"
                      valueField="value"
                      placeholder={
                        selected.length > 0
                          ? selected
                            .map((val) => {
                              const found = hobbiesOptions.find((opt) => opt.value === val);
                              return found ? found.label : '';
                            })
                            .join(', ')
                          : "Pick your hobbies (Multi-Select)"
                      }



                      value={selected}
                      onChange={(items) => {
                        if (items.length <= 3) {
                          setSelected(items);
                          setFieldValue("hobbies", items);
                        } else {
                        }
                      }}

                      // Right icon (arrow or tick based on selection)
                      renderRightIcon={() => (
                        <Image
                          style={[styles.icon, { height: 18, width: 18, marginRight: 10 }]}
                          source={
                            selected.length > 0
                              ? ImagesAssets.tick_icon      // ✅ tick if selection exists
                              : ImagesAssets.arrow_icon     // ✅ default arrow
                          }
                        />
                      )}

                      renderSelectedItem={(item, unSelect) => (
                        <View>
                          <View
                            style={styles.selectedStyle}
                            onTouchEnd={() => unSelect && unSelect(item)}
                          >
                            <Text style={styles.textSelectedStyle}>{item.label}</Text>
                            <Image
                              style={[styles.icon, { height: 18, width: 18, marginLeft: 5 }]}
                              source={ImagesAssets.closeIcons}
                            />
                          </View>
                        </View>
                      )}

                      renderItem={(item) => (
                        <View
                          style={[
                            styles.itemContainer,
                            selected.includes(item.value) && styles.selectedItemContainer,
                          ]}
                        >
                          <Text
                            style={[
                              styles.itemText,
                              selected.includes(item.value) && styles.selectedItemText,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                      )}

                      onFocus={() => setOpen(true)}
                      onBlur={() => setOpen(false)}
                    />


                    {touched.hobbies && errors.hobbies && (
                      <Text
                        style={{
                          color: "red",
                          fontSize: 12,
                          marginBottom: 8,
                          marginLeft: 3,
                          marginTop: -5,
                        }}
                      >
                        {errors.hobbies}
                      </Text>
                    )}


                    <MultiSelect
                      style={styles.dropdown}
                      placeholderStyle={[
                        styles.placeholderStyle,
                        { color: selectedFavourite.length > 0 ? '#000' : '#949494' }
                      ]}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={favoriteActivityOptions}
                      labelField="label"
                      valueField="value"
                      placeholder={
                        selectedFavourite.length > 0
                          ? selectedFavourite
                            .map((val) => {
                              const found = favoriteActivityOptions.find((opt) => opt.value === val);
                              return found ? found.label : '';
                            })
                            .join(', ')
                          : "Favourite onboard activity (Multi-Select)"
                      }
                      value={selectedFavourite}
                      onChange={(items) => {
                        if (items.length <= 3) {
                          setSelectedFavourite(items);
                          setFieldValue("favoriteActivity", items);
                        } else {
                        }
                      }}
                      renderRightIcon={() => (
                        <Image
                          style={[styles.icon, { height: 18, width: 18, marginRight: 10 }]}
                          source={
                            selectedFavourite && selectedFavourite.length > 0
                              ? ImagesAssets.tick_icon   // ✅ Show tick icon
                              : ImagesAssets.arrow_icon  // ✅ Default dropdown arrow
                          }
                        />
                      )}
                      onFocus={() => setDropdownOpen(true)}
                      onBlur={() => setDropdownOpen(false)}
                      renderSelectedItem={(item, unSelect) => (
                        <View>
                          <View
                            style={styles.selectedStyle}
                            onTouchEnd={() => unSelect && unSelect(item)}
                          >
                            <Text style={styles.textSelectedStyle}>{item.label}</Text>
                            <Image
                              style={[styles.icon, { height: 18, width: 18, marginLeft: 5 }]}
                              source={ImagesAssets.closeIcons}
                            />
                          </View>
                        </View>
                      )}
                      renderItem={(item) => (
                        <View
                          style={[
                            styles.itemContainer,
                            selectedFavourite.includes(item.value) && styles.selectedItemContainer,
                          ]}
                        >
                          <Text
                            style={[
                              styles.itemText,
                              selectedFavourite.includes(item.value) && styles.selectedItemText,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                      )}
                    />





                    {touched.favoriteActivity && errors.favoriteActivity && (
                      <Text
                        style={{
                          color: "red",
                          fontSize: 12,
                          marginBottom: 8,
                          marginLeft: 3,
                          marginTop: -5,
                        }}
                      >
                        {errors.favoriteActivity}
                      </Text>
                    )}


                    {/* <DropdownFieldIOS
                      label="Current Mood & Stress Level"
                      options={moodAndStreotherssLevelOptions}
                      selectedValue={values.moodAndStressLevel}
                      onValueChange={(itemValue) =>
                        setFieldValue("moodAndStressLevel", itemValue)
                      }
                      // error={
                      //   touched.moodAndStressLevel && errors.moodAndStressLevel
                      // }
                    /> */}

                    {/* {touched.moodAndStressLevel &&
                      errors.moodAndStressLevel && (
                        <Text
                          style={{
                            color: "red",
                            fontSize: 12,
                            marginLeft: 3,
                            marginTop: -5,
                            marginBottom: 8,
                          }}
                        >
                          {errors.moodAndStressLevel}
                        </Text>
                      )} */}

                    {/* <DropdownFieldIOS
                      label="Social Interaction"
                      options={socialInteractionOptions}
                      selectedValue={values.socialInteraction}
                      onValueChange={(itemValue) =>
                        setFieldValue("socialInteraction", itemValue)
                      }
                      // error={
                      //   touched.socialInteraction && errors.socialInteraction
                      // }
                    /> */}
                    {/* {touched.socialInteraction && errors.socialInteraction && (
                      <Text
                        style={{
                          color: "red",
                          fontSize: 12,
                          marginLeft: 3,
                          marginTop: -5,
                          marginBottom: 8,
                        }}
                      >
                        {errors.socialInteraction}
                      </Text>
                    )} */}

                    <View
                      style={{
                        width: "100%",
                        marginTop: 10,
                        marginBottom: 30,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        <Checkbox.Android
                          status={checked ? "checked" : "unchecked"}
                          onPress={() => setChecked(!checked)}
                          color="#000000"
                          uncheckedColor="#000000"
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#000000",
                              fontFamily: "Poppins-Regular",
                              lineHeight: 18,
                            }}
                          >
                            I agree to SeaBuddy collecting and using my well-being data to personalize support. I
                            understand this data will remain confidential and will not be shared with my employer.
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      disabled={!checked}
                      style={[
                        styles.submitButton,
                        !checked && styles.disabledButton, // Apply disabled styles if not checked
                      ]}
                      onPress={handleSubmit}
                    >
                      <Text
                        style={[
                          styles.submitButtonText,
                          !checked && styles.disabledButtonText, // Apply disabled text styles if not checked
                        ]}
                      >
                        Register
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </Formik>
        </View>
        {/* Bottom Card with Lottie Animation */}
      </ScrollView>
      <Toast />
    </View>
  );
};

// Helper Component for Dropdowns
const DropdownField = ({
  label,
  options,
  selectedValue,
  onValueChange,
  error,
}) => (
  <View style={styles.dropdownContainer}>
    <View style={styles.dropdownRow}>
      <Image style={styles.icons} source={ImagesAssets.info_icon} />
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

const styles = StyleSheet.create({
  doneButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  doneButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  uploadPhoto: {
    flex: 1,
    backgroundColor: "#fff",
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    zIndex: 0,
    top: "20%",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#262626",
    textAlign: "left",
    marginBottom: 10,
    fontFamily: "WhyteInktrap-Bold",
    lineHeight: 25,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#636363",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
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
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownRowr: {
    flexDirection: "row",
    alignItems: "center",
  },
  icons: {
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
  selectedItemContainer: {
    backgroundColor: Colors.secondary, // Light blue background for selected item
  },
  itemText: {
    fontSize: 16,
    color: "#000", // Default text color
  },
  itemContainer: {
    padding: 10,
    backgroundColor: "white",
  },
  selectedItemText: {
    color: "#000", // Blue text for selected item
    fontWeight: "bold",
  },
  bottomCard: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: "center",
    position: "absolute",
    height: "50%",
    bottom: 0,
    overflow: "hidden",
  },
  lottieBackground: {
    position: "absolute",
    width: width,
    height: height * 0.5,
    bottom: 0,
  },
  submitButton: {
    width: "100%",

    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#02130b",
    alignItems: "center",
    position: "absolute",
    bottom: "6.5%",
    zIndex: 5,
  },
  disabledButton: {
    backgroundColor: "#d3d3d3", // Gray
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
  disabledButtonText: {
    color: "#0009", // Text color when disabled
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    zIndex: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  label: {
    marginLeft: 8,
    color: Colors.primary,
    fontFamily: "Poppins-Regular",
  },

  dropdown: {
    height: 55,
    marginBottom: 15,
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },

  selectedStyle1: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginRight: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#c1c1c1",
    borderRadius: 20,
    marginBottom: 8,
  },
  textSelectedStyle: {
    color: "#000",
    fontSize: 16,
  },
  closeIconOfMultiSelect: {
    position: "absolute",
    right: 0,
    bottom: 27,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#000",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    // marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#c1c1c1",
    borderRadius: 20,
    marginBottom: 5,
    backgroundColor: Colors.secondary

  },
  textSelectedStyle: {
    color: "#000",
    fontSize: 12,
  },
});

export default UpdateProfile;
