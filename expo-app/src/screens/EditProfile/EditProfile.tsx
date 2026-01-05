import { updateprofile, viewProfile } from '@/src/apis/apiService';
import GlobalHeader from '@/src/components/GlobalHeader';
import CustomDateTimePicker from '@/src/components/Modals/CustomDateTimePicker';
import { RootState } from '@/src/redux/store';
import { updateUserField } from '@/src/redux/userDetailsSlice';
import Colors from '@/src/utils/Colors';
import { height } from '@/src/utils/helperFunctions';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useFormik } from "formik";
import { t } from 'i18next';
import { Calendar, ChevronLeft, CircleX, Heart, Mail, User, VenusAndMars } from 'lucide-react-native';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { ScrollView } from 'react-native-gesture-handler';
import PhoneInput, { getCountryByPhoneNumber, ICountry } from "react-native-international-phone-number";
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from "yup";
import CustomDropdown from './CustomDropdown';


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
const validationSchemaForSoreStaff = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  dob: Yup.string().required("Date of birth is required"),
  maritalStatus: Yup.string().optional(),
  gender: Yup.string().required("Gender is required"),
  experience: Yup.string().optional(),
  ethnicity: Yup.string().optional(),
  religion: Yup.string().optional(),
  hobbies: Yup.array()
    .optional(),
  favoriteActivity: Yup.array()
    .optional(),
  about: Yup.string()
    .required("About is required")
    .min(20, "About should be at least 20 characters")
    .max(600, "About should not exceed 600 characters"),
});

const EditProfile = () => {

  const GENDER = [
    { label: t('genderOptions.male'), value: t('genderOptions.male') },
    { label: t('genderOptions.female'), value: t('genderOptions.female') },
    { label: t('genderOptions.other'), value: t('genderOptions.other') },
  ];

  const EXPERIENCE = [
    { label: t('experienceOptions.0_1'), value: t('experienceOptions.0_1') },
    { label: t('experienceOptions.2_5'), value: t('experienceOptions.2_5') },
    { label: t('experienceOptions.5_plus'), value: t('experienceOptions.5_plus') },
  ];

  const RELATIONSHIP = [
    { label: t('relationshipOptions.single'), value: t('relationshipOptions.single') },
    { label: t('relationshipOptions.married'), value: t('relationshipOptions.married') },
    { label: t('relationshipOptions.divorced'), value: t('relationshipOptions.divorced') },
    { label: t('relationshipOptions.widowed'), value: t('relationshipOptions.widowed') },
  ];

  const ETHNICITY = [
    { label: t('ethnicityOptions.asian'), value: t('ethnicityOptions.asian') },
    { label: t('ethnicityOptions.black'), value: t('ethnicityOptions.black') },
    { label: t('ethnicityOptions.white'), value: t('ethnicityOptions.white') },
    { label: t('ethnicityOptions.latino'), value: t('ethnicityOptions.latino') },
    { label: t('ethnicityOptions.mena'), value: t('ethnicityOptions.mena') },
    { label: t('ethnicityOptions.native'), value: t('ethnicityOptions.native') },
    { label: t('ethnicityOptions.pacific'), value: t('ethnicityOptions.pacific') },
    { label: t('ethnicityOptions.mixed'), value: t('ethnicityOptions.mixed') },
  ];

  const RELIGION = [
    { label: t('religionOptions.buddhism'), value: t('religionOptions.buddhism') },
    { label: t('religionOptions.christianity'), value: t('religionOptions.christianity') },
    { label: t('religionOptions.hinduism'), value: t('religionOptions.hinduism') },
    { label: t('religionOptions.islam'), value: t('religionOptions.islam') },
    { label: t('religionOptions.judaism'), value: t('religionOptions.judaism') },
    { label: t('religionOptions.sikhism'), value: t('religionOptions.sikhism') },
    { label: t('religionOptions.jainism'), value: t('religionOptions.jainism') },
    { label: t('religionOptions.zoroastrianism'), value: t('religionOptions.zoroastrianism') },
    { label: t('religionOptions.taoism'), value: t('religionOptions.taoism') },
    { label: t('religionOptions.shinto'), value: t('religionOptions.shinto') },
    { label: t('religionOptions.other'), value: t('religionOptions.other') },
    { label: t('religionOptions.none'), value: t('religionOptions.none') },
  ];

  const HEALTH_OPTIONS = [
    { label: t('healthOptions.none'), value: t('healthOptions.none') },
    { label: t('healthOptions.hypertension'), value: t('healthOptions.hypertension') },
    { label: t('healthOptions.diabetes'), value: t('healthOptions.diabetes') },
    { label: t('healthOptions.anxiety'), value: t('healthOptions.anxiety') },
    { label: t('healthOptions.depression'), value: t('healthOptions.depression') },
    { label: t('healthOptions.other'), value: t('healthOptions.other') },
    { label: t('healthOptions.prefer_no'), value: t('healthOptions.prefer_no') },
  ];

  const SMOKING_OPTIONS = [
    { label: t('smokingOptions.no'), value: t('smokingOptions.no') },
    { label: t('smokingOptions.occasional'), value: t('smokingOptions.occasional') },
    { label: t('smokingOptions.regular'), value: t('smokingOptions.regular') },
    { label: t('smokingOptions.quit'), value: t('smokingOptions.quit') },
    { label: t('smokingOptions.prefer_no'), value: t('smokingOptions.prefer_no') },
  ];

  const ALCOHOL_OPTIONS = [
    { label: t('alcoholOptions.no'), value: t('alcoholOptions.no') },
    { label: t('alcoholOptions.occasional'), value: t('alcoholOptions.occasional') },
    { label: t('alcoholOptions.regular'), value: t('alcoholOptions.regular') },
    { label: t('alcoholOptions.avoid'), value: t('alcoholOptions.avoid') },
    { label: t('alcoholOptions.prefer_no'), value: t('alcoholOptions.prefer_no') },
  ];

  // NEW: Activity Level Dropdown
  const ACTIVITY_OPTIONS = [
    { label: t('activityOptions.inactive'), value: t('activityOptions.inactive') },
    { label: t('activityOptions.light_active'), value: t('activityOptions.light_active') },
    { label: t('activityOptions.moderate_active'), value: t('activityOptions.moderate_active') },
    { label: t('activityOptions.very_active'), value: t('activityOptions.very_active') },
    { label: t('activityOptions.prefer_no'), value: t('activityOptions.prefer_no') },
  ];

  const SOCIAL_OPTIONS = [
    { label: t('socialOptions.connected'), value: t('socialOptions.connected') },
    { label: t('socialOptions.isolated'), value: t('socialOptions.isolated') },
    { label: t('socialOptions.alone'), value: t('socialOptions.alone') },
  ];

  const HOBBIES_OPTIONS = [

    { label: t('hobbiesOptions.art'), value: t('hobbiesOptions.art') },
    { label: t('hobbiesOptions.music'), value: t('hobbiesOptions.music') },
    { label: t('hobbiesOptions.photo'), value: t('hobbiesOptions.photo') },
    { label: t('hobbiesOptions.dance'), value: t('hobbiesOptions.dance') },
    { label: t('hobbiesOptions.yoga'), value: t('hobbiesOptions.yoga') },
    { label: t('hobbiesOptions.gym'), value: t('hobbiesOptions.gym') },
    { label: t('hobbiesOptions.gaming'), value: t('hobbiesOptions.gaming') },
    { label: t('hobbiesOptions.reading'), value: t('hobbiesOptions.reading') },
    { label: t('hobbiesOptions.movies'), value: t('hobbiesOptions.movies') },
    { label: t('hobbiesOptions.cooking'), value: t('hobbiesOptions.cooking') },
    { label: t('hobbiesOptions.sports'), value: t('hobbiesOptions.sports') },
    { label: t('hobbiesOptions.meditation'), value: t('hobbiesOptions.meditation') },
  ];

  const FAV_ACTIVITY_OPTIONS = [
    { label: t('fav_activityOptions.movie'), value: t('fav_activityOptions.movie') },
    { label: t('fav_activityOptions.gym'), value: t('fav_activityOptions.gym') },
    { label: t('fav_activityOptions.karaoke'), value: t('fav_activityOptions.karaoke') },
    { label: t('fav_activityOptions.games'), value: t('fav_activityOptions.games') },
    { label: t('fav_activityOptions.jam'), value: t('fav_activityOptions.jam') },
    { label: t('fav_activityOptions.meditation'), value: t('fav_activityOptions.meditation') },
    { label: t('fav_activityOptions.cook'), value: t('fav_activityOptions.cook') },
    { label: t('fav_activityOptions.sports'), value: t('fav_activityOptions.sports') },
    { label: t('fav_activityOptions.drinks'), value: t('fav_activityOptions.drinks') },
  ];
  const scrollViewRef = useRef(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [inputRefs, setInputRefs] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() - 18))
  );
  const handleDateConfirm = (event: any, date: any) => {
    setShowDatePicker(false);
    if (date) {
      const formattedDate = date.toLocaleDateString("en-GB");
      formik.setFieldValue("dob", formattedDate);
    }
  };
  const datePickerRef = useRef(null);
  const profile = useSelector((state: RootState) => state.userDetails)
  const dispatch = useDispatch()
  const countryData = getCountryByPhoneNumber(profile.mobileNumber);
  const localNumber = extractLocalPhoneNumber(
    profile.mobileNumber,
    countryData?.idd?.root

  );
  const [selectedHobbies, setSelectedHobbies] = useState(profile?.hobbies || []);
  const [selectedFavourite, setSelectedFavourite] = useState(profile?.favoriteActivity || []);
  const [inputValue, setInputValue] = useState(localNumber);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | undefined>(countryData);
  function handleSelectedCountry(country: any) {
    setSelectedCountry(country);
  }
  function handleInputValue(phoneNumber: string) {
    setInputValue(phoneNumber);
  }
  function extractLocalPhoneNumber(fullPhoneNumber: string, callingCode?: any) {
    if (!callingCode?.startsWith("+")) {
      callingCode = `+${callingCode}`;
    }
    return fullPhoneNumber?.replace(callingCode, "") || "";
  }

  useEffect(() => {
    const fetchProfileDetails = async () => {
      let result = await viewProfile();
      if (result?.data) {
        const object = result.data
        for (const property in object) {
          console.log(`${property}: ${object[property]}`);
          dispatch(updateUserField({ key: property, value: object[property] }))
        }
        const countryData = getCountryByPhoneNumber(result.data.mobileNumber);
        const localNumber = extractLocalPhoneNumber(
          result.data.mobileNumber,
          countryData?.idd?.root
        );
        setInputValue(localNumber);
        setSelectedCountry(countryData);

      }
    }
    fetchProfileDetails();
  }, []);

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
    onSubmit: async (values: any) => {
      console.log("values: sdfjsdlfsdfsdlfksdlkf", values);

      try {

        console.log("profile?.department: ", profile?.department);
        if (profile?.department === "Shore_Staff") {
          await validationSchemaForSoreStaff.validate(values, { abortEarly: false });
          setErrors({});
        }
        else {
          await validationSchema.validate(values, { abortEarly: false });
          setErrors({});
        }

        if (!profile) throw new Error("User details not found");

        const body: Record<string, any> = {
          userId: profile.id,
          countryCode: profile.countryCode,
          dob: values.dob,
          mobileNumber: profile.mobileNumber,
          email: profile.email,
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
        const response = await updateprofile(body);

        if (response.status === 200) {
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
          router.back();
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log("error.name:", error.name);

          if (error.name === "ValidationError" && "inner" in error) {
            const validationErrors: Record<string, string> = {};

            const yupError = error as any; // Yup-specific narrowing

            const errorMessages = yupError.inner
              ?.map((err: any) => err.message)
              .join("\n");

            yupError.inner?.forEach((err: any) => {
              if (err.path) {
                validationErrors[err.path] = err.message;
              }
            });

            setErrors(validationErrors);

            Toast.show({
              type: "error",
              text1: "Validation Error",
              text2: errorMessages || "Please fill all required fields correctly",
              autoHide: true,
              visibilityTime: 4000,
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
        }
      } finally {
        setLoading(false);
      }
    }
  });
  const ErrorMessage = ({ error }: { error: string }) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  const TextInputField = ({ icon, name, value, onChangeText, placeholder, editable = true }: { icon: ReactNode, value: string, name: string, onChangeText: (text: string) => void, placeholder: string, editable?: boolean }) => {
    return <>
      <View style={styles.inputContainer}>
        {icon}
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#B7B7B7"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoFocus={false}
        />
      </View>
      {<ErrorMessage error={errors[name]} />}
    </>
  }

  const inputTextArray = [
    { name: "name", placeholder: "Full Name", value: formik.values.name, onChangeText: formik.handleChange("name"), icon: <User size={24} color="black" /> },
    { name: "email", placeholder: "Email", value: formik.values.email, onChangeText: formik.handleChange("email"), icon: <Mail size={24} color="black" /> },

  ]
  const aboutInputRef = useRef(null);
  useEffect(() => {
    setInputRefs({ about: aboutInputRef });
  }, []);


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={50}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <GlobalHeader title="Edit Profile" />
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {/* {loading && <ActivityIndicator size={60} />} */}
          {inputTextArray.map((item, index) => <TextInputField key={index} {...item} />)}
          <View style={styles.phoneInputContainer} pointerEvents="none">
            <PhoneInput
              value={inputValue}
              onChangePhoneNumber={handleInputValue}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={handleSelectedCountry}
              // textInputStyle={{ backgroundColor: "#ffffff" }}
              // flagButtonStyle={{ backgroundColor: "#ffffff" }}
              // codeTextStyle={{ backgroundColor: "#ffffff" }}
              placeholder="Input your phone"
              defaultCountry="SG"
              // disableCountryChange={true}
              phoneInputStyles={{ container: { borderWidth: 0 } }}
              editable={false}
              autoFocus={false} // New: Prevent auto-focus
            />
          </View>


          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => {
              setShowDatePicker(true);
              // datePickerRef.current?.click();
            }}
          >
            <Calendar size={24} color="black" />
            <Text style={styles.dateText}>{formik.values.dob || "Select Your DOB"}</Text>
          </TouchableOpacity>
          {formik.errors.dob && formik.touched.dob && <ErrorMessage error={formik.errors.dob as string} />}
          {showDatePicker && (
            <CustomDateTimePicker
              // ref={datePickerRef}
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

          {/* {
          DropDownList.map((item, index) => <CustomDropdown 
          key={index} 
          data={item.data} 
          onChange={item.onChange}
          value={item.value}
          placeholder={item.placeholder}
          dropdownStyle={item.dropdownStyle}
          renderLeftIcon={item.renderLeftIcon}
          
          />)
        } */}

          <View style={styles.postOption}>
            <View style={styles.TextInputText}>
              <CustomDropdown
                data={GENDER}
                value={formik.values.gender}
                onChange={(value) => formik.setFieldValue("gender", value)}
                placeholder="Select Gender"
                dropdownStyle={{ width: "100%" }}
                renderLeftIcon={() => (
                  <VenusAndMars />
                )}
              />
            </View>
          </View>
          <ErrorMessage error={errors.gender} />

          <View style={styles.postOption}>
            <View style={styles.TextInputText}>
              <CustomDropdown
                data={EXPERIENCE}
                value={formik.values.experience}
                onChange={(value) => formik.setFieldValue("experience", value)}
                placeholder="Select Experience"
                dropdownStyle={{ width: "100%" }}
                renderLeftIcon={() => (
                  <Image
                    style={styles.icon}
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
                data={ETHNICITY}
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
                data={RELATIONSHIP}
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
                data={RELIGION}
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
            // selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            // itemSelectedStyle={styles.itemSelectedStyle}
            activeColor={Colors.lightGreen}
            data={HOBBIES_OPTIONS}
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
                <CircleX size={16} />
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
            // selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            // itemSelectedStyle={styles.itemSelectedStyle}
            activeColor={Colors.lightGreen}
            data={FAV_ACTIVITY_OPTIONS}
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
                <CircleX size={16} />
              </TouchableOpacity>
            )}
            renderLeftIcon={() => (
              <Heart size={20} style={styles.icon} />
            )}
          />
          <ErrorMessage error={errors.favoriteActivity} />

          <View style={[styles.inputContainerTextArea, { height: 100, marginTop: 10 }]}>
            <TextInput
              ref={aboutInputRef}

              placeholder="Tell Us About Yourself."
              placeholderTextColor="#B7B7B7"
              value={formik.values.about}
              onChangeText={formik.handleChange("about")}
              multiline
              maxLength={600}
              style={[styles.input, { height: 100, textAlignVertical: "top" }]}

              // onSelectionChange={handleSelectionChange}
              // onContentSizeChange={handleContentSizeChange}
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              keyboardType="default"
              autoFocus={false} // New: Prevent auto-focus
            />
          </View>
          <ErrorMessage error={errors.about} />

          <TouchableOpacity style={styles.button}
            onPress={() => formik.handleSubmit()}
          >
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>

        </ScrollView>

      </View>
    </KeyboardAvoidingView>
  )
}

export default EditProfile


const styles = StyleSheet.create({
  loaderStyle: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

  },
  scrollView: {
    paddingBottom: Platform.OS === "ios" ? 200 : 150,
    paddingHorizontal: 16,
    paddingTop: 20
  },
  textInput: {
    marginLeft: 8, color: "#454545",
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 10,
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
    // backgroundColor:"red"
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
    width: 20,
    height: 20,
    marginLeft: -2,
    marginRight: 10
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
    backgroundColor: Colors.lightGreen,
  },
  textSelectedStyle: {
    color: "#000",
    fontSize: 12,
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
})