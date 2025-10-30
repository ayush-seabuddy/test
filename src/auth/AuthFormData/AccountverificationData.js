import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Spinner from "react-native-loading-spinner-overlay";
import { OtpInput } from "react-native-otp-entry";
import Colors from "../../colors/Colors";
import {
  apiServerUrl,
} from "../../Api";
import Toast from "react-native-toast-message";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import { BlurView } from "@react-native-community/blur";
import axios from "axios";
import CustomLottie from "../../component/CustomLottie";

const { width, height } = Dimensions.get("window");

const AccountverificationData = ({ navigation, route }) => {
  var _email = route.params.data;

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

  const handleOtpChange = (value) => {
    setOtp(value);
    if (value.length === 6) {
      setOtpComplete(true);
    }
  };

  const VerifyOTP = async () => {
    try {
      var body = JSON.stringify({
        email: _email,
        otp: otp,
      });

      setIsLoading(true);

      // var response = await apiCallWithToken(
      //   apiServerUrl + "/user/verifyOtp",
      //   "POST",
      //   body,
      //   null
      // );
      const res = await axios({
        method: "post",
        url: apiServerUrl + "/user/verifyOtp",
        data: {
          email: _email,
          otp: otp,
        },
      });

      const response = res.data;

      if (response.responseCode === 200) {
        setIsLoading(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.responseMessage,
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
          },
        });
        setTimeout(() => {
          navigation.navigate("AuthNav", { screen: "LoginData" });
        }, 2000);

        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error.response.data, "Error");
      if (error.response.data) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error?.response?.data?.responseMessage || "Something went wrong.",
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
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
          },
        });
      } else if (mydata.responseCode === 402) {
        console.log(mydata.responseMessage);
      }
    } catch (error) {
      console.log(error);
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
          <View style={{ position: "absolute", top: "50%", right: 0, left: 0 }}>
            <Spinner visible={isLoading} size="large" color="#000" />
          </View>
          <View
            style={{
              width: "100%",
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              height: "41.5%",
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
              blurAmount={30}
              reducedTransparencyFallbackColor="white"
            />

            <View style={{ marginTop: 30 }}>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontFamily: "WhyteInktrap-Bold",
                    fontSize: 20,
                    color: "#161616",
                    paddingVertical: Platform.OS == 'ios' ? 8 : 0,
                  }}
                >
                  Check your email
                </Text>
              </View>

              <View style={{ marginHorizontal: 20 }}>
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontWeight: "500",
                    fontSize: 14,
                    color: "#161616",
                    marginTop: Platform.OS == 'ios' ? 10 : 18,
                    textAlign: "center",
                  }}
                >
                  We sent a code to {_email}
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 12,
                    color: "#949494",
                    marginTop: 12,
                    textAlign: "auto",
                    lineHeight: 18,
                  }}
                >
                  To complete registration, you will receive an email with a One
                  Time Password (OTP). Type that code below:
                </Text>
              </View>
              <View style={{ marginHorizontal: 20, marginTop: 40 }}>
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
                    // containerStyle: styles.container,
                    // pinCodeContainerStyle: styles.pinCodeContainer,
                    // pinCodeTextStyle: styles.pinCodeText,
                    // focusStickStyle: styles.focusStick,
                    focusedPinCodeContainerStyle: {
                      backgroundColor: Colors.white,
                      borderColor: Colors.secondary,
                      borderWidth: 4,
                      width: 50,
                      height: 52,
                    },
                    pinCodeContainerStyle: {
                      backgroundColor: Colors.white,
                      borderColor: "#E8E8E8",
                      borderWidth: 2,
                      width: 50,
                      height: 52,
                    },
                    pinCodeTextStyle: {
                      color: "#454545",
                    },
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 12,
                    color: "#949494",
                    marginTop: 16,
                  }}
                >
                  Copy and paste the code sent to your email address
                </Text>

                {otp.length === 6 ? (
                  <TouchableOpacity
                    onPress={VerifyOTP}
                    style={{
                      backgroundColor: "#02130B",
                      height: 50,
                      width: "100%",
                      // marginHorizontal: 22,
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
                      Register
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={VerifyOTP}
                    disabled
                    style={{
                      backgroundColor: "#808080",
                      height: 50,
                      width: "100%",
                      // marginHorizontal: 22,
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
                      Register
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View
                style={{
                  marginTop: "15%",
                  marginHorizontal: 25,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity onPress={ReVerifyOTP}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins-SemiBold",
                        color: "#06361F",
                        // marginLeft: 5,
                      }}
                    >
                      Click here
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins-Regular",
                      color: "#636363",
                    }}
                  >
                    {"  "} Didn’t receive the email?
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Toast />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AccountverificationData;

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
