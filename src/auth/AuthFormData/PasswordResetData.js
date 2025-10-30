import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Spinner from "react-native-loading-spinner-overlay";
import { OtpInput } from "react-native-otp-entry";
import Colors from "../../colors/Colors";
import { apiServerUrl } from "../../Api";
import Toast from "react-native-toast-message";
import axios from "axios";
import { BlurView } from "@react-native-community/blur";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import CustomLottie from "../../component/CustomLottie";

const { width, height } = Dimensions.get("window");

const PasswordResetData = (props) => {
  var _email = props.route.params.data;

  const [isLoading, setIsLoading] = useState(false);

  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const [otp, setOtp] = useState("");
  const [otpComplete, setOtpComplete] = useState(false);
  const [remainingTime, setRemainingTime] = useState(180); // 3 minutes in seconds
  const [canResend, setCanResend] = useState(false); // Track if resend button can be clicked

  const handleOtpChange = (value) => {
    setOtp(value);
    if (value.length === 6) {
      setOtpComplete(true);
    }
  };

  // Timer effect to count down the remaining time
  useEffect(() => {
    if (remainingTime === 0) {
      setCanResend(true); // Enable resend button when timer reaches 0
    }

    const timer = setInterval(() => {
      if (remainingTime > 0) {
        setRemainingTime((prevTime) => prevTime - 1);
      }
    }, 1000);

    return () => clearInterval(timer); // Clean up interval when component unmounts
  }, [remainingTime]);

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

  const VerifyOTP = async () => {
    setIsLoading(true); // Start loader

    try {
      const requestBody = {
        email: _email,
        otp: otp,
      };

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      };

      // const response = await fetch(
      //   `${apiServerUrl}/user/verifyOtp`,
      //   requestOptions
      // );
      const response = await axios.post(
        `${apiServerUrl}/user/verifyOtp`,
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
          props.navigation.navigate("SetNewPasswordData", { data: _email });
        }, 1000);
        // props.navigation.navigate("SetNewPasswordData", { data: _email });
      } else {
        // Handle specific API response codes
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
      // General error handling (e.g., network errors)
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

  const ReVerifyOTP = async () => {
    try {
      const DetailsData_requestOption = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: _email,
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
        setRemainingTime(180); // Reset the timer for 3 minutes after resending OTP
        setCanResend(false);
      } else if (mydata.responseCode === 402) {
        console.log(mydata.responseMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" + secs : secs}`;
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
          <CustomLottie isBlurView={false} />
          <View
            style={{
              width: "100%",
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              height: "42%",
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
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
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
                  Email verification
                </Text>
              </View>

              <View style={{ marginHorizontal: 20, alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 14,
                    color: "#161616",
                    marginTop: 18,
                    textAlign: "center",
                  }}
                >
                  We sent a code to {_email}
                </Text>
              </View>
              <View style={{ marginHorizontal: 25, marginTop: 40 }}>
                <OtpInput
                  numberOfDigits={6}
                  focusColor="green"
                  type="numeric"
                  focusStickBlinkingDuration={500}
                  // onChangeText={handleOtpChange} // Update Formik state with OTP input
                  onFilled={handleOtpChange} // Handle when OTP is filled
                  textInputProps={{
                    accessibilityLabel: "One-Time Password",
                  }}
                  theme={{
                    focusedPinCodeContainerStyle: {
                      backgroundColor: Colors.white,
                      borderColor: Colors.secondary,
                      borderWidth: 4,
                      width: 55,
                    },
                    pinCodeContainerStyle: {
                      backgroundColor: Colors.white,
                      borderColor: "#E8E8E8",
                      borderWidth: 2,
                      width: 55,
                    },
                    pinCodeTextStyle: {
                      color: "#454545",
                    },
                  }}
                />
              </View>
              {otp ? (
                <TouchableOpacity
                  onPress={VerifyOTP}
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
                      fontSize: 18,
                      fontFamily: "Poppins-SemiBold",
                      color: "#fff",
                    }}
                  >
                    Continue
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={VerifyOTP}
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
                    Continue
                  </Text>
                </TouchableOpacity>
              )}

              {remainingTime > 0 ? (
                <View
                  style={{
                    alignItems: "flex-end",
                    marginTop: 30,
                    marginRight: 30,
                  }}
                >
                  <Text>Resend OTP in {formatTime(remainingTime)}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={ReVerifyOTP}
                  style={{
                    alignItems: "flex-end",
                    marginTop: 30,
                    marginRight: 30,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins-SemiBold",
                      color: "#505050",
                    }}
                  >
                    Click here to resend
                  </Text>
                </TouchableOpacity>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: "30%",
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

export default PasswordResetData;

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
    height: height * 0.68,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    position: "absolute",
    top: "0%",
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
    height: 10,
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
