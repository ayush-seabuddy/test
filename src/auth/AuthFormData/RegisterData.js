import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Animated,
  TextInput,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Checkbox } from "react-native-paper";
import PhoneInput, {
  getCountryByPhoneNumber,
} from "react-native-international-phone-number";
import Spinner from "react-native-loading-spinner-overlay";
import { apiServerUrl } from "../../Api";
import Toast from "react-native-toast-message";
import { BlurView } from "@react-native-community/blur";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import axios from "axios";
import CustomLottie from "../../component/CustomLottie";

const { width, height } = Dimensions.get("window");

const RegisterData = ({ route, navigation }) => {
  const { fullName, countryCode, mobileNumber } = route.params || {};
  const [Name, setName] = useState("" || route.params.fullName);
  const [email, setEmail] = useState("" || route.params.email);
  const [errorMessage, setErrorMessage] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [CountryCode, setCountryCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);




  const [password, setPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const handlePasswordChange = (value) => {
    setPassword(value);
    validatePassword(value);
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/]/.test(password);

    if (minLength && hasUppercase && hasLowercase && hasDigit && hasSpecialChar) {
      setPasswordStrength("Strong");
    } else {
      setPasswordStrength("Weak");
    }
  };

  const PhoneNum = "" || route.params.mobileNumber;

  // State to store the local phone number
  const [localPhoneNumber, setLocalPhoneNumber] = useState("");

  // Function to extract the local phone number
  function extractLocalPhoneNumber(fullPhoneNumber, callingCode) {
    // Ensure the calling code starts with "+"
    if (!callingCode.startsWith("+")) {
      callingCode = `+${callingCode}`;
    }

    // Remove the calling code from the full phone number
    const localNumber = fullPhoneNumber.replace(callingCode, "");

    return localNumber;
  }

  useEffect(() => {
    const InputData1 = getCountryByPhoneNumber(PhoneNum);

    // Extract the local phone number and update state
    const localNumber = extractLocalPhoneNumber(
      PhoneNum,
      InputData1.callingCode
    );
    setInputValue(localNumber);
    setCountryCode(InputData1.callingCode);
    setSelectedCountry(InputData1);

    // setLocalPhoneNumber(localNumber); // Update the state with the local number
  }, [PhoneNum]);
  const validateEmail = (input) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(input);
  };

  const handleEmailChange = (input) => {
    setEmail(input);
    if (!validateEmail(input)) {
      setErrorMessage("Please enter a valid email address");
    } else {
      setErrorMessage("");
    }
  };


  const handleConfirmPasswordChange = (input) => {
    setConfirmPassword(input);


  };

  const getStrengthBlockColor = (block) => {
    switch (block) {
      case "weak":
        return passwordStrength === "Weak" ||
          passwordStrength === "Medium" ||
          passwordStrength === "Strong"
          ? "#F44336" // Red
          : "#E0E0E0"; // Gray if no input
      case "medium":
        return passwordStrength === "Medium" || passwordStrength === "Strong"
          ? "#FF9800" // Orange
          : "#E0E0E0"; // Gray if no input
      case "strong":
        return passwordStrength === "Strong"
          ? "#4CAF50" // Green
          : "#E0E0E0"; // Gray if no input
      default:
        return "#E0E0E0"; // Default gray
    }
  };

  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  function handleInputValue(phoneNumber) {
    setInputValue(phoneNumber);
    // setPhoneNumberError("");
    // handleChange("phone", phoneNumber);
  }
  function handleSelectedCountry(country) {
    setSelectedCountry(country);
    setCountryCode(country.callingCode);
    // setPhoneNumberError("");
  }

  const RegisterUser = async () => {
    try {
      setIsLoading(true);

      const requestBody = {
        email: email,
        password: password,
      };

      const res = await axios({
        method: "POST",
        url: apiServerUrl + "/user/registration",
        data: requestBody,
      });

      const myData = res.data;
      setIsLoading(false);
      if (myData.responseCode === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: myData.responseMessage,
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: 10,
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
          },
        });

        const requestBody = {
          email: email,
        };

        // var myData = await apiCallWithTokenPost(
        //   apiServerUrl + "/user/resendOtp",
        //   "POST",
        //   requestBody,
        //   null
        // );

        navigation.navigate("AuthNav", {
          screen: "AccountverificationData",
          params: { data: email },
        });
      }
    } catch (error) {
      console.log("Error in the Registertion", error.response.data);
      if (error.response.data.responseCode === 409) {
        Toast.show({
          type: "error",
          text1: "ERROR",
          text2: error.response.data.responseMessage || "User already exist.",
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: 10,
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "ERROR",
          text2: error.response.data.responseMessage || "Something went wrong.",
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: 10,
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // adjust if header/nav present
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <FocusAwareStatusBar
            barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
            backgroundColor={"#CCCCCC"}
            hidden={false}
          />
          <CustomLottie isBlurView={false} componetHeight={height * 0.9} />
          <View style={{ position: "absolute", top: "50%", right: 0, left: 0 }}>
            <Spinner visible={isLoading} size="large" color="#000" />
          </View>

          <View
            style={{
              width: "100%",
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              height: "41%",
              backgroundColor: "#CCCCCC",
              position: "absolute",
            }}
          ></View>

          <Animated.Image
            source={require("../../assets/images/captonlogo.png")}
            style={[styles.image, { transform: [{ translateY }] }]}
          />

          <View
            style={{
              backgroundColor: "#FFFFFFB2",
              height: "72%",
              width: "100%",
              position: "absolute",
              bottom: 0,
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              overflow: "hidden",
              flex: 1,
            }}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={30}
              reducedTransparencyFallbackColor="white"
            />

            <View
              style={{
                alignItems: "center",
                marginTop: height * 0.03,
              }}
            >
              <Text
                style={{
                  fontFamily: "WhyteInktrap-Bold",
                  fontSize: 20,
                  color: "#161616",
                  paddingVertical: Platform.OS == 'ios' ? 5 : 0,
                }}
              >
                Register
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins-Regular",
                  fontSize: 14,
                  color: "#161616",
                  marginTop: 10,
                }}
              >
                Create your account
              </Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ paddingBottom: 10 }}
            >
              <View style={{ marginTop: height * 0.03 }}>
                <View style={{ alignItems: "center" }}>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name={"person-outline"}
                      size={20}
                      color="#888"
                      style={styles.leftIcon}
                    />

                    <TextInput
                      style={styles.textInput}
                      placeholder="Input your name"
                      placeholderTextColor="#B7B7B7"
                      value={Name}
                      onChangeText={(value) => setName(value)}
                      editable={false}
                    />
                  </View>
                </View>

                <View style={{ alignItems: "center", marginTop: 10 }}>
                  <View style={styles.inputContainer}>
                    <AntDesign
                      name={"mail"}
                      size={20}
                      color="#888"
                      style={styles.leftIcon}
                    />

                    <TextInput
                      style={styles.textInput}
                      placeholder="Input your email"
                      placeholderTextColor="#B7B7B7"
                      value={email}
                      onChangeText={handleEmailChange}
                      autoCapitalize="none"
                      editable={false}
                    />
                  </View>
                </View>

                <View
                  pointerEvents="none"
                  style={{ alignItems: "center", marginTop: 10 }}
                >
                  <View style={styles.inputContainer}>
                    <PhoneInput
                      value={inputValue}
                      onChangePhoneNumber={handleInputValue}
                      selectedCountry={selectedCountry}
                      onChangeSelectedCountry={handleSelectedCountry}
                      // containerStyle={styles.phoneInputContainer}
                      textInputStyle={{ backgroundColor: "#ffffff" }}
                      flagButtonStyle={{ backgroundColor: "#ffffff" }}
                      codeTextStyle={{ backgroundColor: "#ffffff" }}
                      placeholder="Input your phone"
                      defaultCountry={"SG"}
                      disableCountryChange={true}
                      phoneInputStyles={{
                        container: {
                          borderWidth: 0,
                        },
                      }}
                      editable={false}
                    />
                  </View>
                </View>

                {/* <View style={{ alignItems: "center", marginTop: 10 }}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name={"lock-closed-outline"}
                    size={25}
                    color="#888"
                    style={styles.leftIcon}
                  />

                  <TextInput
                    style={styles.textInput}
                    placeholder="Input password"
                    placeholderTextColor="#B7B7B7"
                    secureTextEntry={!isPasswordVisible} // Toggle password visibility
                    value={password}
                    onChangeText={handlePasswordChange}
                  />

                  <TouchableOpacity
                    onPress={() => setPasswordVisible(!isPasswordVisible)}
                  >
                    <Ionicons
                      name={isPasswordVisible ? "eye" : "eye-off-sharp"}
                      size={22}
                      color="#888"
                      style={styles.rightIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ marginHorizontal: 20 }}>
                {password.length > 0 ? (
                  <>
                    {passwordStrength != "Strong" && password.length <= 8 ? (
                      <View>
                        <Text style={{ color: "red", marginTop: 6 }}>
                          Password must include uppercase, lowercase, a number,
                          and a special character.
                        </Text>
                      </View>
                    ) : null}
                  </>
                ) : null}
              </View> */}

                <View style={{ alignItems: "center", marginTop: 10, }}>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name={"lock-closed-outline"}
                      size={25}
                      color="#888"
                      style={styles.leftIcon}
                    />

                    <TextInput
                      style={styles.textInput}
                      placeholder="Input password"
                      placeholderTextColor="#B7B7B7"
                      secureTextEntry={!isPasswordVisible}
                      value={password}

                      onChangeText={handlePasswordChange}
                    />

                    <TouchableOpacity
                      onPress={() => setPasswordVisible(!isPasswordVisible)}
                    >
                      <Ionicons
                        name={isPasswordVisible ? "eye" : "eye-off-sharp"}
                        size={22}
                        color="#888"
                        style={styles.rightIcon}
                      />
                    </TouchableOpacity>
                  </View>


                </View>
                <View style={{ marginHorizontal: 20, }}>
                  {password.length > 0 && (
                    <View>
                      {passwordStrength !== "Strong" && (
                        <Text style={{ color: "red", marginTop: 6 }}>
                          Password must be at least 8 characters, uppercase, lowercase, a number, and a special character.
                        </Text>
                      )}
                    </View>
                  )}
                </View>


                <View style={{ alignItems: "center", marginTop: 10 }}>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name={"lock-closed-outline"}
                      size={25}
                      color="#888"
                      style={styles.leftIcon}
                    />

                    <TextInput
                      style={styles.textInput}
                      maxLength={16}
                      placeholder="Confirm password"
                      placeholderTextColor="#B7B7B7"
                      secureTextEntry={!isConfirmPasswordVisible} // Toggle password visibility
                      value={ConfirmPassword}
                      onChangeText={handleConfirmPasswordChange}
                    />

                    <TouchableOpacity
                      onPress={() =>
                        setConfirmPasswordVisible(!isConfirmPasswordVisible)
                      }
                    >
                      <Ionicons
                        name={isConfirmPasswordVisible ? "eye" : "eye-off-sharp"}
                        size={22}
                        color="#888"
                        style={styles.rightIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {ConfirmPassword.length > 0 ? (
                  <>
                    {ConfirmPassword != password ? (
                      <View>
                        <Text
                          style={{
                            color: "red",
                            marginLeft: 22,
                            marginTop: 5,
                            fontFamily: "Poppins-Regular",
                            marginBottom: -7,
                          }}
                        >
                          Passwords do not match.
                        </Text>
                      </View>
                    ) : null}
                  </>
                ) : null}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    // justifyContent: "",
                    marginHorizontal: 16,
                    marginTop: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox.Android
                      status={checked ? "checked" : "unchecked"} // Set checkbox status based on the state
                      onPress={() => setChecked(!checked)}
                      color={checked ? "#8DAF02" : "#888"}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#454545",
                        fontFamily: "Poppins-Regular",
                      }}
                    >
                      I accept the
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity
                      onPress={() =>
                        // props.navigation.navigate("Terms and Conditions")
                        navigation.navigate("AppNav", {
                          screen: "Terms and Conditions",
                        })
                      }
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "blue",
                          fontFamily: "Poppins-Regular",
                          marginLeft: 5,
                          textDecorationLine: "underline",
                        }}
                      >
                        Terms and Conditions
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={{ marginTop: height * 0.02 }}>
                {password.length >= 8 && passwordStrength === "Strong" && ConfirmPassword === password &&
                  ConfirmPassword.length >= 8 &&
                  checked ? (
                  <TouchableOpacity
                    onPress={RegisterUser}
                    style={{
                      backgroundColor: "#02130B",
                      height: 50,
                      marginHorizontal: 22,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      // marginTop: 30,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins-SemiBold",
                        color: "#fff",
                      }}
                    >
                      Register
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={RegisterUser}
                    disabled
                    style={{
                      backgroundColor: "#808080",
                      height: 50,
                      marginHorizontal: 22,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      // marginTop: 30,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins-SemiBold",
                        color: "#fff",
                      }}
                    >
                      Register
                    </Text>
                    {/* {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    
                  )} */}
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ marginTop: height * 0.06 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    // alignItems: "flex-end",
                    // marginTop: "13%",
                    marginHorizontal: 30,
                    marginBottom: 30,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins-Regular",
                      color: "#808080",
                    }}
                  >
                    Already have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("AuthNav", { screen: "LoginData" })
                    }
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Poppins-SemiBold",
                        color: "#06361F",
                        marginLeft: 5,
                      }}
                    >
                      Login Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>

          <Toast />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegisterData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCCCCC",
  },
  image: {
    width: "100%",
    height: "50%",
    resizeMode: "contain",

    marginTop: 40,
  },
  lottieBackground: {
    width: width * 1,
    height: height * 0.9,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    position: "absolute",
    bottom: "0%",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: "90%",
    borderRadius: 10,
  },
  leftIcon: {
    marginRight: 10,
    marginLeft: 15,
  },
  rightIcon: {
    marginRight: 15,
  },
  textInput: {
    marginTop: 3,
    color: "#000",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlignVertical: "center",
    // height: 50,
    flexBasis: 200,
    flexGrow: 1,
    flexShrink: 1,
    paddingVertical: Platform.OS == 'ios' ? 12 : 12,
    // borderWidth
  },
  errorText: {
    fontSize: 14,
    color: "red",
    marginHorizontal: 20,
    marginTop: 3,
    fontFamily: "Poppins-Regular",
  },
  strengthBox: {
    marginTop: 10,
    width: "80%",
    height: 10,
    borderRadius: 5,
  },
  strengthText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 10,
  },
  strengthContainer: {
    flexDirection: "row",
    marginTop: 10,
    width: "40%",
    height: 10,
    // borderRadius: 5,
    marginLeft: 20,
    // marginVertical: 10,
    overflow: "hidden", // Ensure the blocks stay inside the container
  },
  strengthBlock: {
    flex: 1,
    height: "100%",
    marginHorizontal: 2,
  },
});
