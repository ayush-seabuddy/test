import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  Alert,
  PermissionsAndroid,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
const { height, width } = Dimensions.get("screen");
import ImagePicker from "react-native-image-crop-picker";
import ToggleSwitch from "toggle-switch-react-native";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../Api";
import { Badge, Modal } from "react-native-paper";
import axios from "axios";
import moment from "moment";
import CustomDropdown from "../CommonApi";
import Loader from "../component/Loader";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import FastImage from "react-native-fast-image";
import BackIconHeader from "../component/headers/ProfileHeader/BackIconHeader";

const CreateGroupActivity = ({ navigation, route }) => {
  const [isOn, setIsOn] = useState(false);
  const isSwitch = () => setIsOn((prevState) => !prevState);
  const [isTwo, setIsTwo] = useState(false);
  const [caption, setCaption] = useState("");
  const [EventName, setEventName] = useState("");
  const [DetailEvent, setDetailEvent] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [privacyError, setPrivacyError] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [isPhotoLoading, setPhotoLoading] = useState(false);
  const [input, setInput] = useState("");
  const [tags, setTags] = useState([]);
  const [CrewList, setCrewList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isCustomImage, setIsCustomImage] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customCategoryImage, setCustomCategoryImage] = useState("");
  const [isImagePickerFromCategory, setIsImagePickerFromCategory] = useState(false);
  const [Data, setData] = useState(null);
  const [eventId, seteventId] = useState(null);
  const [ActivityCategory, setActivityCategory] = useState([]);
  const [SelectedCategory, setSelectedCategory] = useState("");
  const [previousCategory, setPreviousCategory] = useState("");
  const [validationError, setValidationError] = useState('');

  const isDisabled =
    !(DetailEvent || "").trim() ||
    uploadedImages.length === 0 ||
    !Data ||
    !(eventLocation || "").trim() ||
    !(privacy || "").trim() ||
    !(SelectedCategory ? SelectedCategory.toString() : "").trim();

  const handleCategoryNameChange = (text) => {
    if (text.length > 20) {
      setValidationError("Maximum 20 characters allowed");
    } else {
      setValidationError("");
    }
    setCustomCategoryName(text);
  };

  const containerStyle = {
    height: "70%",
    backgroundColor: "white",
    padding: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  };

  const containerStylePhotoModal = {
    height: "100%",
    position: "absolute",
    bottom: 0,
    width: "100%",
  };

  const containerStyleCustomCategoryModal = {
    backgroundColor: "white",
    padding: 20,
    width: width * 0.9,
    alignSelf: "center",
    borderRadius: 20,
    maxHeight: height * 0.7,
  };

  const handleJoinedPoeple = () => {
    showModal();
  };

  const GetAllUser = async () => {
    try {
      let data = await AsyncStorage.getItem("userDetails");
      data = JSON.parse(data);
      const queryParams = new URLSearchParams({
        shipId: data.shipId,
      }).toString();
      const response = await apiCallWithToken(
        `${apiServerUrl}/user/listAllUsers?${queryParams}`,
        "GET",
        null,
        data.authToken
      );
      const crewList = response.result.usersList.filter((user) => user.id !== data.id);
      setCrewList(crewList);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch users. Please try again.",
      });
    }
  };

  const GetCategoryData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("userDetails");
      const data = JSON.parse(storedData);

      const response = await apiCallWithToken(
        `${apiServerUrl}/activity/getAllGroupActivityCategories?limit=100`,
        "GET",
        null,
        data.authToken
      );

      const formattedData = [
        { label: "Select a BuddyUp", value: "", image: null },
        ...response.result.groupActivityCategoriesList.map((item) => ({
          label: item.categoryName,
          image: item.categoryImage,
          value: item.id,
        })),
        { label: "Create Your Own", value: "create-your-own", image: null },
      ];

      setActivityCategory(formattedData);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch categories. Please try again.",
      });
    }
  };

  useEffect(() => {
    GetAllUser();
    GetCategoryData();
  }, []);

  const extractDateTime = (dateTimeString) => {
    const momentObj = moment(dateTimeString);
    const date = momentObj.format("DD/MM/YYYY");
    const time = momentObj.format("hh:mm:ss A");
    return { date, time };
  };

  let startDateTimeObj;
  let endDateTimeObj;
  if (Data) {
    startDateTimeObj = extractDateTime(Data.startDateTime);
    endDateTimeObj = extractDateTime(Data.endDateTime);
  }

  const handleAddTag = () => {
    const trimmedInput = input.trim();
    if (trimmedInput !== "") {
      setTags((prevTags) => [...prevTags, trimmedInput]);
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    const key = e.nativeEvent.key;
    if (key === "Enter" || key === "Return" || key === "Done" || key === "OK") {
      handleAddTag();
    }
  };

  const handleRemoveTag = (index) => {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs access to your camera to take photos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const openImagePicker = async (type, isForCategory = false) => {
    let hasPermission = true;
    if (type === "camera") {
      hasPermission = await requestCameraPermission();
    }
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera permission is required.");
      return;
    }

    setIsImagePickerFromCategory(isForCategory);

    const options = {
      cropping: true,
      freeStyleCropEnabled: true,
      cropperCircleOverlay: false,
      compressImageQuality: 0.7,
      mediaType: "photo",
      includeBase64: false,
      maxFiles: 1,
      forceJpg: false,
      width: 1000,
      height: 1000
    };

    const callback = async (response) => {
      if (response.didCancel) {
        if (isForCategory) {
          setShowCustomCategoryModal(true);
        }
        return;
      }
      if (response.errorCode || response.error) {
        Alert.alert("Error", response.errorMessage || `${type} error.`);
        if (isForCategory) {
          setShowCustomCategoryModal(true);
        }
        return;
      }

      const uri = response.path || response.sourceURL;
      console.log(uri, response, "rsesdfs");

      if (!uri) {
        if (isForCategory) {
          setShowCustomCategoryModal(true);
        }
        return;
      }

      const image = {
        uri: uri,
        name: response.path?.split("/").pop() || "image.jpg",
        type: response.mime || "image/jpeg",
      };

      console.log(image, "image");

      if (isForCategory) {
        await uploadImageToApi(image, true);
        setShowCustomCategoryModal(true);
      } else {
        setSelectedPhotos([uri]);
        setIsCustomImage(true);
        await uploadImageToApi(image);
      }
    };

    try {
      if (type === "camera") {
        const response = await ImagePicker.openCamera(options);
        await callback(response);
      } else {
        const response = await ImagePicker.openPicker(options);
        await callback(response);
      }
    } catch (error) {
      if (isForCategory) {
        setShowCustomCategoryModal(true);
      }
    }
  };

  const uploadImageToApi = async (image, isForCategory = false) => {
    if (!image || !image.uri) {
      return;
    }

    const data = new FormData();
    const userDetailsString = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(userDetailsString);

    data.append("file", {
      uri: image.uri,
      name: image.name || "image.jpg",
      type: image.type || "image/jpeg",
    });

    try {
      setPhotoLoading(true);
      const res = await axios({
        method: "POST",
        url: `${apiServerUrl}/user/uploadFile`,
        data: data,
        headers: {
          authToken: userDetails.authToken,
          "Content-Type": "multipart/form-data",
        },
      });




      const result = res.data;
      if (result && result.result) {
        if (isForCategory) {
          setCustomCategoryImage(result.result);
        } else {
          setUploadedImages([result.result]);
          setSelectedPhotos([result.result]);
          setIsCustomImage(true);
        }
      } else {
        Alert.alert("Error", "Failed to upload image.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image to server.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const createCustomCategory = async () => {
    if (!customCategoryName.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a category name",
      });
      return;
    }

    if (!customCategoryImage) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please upload a category image",
      });
      return;
    }

    try {
      setisLoading(true);

      const storedData = await AsyncStorage.getItem("userDetails");
      const data = JSON.parse(storedData);

      const body = JSON.stringify({
        categoryName: customCategoryName,
        categoryImage: customCategoryImage,
      });

      // Call API and catch HTTP errors
      const response = await apiCallWithToken(
        `${apiServerUrl}/activity/createGroupActivityCategories`,
        "POST",
        body,
        data.authToken
      );
      console.log("API Response:", JSON.stringify(response, null, 2));
      // Check for 200 success
      if (response.responseCode === 200) {
        const newCategory = {
          label: customCategoryName,
          value: response.result.id,
          image: customCategoryImage,
        };
        setActivityCategory((prev) => [...prev, newCategory]);
        setSelectedCategory(response.result.id);
        setEventName(customCategoryName);
        setCustomCategoryName("");
        setCustomCategoryImage("");
        setShowCustomCategoryModal(false);
        setIsCustomImage(false);
        setUploadedImages([newCategory.image]);
        setSelectedPhotos([newCategory.image]);

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Category created successfully",
        });

      } else if (response.responseCode === 409) {
        // Conflict: Category already exists
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.responseMessage || "Category already exists",
        });

      } else {
        // Other API errors
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.responseMessage || "Failed to create category",
        });
      }
    } catch (error) {
      // If apiCallWithToken throws an HTTP error, try to extract server message
      let message = "Something went wrong";

      if (error?.response) {
        try {
          const errorData = await error.response.json();
          message = errorData.responseMessage || message;
        } catch {
          message = error.message || message;
        }
      } else if (error?.message) {
        message = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
      });

    } finally {
      setisLoading(false);
    }
  };



  const UserListItem = ({ item, onSelect, isSelected }) => {
    return (
      <TouchableOpacity
        onPress={() => onSelect(item)}
        style={{
          flexDirection: "row",
          borderBottomWidth: 0.5,
          padding: 10,
          borderColor: "#E8E8E8",
          marginVertical: 10,
          backgroundColor: isSelected ? "#E0E0E0" : "white",
          borderRadius: 10,
        }}
      >
        <Image
          source={{
            uri:
              item.profileUrl ||
              "https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg",
          }}
          style={{ height: 50, width: 50, borderRadius: 15 }}
        />
        <View style={{ marginLeft: 15 }}>
          <Text
            style={{
              color: "#636363",
              fontFamily: "Poppins-SemiBold",
              fontSize: 18,
            }}
          >
            {item.fullName}
          </Text>
          <Text
            style={{
              color: "#636363",
              fontFamily: "Poppins-Regular",
              fontSize: 14,
            }}
          >
            {item.designation}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelectItem = (item) => {
    const index = selectedItems.findIndex(
      (selectedItem) => selectedItem.id === item.id
    );
    if (index === -1) {
      setSelectedItems([...selectedItems, item]);
    } else {
      const newSelectedItems = selectedItems.filter(
        (selectedItem) => selectedItem.id !== item.id
      );
      setSelectedItems(newSelectedItems);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedItems.some(
      (selectedItem) => selectedItem.id === item.id
    );
    return (
      <UserListItem
        item={item}
        onSelect={handleSelectItem}
        isSelected={isSelected}
      />
    );
  };

  useEffect(() => {
    const params = route.params || {};

    // Handle params from DefaultGroupActivity
    if (params.activity?.id) {
      setSelectedCategory(params.activity.id);
      if (!EventName && params.activity?.categoryName) {
        setEventName(params.activity.categoryName);
      }
    } else if (params.categoryId) {
      setSelectedCategory(params.categoryId);
      if (!EventName && params.categoryName) {
        setEventName(params.categoryName);
      }
    }

    if (params.eventId) {
      seteventId(params.eventId);
    }
    if (params.eventName) {
      setEventName(params.eventName);
    }
    if (params.description) {
      setDetailEvent(params.description);
    }
    if (params.location) {
      setEventLocation(params.location);
    }
    if (params.hashtags) {
      setTags(params.hashtags);
    }
    if (params.isPublic !== undefined) {
      setPrivacy(params.isPublic ? "Public (All Crew)" : "Invite Buddy");
    }
    if (params.startDateTime && params.endDateTime) {
      setData({
        startDateTime: params.startDateTime,
        endDateTime: params.endDateTime,
      });
    }
    if (params.data) {
      setData(params.data);
    }
    if (params.imageUrls && params.imageUrls.length > 0) {
      setUploadedImages(params.imageUrls);
      setSelectedPhotos(params.imageUrls);
      setIsCustomImage(true);
    }
    if (params.taggedUsers) {
      const taggedUsers = params.taggedUsers
        .map((userId) => CrewList.find((user) => user.id === userId))
        .filter((user) => user);
      setSelectedItems(taggedUsers);
    }

    // Set default "Gym" category only if no category is provided, SelectedCategory is empty, and ActivityCategory is populated
    if (SelectedCategory === "" && !params.activity?.id && !params.categoryId && ActivityCategory.length > 0) {
      const gymCategory = ActivityCategory.find(
        (category) => category.label === "Gym"
      );
      if (gymCategory && gymCategory.value && gymCategory.image) {
        setSelectedCategory(gymCategory.value);
        setEventName(gymCategory.label);
        setUploadedImages([gymCategory.image]);
        setSelectedPhotos([gymCategory.image]);
        setIsCustomImage(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Gym category not found. Please select a category.",
        });
      }
    }
  }, [route.params, ActivityCategory, CrewList]);

  useEffect(() => {
    if (SelectedCategory && ActivityCategory.length > 0) {
      const selectedCategoryData = ActivityCategory.find(
        (category) => category.value === SelectedCategory
      );
      if (selectedCategoryData && selectedCategoryData.image && !isCustomImage) {
        setUploadedImages([selectedCategoryData.image]);
        setSelectedPhotos([selectedCategoryData.image]);
        if (!EventName || EventName === "Movie Night") {
          setEventName(selectedCategoryData.label);
        }
      } else if (!selectedCategoryData?.image && !isCustomImage) {
        setUploadedImages([]);
        setSelectedPhotos([]);
      }
    }
  }, [SelectedCategory, ActivityCategory, isCustomImage]);

  const PostGroupActivity = async () => {
    try {
      const validationErrors = {
        DetailEvent: !(DetailEvent || "").trim() && "Please enter a description",
        uploadedImages: uploadedImages.length === 0 && "Please upload at least one image",
        Data: !Data && "Please provide event date and time",
        eventLocation: !(eventLocation || "").trim() && "Please enter an event location",
        privacy: !(privacy || "").trim() && "Please select a privacy option",
        SelectedCategory: !(SelectedCategory ? SelectedCategory.toString() : "").trim() && "Please select a category",
      };

      const errorMsg = Object.values(validationErrors).find((error) => error);
      if (errorMsg) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMsg,
          autoHide: true,
          visibilityTime: 4000,
          text2Style: {
            paddingTop: 10,
            fontSize: 14,
            color: "#000",
          },
        });
        return;
      }

      if (privacy === "Invite Buddy" && selectedItems.length === 0) {
        setPrivacyError("Please select at least one user to share with.");
        return;
      }

      setisLoading(true);

      const storedData = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(storedData);
      if (!userDetails || !userDetails.authToken) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "User authentication failed. Please log in again.",
        });
        setisLoading(false);
        return;
      }

      const groupActivity = {
        imageUrls: uploadedImages,
        eventName: EventName,
        description: DetailEvent,
        location: eventLocation,
        startDateTime: Data.startDateTime,
        endDateTime: Data.endDateTime,
        isPublic: privacy === "Public (All Crew)",
        hashtags: tags,
        categoryId: SelectedCategory,
        shipId: userDetails.shipId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      if (privacy === "Invite Buddy") {
        groupActivity.invitedPeoples = selectedItems.map((item) => item.id);
      }

      if (eventId) {
        groupActivity.eventId = eventId;
      }

      const body = JSON.stringify({ groupActivities: [groupActivity] });

      console.log("📤 Submitting group activity:", JSON.stringify(groupActivity, null, 2));
      console.log("📤 Timestamps:", { startDateTime: Data.startDateTime, endDateTime: Data.endDateTime });

      const response = await apiCallWithToken(
        `${apiServerUrl}/activity/addUpdateGroupActivity`,
        "POST",
        body,
        userDetails.authToken
      );

      console.log("📥 API Response:", JSON.stringify(response, null, 2));

      if (response.responseCode === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: eventId ? "Activity updated successfully!" : "Activity created successfully!",
        });
        navigation.replace("Home", { screen: "Huddle" });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.message || (eventId ? "Failed to update activity." : "Failed to create activity."),
        });
      }
    } catch (error) {
      console.error("❌ Error in PostGroupActivity:", error.message, error.stack);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || (eventId ? "Failed to update activity." : "Failed to create activity."),
      });
    } finally {
      setisLoading(false);
    }
  };

  const Locationdata = [
    { label: "Select Location", value: "" },
    { label: "Officer’s smoke room", value: "Officer’s smoke room" },
    { label: "Crew smoke room", value: "Crew smoke room" },
    { label: "Gymnasium", value: "Gymnasium" },
    { label: "Poop Deck", value: "Poop Deck" },
    { label: "Pool", value: "Pool" },
    { label: "Crew Messroom", value: "Crew Messroom" },
    { label: "Officer Messroom", value: "Officer Messroom" },
    { label: "Activity Deck", value: "Activity Deck" },
  ];

  const Privacydata = [
    { label: "Select Event Type", value: "" },
    { label: "Public (All Crew)", value: "Public (All Crew)" },
    { label: "Invite Buddy", value: "Invite Buddy" },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <>
          <FocusAwareStatusBar
            barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
            backgroundColor={Colors.white}
            hidden={false}
          />
          <BackIconHeader
            navigation={navigation}
            title="Create your BuddyUp event"
          />
          <View style={styles.container}>
            {isLoading && <Loader isLoading={isLoading} />}
            {isPhotoLoading && <Loader isLoading={isPhotoLoading} />}
            <View>
                <FlatList
                  data={uploadedImages}
                  horizontal
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <>
                      <FastImage
                        source={{ uri: item }}
                        style={styles.selectedPhoto}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          right: 20,
                          bottom: 45,
                          borderWidth: 0.4,
                          borderColor: 'grey',
                          backgroundColor: "#fff",
                          padding: 5,
                          borderRadius: 5,
                        }}
                        onPress={() => {
                          setShowPickerModal(true);
                          setIsImagePickerFromCategory(false);
                        }}
                      >
                        <Image
                          source={ImagesAssets.editActivityIcon}
                          style={[styles.headerIcon]}
                        />
                      </TouchableOpacity>
                    </>
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.selectedPhotosContainer}
                />
             
            </View>
            <View style={{ backgroundColor: 'grey', height: 0.2, marginTop: 10 }}></View>
            <ScrollView
              contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.postOptions}>
                <Text style={{ fontFamily: "Poppins-Regular", fontSize: 12, marginHorizontal: 8 }}>
                  📅 Host an event → Earn <Text style={{ fontFamily: "Poppins-SemiBold" }}>25 miles</Text>
                </Text>
                <Text style={{ fontFamily: "Poppins-Regular", fontSize: 12, marginHorizontal: 8 }}>
                  Your participation unlocks badges, boosts visibility, and earns you recognition.
                </Text>
                <View style={styles.postOption}>
                  <View style={styles.TextInputText}>
                    <MaterialIcons name={"category"} size={25} color={"#B0DB02"} />
                    <CustomDropdown
                      data={ActivityCategory}
                      value={SelectedCategory}
                      onChange={(value) => {
                        setSelectedCategory(value);
                        if (value === "create-your-own") {
                          setPreviousCategory(SelectedCategory);
                          setShowCustomCategoryModal(true);
                        } else {
                          setIsCustomImage(false);
                          const selectedCategoryData = ActivityCategory.find(
                            (category) => category.value === value
                          );
                          if (selectedCategoryData) {
                            setEventName(selectedCategoryData.label);
                          }
                        }
                      }}
                      placeholder="Select a BuddyUp"
                    />
                  </View>
                </View>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                  <View style={styles.postOption}>
                    <View style={styles.TextInputText}>
                      <Image
                        source={require("../assets/images/NewPostImage/details.png")}
                        style={styles.headerIcon}
                      />
                      <TextInput
                        style={{
                          paddingLeft: 10,
                          fontFamily: "Poppins-Regular",
                          fontSize: 14,
                          color: "#000",
                          width: "90%",
                        }}
                        value={DetailEvent}
                        onChangeText={(value) => setDetailEvent(value)}
                        placeholder="Add Event Description"
                        placeholderTextColor="#c1c1c1"
                        maxLength={600}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <View style={styles.postOption}>
                  <View style={styles.TextInputText}>
                    <Image
                      source={require("../assets/images/eventLocation.png")}
                      style={styles.headerIcon}
                    />
                    <CustomDropdown
                      data={Locationdata}
                      value={eventLocation}
                      onChange={setEventLocation}
                      placeholder="Select location"
                    />
                  </View>
                </View>
                <View style={styles.postOptionDate}>
                  <TouchableOpacity
                    style={styles.Dateseletionbtn}
                    onPress={() => {
                      navigation.navigate("ActivityCalender", { Data });
                    }}
                  >
                    <View style={styles.postOptionLeft}>
                      <Image
                        source={require("../assets/images/NewPostImage/dateicon.png")}
                        style={styles.headerIcon}
                      />
                      <Text
                        style={{
                          paddingLeft: 10,
                          fontFamily: "Poppins-Regular",
                          fontSize: 14,
                          color: Data ? "#000" : "#c1c1c1",
                          marginTop: 3,
                        }}
                      >
                        {Data && startDateTimeObj && endDateTimeObj
                          ? `${startDateTimeObj.date} - ${endDateTimeObj.date}`
                          : Data && startDateTimeObj
                            ? startDateTimeObj.date
                            : "Date"}
                      </Text>
                    </View>
                    <Image
                      source={ImagesAssets.CircleRightArrow}
                      style={styles.headerIcon}
                    />
                  </TouchableOpacity>
                </View>
                {Data && startDateTimeObj && (
                  <View style={styles.postOption}>
                    <View style={styles.postOptionLeft}>
                      <Image
                        source={require("../assets/images/NewPostImage/clock.png")}
                        style={styles.headerIcon}
                      />
                      <Text
                        style={{
                          paddingLeft: 10,
                          fontFamily: "Poppins-Regular",
                          fontSize: 14,
                          color: Data ? "#000" : "#c1c1c1",
                        }}
                      >
                        {Data && startDateTimeObj && endDateTimeObj
                          ? `${startDateTimeObj.time} - ${endDateTimeObj.time}`
                          : Data && startDateTimeObj
                            ? startDateTimeObj.time
                            : "Time"}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.postOption}>
                  <View style={styles.TextInputText}>
                    <Image
                      source={ImagesAssets.AccountGreenIcon}
                      style={styles.headerIcon}
                    />
                    <CustomDropdown
                      data={Privacydata}
                      value={privacy}
                      onChange={(value) => {
                        setSelectedItems([]);
                        setPrivacy(value);
                        setPrivacyError("");
                      }}
                      placeholder="Select Event Type"
                    />
                  </View>
                </View>
                {privacy === "Invite Buddy" && (
                  <TouchableOpacity
                    onPress={handleJoinedPoeple}
                    style={styles.postOption}
                  >
                    <View style={styles.postOptionLeft}>
                      <Image
                        source={ImagesAssets.AccountGreenIcon}
                        style={styles.headerIcon}
                      />
                      <Text
                        style={{
                          paddingLeft: 10,
                          fontFamily: "Poppins-Regular",
                          fontSize: 14,
                          color: "#c1c1c1",
                        }}
                      >
                        Add Participants
                      </Text>
                    </View>
                    {selectedItems.slice(0, 3).map((item, index) => (
                      <Image
                        key={index}
                        source={{
                          uri:
                            item.profileUrl ||
                            "https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg",
                        }}
                        style={[
                          styles.avatar,
                          { marginLeft: index === 0 ? 0 : -30 },
                        ]}
                      />
                    ))}
                    {selectedItems.length > 3 && (
                      <View style={[styles.avatar, styles.moreCount]}>
                        <Text style={styles.countText}>
                          +{selectedItems.length - 3}
                        </Text>
                      </View>
                    )}
                    <Image
                      source={ImagesAssets.CircleRightArrow}
                      style={styles.headerIcon}
                    />
                  </TouchableOpacity>
                )}
                {privacyError !== "" && selectedItems.length === 0 && (
                  <Text style={{ color: "red" }}>{privacyError}</Text>
                )}
                <View style={styles.postOption}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image source={ImagesAssets.hastag} style={styles.headerIcon} />
                    <TextInput
                      style={styles.postOptionLeftAdd}
                      placeholder="Add hashtags"
                      placeholderTextColor="#c1c1c1"
                      value={input}
                      maxLength={20}
                      onChangeText={setInput}
                      onSubmitEditing={handleAddTag}
                      onKeyPress={handleKeyPress}
                    />
                  </View>
                </View>
                <View style={styles.hashtagContainer}>
                  {tags.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      onPress={() => handleRemoveTag(index)}
                    >
                      <View
                        style={{
                          backgroundColor: "#FBCF21",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          marginRight: 5,
                          marginBottom: 5,
                          borderRadius: 5,
                          gap: 10,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Text
                          style={{
                            color: "#06361F",
                            fontFamily: "Poppins-Regular",
                            textAlign: "center",
                            fontSize: 12,
                          }}
                        >
                          {tag}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                          }}
                        >
                          ✕
                        </Text>
                      </View>

                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  accessibilityLabel={eventId ? "Update Activity" : "Create Activity"}
                  style={[styles.shareButton, isDisabled && styles.disabledButton]}
                  onPress={PostGroupActivity}
                  disabled={isDisabled}
                >
                  <Text style={styles.shareButtonText}>{eventId ? "Update Activity" : "Create Activity"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            <Modal
              visible={visible}
              onDismiss={hideModal}
              contentContainerStyle={containerStyle}
            >
              <Badge
                style={{
                  backgroundColor: "#f8f8f8",
                  marginVertical: 10,
                  height: 30,
                  paddingHorizontal: 10,
                }}
                onPress={hideModal}
              >
                <Text
                  style={{
                    color: "#000",
                    fontFamily: "Poppins-SemiBold",
                    fontSize: 11,
                  }}
                >
                  Close
                </Text>
              </Badge>
              {CrewList.length === 0 && (
                <View style={styles.userModal}>
                  <Text style={{ fontSize: 17 }}>
                    No users have boarded your ship yet.
                  </Text>
                </View>
              )}
              <FlatList
                renderItem={renderItem}
                data={CrewList}
                showsVerticalScrollIndicator={false}
              />
            </Modal>
            <Modal
              animationType="slide"
              transparent={true}
              visible={showPickerModal}
              onRequestClose={() => {
                setShowPickerModal(false);
                if (isImagePickerFromCategory) {
                  setShowCustomCategoryModal(true);
                }
              }}
            >
              <TouchableWithoutFeedback
                onPress={() => {
                  setShowPickerModal(false);
                  if (isImagePickerFromCategory) {
                    setShowCustomCategoryModal(true);
                  }
                }}
              >
                <View style={styles.modalOverlayPhoto}>
                  <View style={styles.containerPhoto}>
                    <Text style={styles.titlePhoto}>Select Image</Text>
                    <TouchableOpacity
                      style={styles.buttonPhoto}
                      onPress={() => {
                        setShowCustomCategoryModal(false);
                        setShowPickerModal(false);
                        openImagePicker("camera", isImagePickerFromCategory);
                      }}
                    >
                      <Text style={styles.buttonTextPhoto}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.buttonPhoto}
                      onPress={() => {
                        setShowCustomCategoryModal(false);
                        setShowPickerModal(false);
                        openImagePicker("library", isImagePickerFromCategory);
                      }}
                    >
                      <Text style={styles.buttonTextPhoto}>Choose from Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowPickerModal(false);
                        if (isImagePickerFromCategory) {
                          setShowCustomCategoryModal(true);
                        }
                      }}
                    >
                      <Text style={styles.cancelTextPhoto}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
            <Modal
              animationType="fade"
              transparent={true}
              visible={showCustomCategoryModal}
              onRequestClose={() => setShowCustomCategoryModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={containerStyleCustomCategoryModal}>
                  <Text style={styles.titlePhoto}>Create New Category</Text>
                  <Text style={styles.subTitlePhoto}>Enter Category Name*</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Category Name"
                    placeholderTextColor="#c1c1c1"
                    value={customCategoryName}
                    onChangeText={handleCategoryNameChange}
                    maxLength={21}
                  />

                  {validationError ? (
                    <Text style={[styles.requiredText, { color: "red" }]}>
                      {validationError}
                    </Text>
                  ) : (
                    <Text style={styles.requiredText}></Text>
                  )}

                  <Text style={styles.subTitlePhoto}>Choose Category Image*</Text>
                  {customCategoryImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <FastImage
                        source={{ uri: customCategoryImage }}
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.changeImageButton}
                        onPress={() => {
                          setShowCustomCategoryModal(false);
                          setShowPickerModal(true);
                          setIsImagePickerFromCategory(true);
                        }}
                      >
                        <Text style={styles.buttonTextPhoto}>Change Image</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.buttonPhoto}
                      onPress={() => {
                        setShowCustomCategoryModal(false);
                        setShowPickerModal(true);
                        setIsImagePickerFromCategory(true);
                      }}
                    >
                      <Text style={styles.buttonTextPhoto}>Select Image</Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.buttonPhoto, styles.cancelButton]}
                      onPress={() => {
                        setCustomCategoryName("");
                        setCustomCategoryImage("");
                        setShowCustomCategoryModal(false);
                        setSelectedCategory(previousCategory);
                      }}
                    >
                      <Text style={styles.buttonTextPhoto}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.buttonPhoto, styles.createButton]}
                      onPress={createCustomCategory}
                    >
                      <Text style={[styles.buttonTextPhoto, { color: "#fff" }]}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            <Toast />
          </View>
        </>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlayPhoto: {
    marginHorizontal: 20,
    justifyContent: "flex-end",
  },
  containerPhoto: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    borderRadius: 20,
  },
  titlePhoto: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 20,
  },
  subTitlePhoto: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10,
    fontFamily: "Poppins-Regular",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  textInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#c1c1c1",
    borderRadius: 5,
    padding: 10,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#000",
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  changeImageButton: {
    backgroundColor: "transparent",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c1c1c1",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
  },
  createButton: {
    flex: 1,
    backgroundColor: "#000",
    marginLeft: 10,
  },
  buttonPhoto: {
    width: "100%",
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#67c36f",
  },
  buttonTextPhoto: {
    color: "#673c6f",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
  },
  cancelTextPhoto: {
    color: "#777",
    marginTop: 10,
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  imageOptions: {
    height: height * 0.27,
    width: width,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  userModal: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "80%",
  },
  optionButton: {
    width: width * 0.3,
    height: width * 0.3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 20,
    marginHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#f1f1f1",
  },
  moreCount: {
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    color: "white",
    fontWeight: "bold",
  },
  optionText: {
    marginTop: 5,
    color: "#c1c1c1",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    width: "100%",
    textAlign: "center",
  },
  postOptions: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: "column",
  },
  postOption: {
    flexDirection: "row",
    paddingHorizontal: 10,
    width: "100%",
    borderColor: 'grey',
    borderWidth: 0.3,
    height: height * 0.055,
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    backgroundColor: "#FFFFFFB2",
    borderRadius: 5,
  },
  postOptionDate: {
    flexDirection: "column",
    paddingHorizontal: 10,
    width: "100%",
    borderColor: 'grey',
    borderWidth: 0.3,
    marginVertical: 5,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
    backgroundColor: "#FFFFFFB2",
    borderRadius: 5,
  },
  Dateseletionbtn: {
    flexDirection: "row",
    width: "100%",
    height: height * 0.05,
    justifyContent: "space-between",
    alignItems: "center",
  },
  postOptiontag: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    width: "100%",
    borderColor: 'grey',
    borderWidth: 0.3,
    alignItems: "center",
    marginVertical: 5,
    marginBottom: 10,

    backgroundColor: "#FFFFFFB2",
    borderRadius: 5,
  },
  postOptionLeft: {
    flexDirection: "row",
  },
  postOptionLeftAdd: {
    flexDirection: "row",
    width: "80%",
    fontSize: 14,
    paddingLeft: 8,
    fontFamily: 'Poppins-Regular',
    color: "#000",
  },
  TextInputText: {
    flexDirection: "row",
    alignItems: "center",
  },
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  shareButton: {
    backgroundColor: "#000000",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#c1c1c1",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold'
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  selectedPhotosContainer: {
    flexDirection: "row",
    zIndex: -999,
  },
  selectedPhoto: {
    width: width,
    height: height * 0.30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,

  },
});

export default CreateGroupActivity;