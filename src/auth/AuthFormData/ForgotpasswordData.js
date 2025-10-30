import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Animated,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import Spinner from "react-native-loading-spinner-overlay";
import { apiCall, apiServerUrl } from "../../Api";
import Toast from "react-native-toast-message";
import axios from "axios";
import { BlurView } from "@react-native-community/blur";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import CustomLottie from "../../component/CustomLottie";

const { width, height } = Dimensions.get("window");

const ForgotpasswordData = (props) => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
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

  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const ValidateUser = async () => {
    try {
      const body = {
        email: email,
        password: password,
      };
      setIsLoading(true);
      const result = await apiCall(apiServerUrl + "/user/login", "POST", body);
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
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
        });
      } else if (result.responseCode === 402) {
        console.log("Payment Required:", result.responseMessage);
      } else if (result.responseCode === 404) {
        console.log("User Not Found:", result.responseMessage);
      }
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        console.log("API Error:", error.response.data);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response.data.message || "An error occurred.",
        });
      } else if (error.request) {
        console.log("Network Error:", error.request);
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Please check your internet connection.",
        });
      } else {
        console.log("Unexpected Error:", error.message);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong. Please try again later.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const ReVerifyOTP = async () => {
    try {
      const DetailsData_requestOption = {
        email: email,
      };
      const response = await axios.post(
        `${apiServerUrl}/user/resendOtp`,
        DetailsData_requestOption
      );
      var mydata = response.data;
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
          props.navigation.navigate("PasswordResetData", { data: email });
        }, 2000);
        // props.navigation.navigate("PasswordResetData", { data: email });
      } else if (response.data.responseCode === 402) {
        console.log(response.data.responseMe412sage);
      }
    } catch (error) {
      console.error("Error occurred:", error.response.data);

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

          <CustomLottie isBlurView={false} />
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
                    paddingBottom: Platform.OS === "android" ? 0 : 8,
                  }}
                >
                  Forgot Password?
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 14,
                    color: "#161616",
                    marginTop: 13,
                    paddingHorizontal: 20,
                    textAlign: "center",
                  }}
                >
                  No worries, please enter your registered email address, we’ll
                  send you reset instruction.
                </Text>
              </View>

              <View style={{ alignItems: "center", marginTop: 30 }}>
                <View style={styles.inputContainer}>
                  <AntDesign
                    name={"mail"}
                    size={23}
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
                  />
                </View>
              </View>
              {email.length > 0 ? (
                <>
                  {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  ) : null}
                </>
              ) : null}

              {email.length > 0 && errorMessage == "" ? (
                <TouchableOpacity
                  onPress={ReVerifyOTP}
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
                      lineHeight: 22,
                      fontSize: 15,
                      fontFamily: "Poppins-SemiBold",
                      color: "#fff",
                    }}
                  >
                    Send Reset Link
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={ReVerifyOTP}
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
                      lineHeight: 22,
                      fontSize: 14,
                      fontFamily: "Poppins-SemiBold",
                      color: "#fff",
                    }}
                  >
                    Proceed to Reset
                  </Text>
                </TouchableOpacity>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: "45%",
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

export default ForgotpasswordData;

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
