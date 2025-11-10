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
  KeyboardAvoidingView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import Spinner from "react-native-loading-spinner-overlay";
import { apiServerUrl } from "../../Api";
import Toast from "react-native-toast-message";
import axios from "axios";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import { BlurView } from "@react-native-community/blur";
import CustomLottie from "../../component/CustomLottie";

const { width, height } = Dimensions.get("window");

const SetNewPasswordData = (props) => {

  var _email = props.route.params.data;

  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const validatePassword = (input) => {
    const strongPasswordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const mediumPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;

    if (strongPasswordRegex.test(input)) {
      return "Strong";
    } else if (mediumPasswordRegex.test(input)) {
      return "Medium";
    } else {
      return "Weak";
    }
  };

  const handlePasswordChange = (input) => {
    setPassword(input);

    // Check password strength and set appropriate value
    const strength = validatePassword(input);
    setPasswordStrength(strength);
  };
  const handleConfirmPasswordChange = (input) => {
    setConfirmPassword(input);

    // Check password strength and set appropriate value
    // const strength = validatePassword(input);
    // setPasswordStrength(strength);
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

  const [otp, setOtp] = useState("");
  const [otpComplete, setOtpComplete] = useState(false);

  const handleOtpChange = (value) => {
    setOtp(value);
    if (value.length === 6) {
      setOtpComplete(true);
    }
  };

  const showToast = (type, title, message) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      autoHide: true,
      visibilityTime: 2000,
      text1Style: {
        fontFamily: "WhyteInkTrap-Bold",
        fontSize: 16,
        color: "#000",
        paddingTop: Platform.OS === "ios" ? 8 : 0,
      },
      text2Style: {
        fontFamily: "WhyteInkTrap-Regular",
        fontSize: 14,
        color: "#000",
        paddingTop: Platform.OS === "ios" ? 8 : 0,
      },
    });
  };

  const VerifyPassword = async () => {
    setIsLoading(true);

    try {
      const requestBody = {
        email: _email,
        password: password,
      };

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      };

      // const response = await fetch(
      //   `${apiServerUrl}/user/resetPassword`,
      //   requestOptions
      // );
      const response = await axios.post(
        `${apiServerUrl}/user/resetPassword`,
        requestBody
      );

      if (response.data.responseCode === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.responseMessage,
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
        });
        setTimeout(() => {
          props.navigation.navigate("LoginData");
        }, 1000);
      } else if (response.data.responseCode === 409) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.responseMessage,
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.responseMessage,
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
        });
      }
    } catch (error) {
      console.error("Error occurred:", error.response.data.responseMessage);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response.data.responseMessage,
        autoHide: true,
        visibilityTime: 2000,
        text1Style: {
          fontFamily: "WhyteInkTrap-Bold",
          fontSize: 16,
          color: "#000",
          paddingTop: Platform.OS === "ios" ? 8 : 0,
        },
        text2Style: {
          fontFamily: "Poppins-Regular",
          fontSize: 14,
          color: "#000",
          paddingTop: Platform.OS === "ios" ? 8 : 0,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };
  const ReVerifyOTP = async () => {
    try {
      const DetailsData_requestOption = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "_email",
        }),
      };

      var response = await fetch(
        apiServerUrl + "/user/resendOtp",
        DetailsData_requestOption
      );
      var mydata = await response.json();
      if (mydata.responseCode === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: mydata.responseMessage,
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
        });
      } else if (mydata.responseCode === 402) {
        console.log(mydata.responseMessage);
      }
    } catch (error) {
      console.error("Error occurred:", error.response.data.responseMessage);

      if (error.response.data.responseCode) {
        // API responded with an error
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response.data.responseMessage,
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
          text2Style: {
            fontFamily: "Poppins-Regular",
            fontSize: 14,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
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

          <CustomLottie isBlurView={false} componetHeight={height * 0.78} />
          <View
            style={{
              width: "100%",
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              height: height * 0.42,
              backgroundColor: "#CCCCCC",
              position: "absolute",
            }}
          ></View>
          <View style={{ position: "absolute", top: "50%", right: 0, left: 0 }}>
            <Spinner visible={isLoading} size="large" color="#000" />
          </View>
          <Animated.Image
            source={require("../../assets/images/captonlogo.png")}
            style={[styles.image, { transform: [{ translateY }] }]}
          />
          <View
            style={{
              backgroundColor: "#FFFFFFB2",
              height: "61%",
              width: "100%",
              position: "absolute",
              bottom: 0,
              borderTopLeftRadius: 50,
              borderTopRightRadius: 50,
              overflow: "hidden",
            }}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={50}
              reducedTransparencyFallbackColor="white"
            />

            <View style={{ marginTop: 30 }}>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "WhyteInktrap-Bold",
                    fontSize: 20,
                    color: "#161616",
                    paddingTop: Platform.OS === "android" ? 0 : 10,
                  }}
                >
                  Set New Password!
                </Text>
              </View>

              <View style={{ marginHorizontal: 30, alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 14,
                    color: "#161616",
                    marginTop: 18,
                  }}
                >
                  Must be at least 8 character
                </Text>
              </View>
              <View style={{ marginTop: 30 }}>
                <View style={{ alignItems: "center" }}>
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

                {password.length > 0 ? (
                  <>
                    {passwordStrength != "Strong" && password.length <= 8 ? (
                      <Text
                        style={{ color: "red", marginLeft: 23, marginTop: 6 }}
                      >
                        Password must include uppercase, lowercase, a number, and
                        a special character.
                      </Text>
                    ) : null}
                  </>
                ) : null}

                <View style={{ alignItems: "center", marginTop: 15 }}>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name={"lock-closed-outline"}
                      size={25}
                      color="#888"
                      style={styles.leftIcon}
                    />

                    <TextInput
                      style={styles.textInput}
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
                          style={{ color: "red", marginLeft: 23, marginTop: 6 }}
                        >
                          Passwords do not match
                        </Text>
                      </View>
                    ) : null}
                  </>
                ) : null}
              </View>

              {password.length >= 8 && ConfirmPassword === password ? (
                <TouchableOpacity
                  onPress={VerifyPassword}
                  style={{
                    backgroundColor: "#02130B",
                    height: 50,
                    marginHorizontal: 22,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 30,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Poppins-SemiBold",
                      color: "#fff",
                    }}
                  >
                    Reset Password
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  // onPress={VerifyOTP}
                  disabled
                  style={{
                    backgroundColor: "#808080",
                    height: 50,
                    marginHorizontal: 22,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 30,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Poppins-SemiBold",
                      color: "#fff",
                    }}
                  >
                    Reset Password
                  </Text>
                </TouchableOpacity>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  // alignItems: "flex-end",
                  marginTop: "34%",
                  marginHorizontal: 30,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins-Regular",
                    color: "#454545",
                  }}
                >
                  Already have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => props.navigation.navigate("LoginData")}
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
          </View>
          <Toast />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SetNewPasswordData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCCCCC",
  },
  image: {
    width: "100%",
    height: "40%",
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 40,
  },
  lottieBackground: {
    width: width * 1,
    height: height * 0.78,
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
    color: "#000",
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    textAlignVertical: "center",
    height: 50,
    flexBasis: 200,
    flexGrow: 1,
    flexShrink: 1,
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
    height: 5,
    // borderRadius: 5,
    marginLeft: 20,
    marginVertical: 10,
    overflow: "hidden", // Ensure the blocks stay inside the container
  },
  strengthBlock: {
    flex: 1,
    height: "100%",
    marginHorizontal: 2,
  },
});
