import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Animated,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import CheckBox from "react-native-check-box";
import Spinner from "react-native-loading-spinner-overlay";
import {
  apiServerUrl,
} from "../../Api";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BlurView } from "@react-native-community/blur";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import NetInfo from "@react-native-community/netinfo";
import {
  getAnnouncementData,
  GetAssessment,
} from "../../CommonApi";
import CustomLottie from "../../component/CustomLottie";
import { Checkbox } from "react-native-paper";
import { getFcmToken } from "../../PushNotification/NotificationListner";

const { width, height } = Dimensions.get("window");

const LoginData = (props) => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const toggleTerms = () => {
    setTermsAccepted(!termsAccepted);
  }
  const [isLoading, setIsLoading] = useState(false);
  const validateEmail = (input) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(input);
  };

  const handleEmailChange = (input) => {
    setEmail(input);
    if (!validateEmail(input)) {
      setErrorMessage("Please enter a valid email address.");
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
      let checkToken = await AsyncStorage.getItem("fmcToken");
      // console.log("checkToken: ", checkToken);
      if(!checkToken){
        await getFcmToken();
        checkToken = await AsyncStorage.getItem("fmcToken");
      }
      let body = {
        email: email.toLocaleLowerCase(),
        password: password,
      };
      if (checkToken) {
        body.deviceToken = checkToken;
      }
      setIsLoading(true);

      // Check network status
      const networkState = await NetInfo.fetch();
      if (networkState.isConnected) {
        // Online: Proceed with API call
        const response = await axios({
          method: "POST",
          url: `${apiServerUrl}/user/login`,
          data: body,
        });
        const result = response.data;
        console.log("result: ", result);
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
              paddingTop: Platform.OS === "android" ? 0 : 5,
            },
            text2Style: {
              fontFamily: "WhyteInkTrap-Regular",
              fontSize: 14,
              color: "#000",
              paddingTop: Platform.OS === "android" ? 0 : 5,
            },
          });

          // Store user details in AsyncStorage and Firestore
          await AsyncStorage.setItem("userDetails", JSON.stringify(result.result));
          await AsyncStorage.setItem("authToken", result.result.authToken);

          await GetAssessment();
          await getAnnouncementData();
          const storedUser = await AsyncStorage.getItem("userDetails");
          const user = JSON.parse(storedUser);
        

        if(user.isProfileCompleted === true && user?.department === "Shore_Staff" ){
          props.navigation.replace("AppNav", { screen: "HelperLanding" });
        } else if (
            user.isPersonalityTestCompleted === true &&
            user.isProfileCompleted === true
          ) {
            props.navigation.replace("AppNav", { screen: "HelperLanding" });
          } else if (user.isProfileCompleted === true) {
            props.navigation.replace("AppNav", { screen: "Mbti_Start_Test" });
          } else {
            props.navigation.replace("AppNav", { screen: "IntroScreen1" });
          }
        } else if (result.responseCode === 401) {
      
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
              paddingTop: Platform.OS === "android" ? 0 : 5,
            },
            text2Style: {
              fontFamily: "WhyteINKTrap-Regular",
              fontSize: 14,
              color: "#000",
              paddingTop: Platform.OS === "android" ? 0 : 5,
            },
          });
          props.navigation.navigate("AuthNav", {
            screen: "AccountverificationData",
            params: { data: email },
          });
        } else if (result.responseCode === 411) {
          console.log(response.data, "411");
          props.navigation.navigate("AuthNav", {
            screen: "SetNewPasswordData",
            params: { data: email },
          });
        } else {
          handleErrorResponse(result.responseCode, result.responseMessage);
        }
      } else {
        // Offline: Authenticate using locally stored data
        const storedUser = await AsyncStorage.getItem("userDetails");
        if (storedUser) {
          const user = JSON.parse(storedUser);

          // Match entered credentials with stored credentials
          if (user.email === email && user.password === password) {
            Toast.show({
              type: "success",
              text1: "Offline Login",
              text2: "Logged in successfully using offline data",
              autoHide: true,
              visibilityTime: 2000,
              text1Style: {
                fontFamily: "WhyteInkTrap-Bold",
                fontSize: 16,
                color: "#000",
                paddingTop: Platform.OS === "android" ? 0 : 5,
              },
              text2Style: {
                fontFamily: "WhyteInkTrap-Regular",
                fontSize: 14,
                color: "#000",
                paddingTop: Platform.OS === "android" ? 0 : 5,
              },
            });

            // Navigate to the appropriate screen
            if (user.profileCompleted) {
              props.navigation.replace("AppNav", {
                screen: "Mbti_Start_Test",
              });
            } else {
              props.navigation.replace("AppNav", { screen: "IntroScreen1" });
            }
          } else {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Incorrect credentials. Please try again.",
              autoHide: true,
              visibilityTime: 2000,
              text1Style: {
                fontFamily: "WhyteInkTrap-Bold",
                fontSize: 16,
                color: "#000",
                paddingTop: Platform.OS === "android" ? 0 : 5,
              },
              text2Style: {
                fontFamily: "WhyteInkTrap-Regular",
                fontSize: 14,
                color: "#000",
                paddingTop: Platform.OS === "android" ? 0 : 5,
              },
            });
          }
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "No offline data found. Please connect to the internet.",
            autoHide: true,
            visibilityTime: 2000,
            text1Style: {
              fontFamily: "WhyteInkTrap-Bold",
              fontSize: 16,
              color: "#000",
              paddingTop: Platform.OS === "android" ? 0 : 5,
            },
            text2Style: {
              fontFamily: "WhyteInkTrap-Regular",
              fontSize: 14,
              color: "#000",
              paddingTop: Platform.OS === "android" ? 0 : 5,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error occurred: Login", error);
      if (error?.response?.data?.responseCode === 401) {
        props.navigation.navigate("AuthNav", {
          screen: "AccountverificationData",
          params: { data: email },
        });
      } else if (error?.response?.data?.responseCode === 411) {
        console.log(error.response.data, "411 in catch");
        props.navigation.navigate("AuthNav", {
          screen: "SetNewPasswordData",
          params: { data: email },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.response?.data?.responseMessage || "Something went wrong",
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: Platform.OS === "android" ? 0 : 5,
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
            paddingTop: Platform.OS === "android" ? 0 : 5,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorResponse = (responseCode, responseMessage) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: responseMessage,
      autoHide: true,
      visibilityTime: 2000,
      text1Style: {
        fontFamily: "WhyteInkTrap-Bold",
        fontSize: 16,
        color: "#000",
        paddingTop: Platform.OS === "android" ? 0 : 5,
      },
      text2Style: {
        fontFamily: "WhyteInkTrap-Regular",
        fontSize: 14,
        color: "#000",
        paddingTop: Platform.OS === "android" ? 0 : 5,
      },
    });
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
          <CustomLottie componetHeight={height * 0.8} isBlurView={false} />
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
              // backgroundColor: "red",
              height: height * 0.6,
              width: "100%",
              position: "absolute",
              bottom: 0,
              paddingVertical: 20,
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
            <ScrollView
              style={{ height: "100%" }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={{
                  flexBasis: height * 0.17,
                  flexDirection: "column",
                  justifyContent: "center",
                  paddingBottom: 10,
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontFamily: "WhyteInktrap-Bold",
                      fontSize: 20,
                      color: "#161616",
                      paddingTop: Platform.OS === "android" ? 0 : 10,
                    }}
                  >
                    Welcome!
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 14,
                      color: "#161616",
                      marginTop: 12,
                    }}
                  >
                    Login to your account
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexBasis: height * 0.18,
                  // backgroundColor: "#c1c1c1c1",
                  justifyContent: "center",
                  // backgroundColor:'red'
                  marginVertical: 10,
                }}
              >
                <View style={{ alignItems: "center" }}>
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
                      keyboardType="email-address"
                      autoCorrect={false}
                      spellCheck={false}
                      autoComplete="off"
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

                <View style={{ alignItems: "center" }}>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name={"lock-closed-outline"}
                      size={20}
                      color="#888"
                      style={styles.leftIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Input password"
                      placeholderTextColor="#B7B7B7"
                      secureTextEntry={!isPasswordVisible} // Toggle password visibility
                      value={password}
                      onChangeText={(value) => setPassword(value)}
                    />

                    <TouchableOpacity
                      onPress={() => setPasswordVisible(!isPasswordVisible)}
                    >
                      <Ionicons
                        name={isPasswordVisible ? "eye" : "eye-off-sharp"}
                        size={25}
                        color="#888"
                        style={styles.rightIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {password.length > 0 && password.length < 8 && password ? (
                  <>
                    <Text
                      style={[
                        styles.errorText,
                        // { marginTop: 10 },
                      ]}
                    >
                      Password should be at least 8 characters long.
                    </Text>
                  </>
                ) : null}

                {/* <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginHorizontal: 20,
                    marginTop: 7,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      // backgroundColor:'red',
                      marginLeft: 2,
                    }}
                  >
                    <CheckBox
                      isChecked={checked}
                      onClick={() => setChecked((newValue) => !newValue)}
                      style={styles.checkbox}
                      checkedCheckBoxColor={"#8DAF02"}
                      uncheckedCheckBoxColor="gray"
                    />

                    <Text
                      style={{
                        fontSize: 12,
                        color: "#949494",
                        fontFamily: "Poppins-Regular",
                      }}
                    >
                      Remember me
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity
                      onPress={() =>
                        props.navigation.navigate("ForgotpasswordData")
                      }
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#505050",
                          fontFamily: "Poppins-Regular",
                          // marginRight: 5,
                        }}
                      >
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View> */}

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
                      isChecked={termsAccepted}
                      onPress={toggleTerms}
                      style={styles.checkbox}
                      checkedCheckBoxColor={"#8DAF02"}
                      uncheckedCheckBoxColor="gray"
                      status={termsAccepted ? "checked" : "unchecked"}
                      color={termsAccepted ? "#8DAF02" : "#888"}
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
                        props.navigation.navigate("AppNav", {
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


                {/* <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginHorizontal: 20,
                    marginTop: 7,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      // backgroundColor:'red',
                      marginLeft: 2,

                    }}
                  >
                    <CheckBox
                      isChecked={termsAccepted}
                      onClick={toggleTerms}
                      style={styles.checkbox}
                      checkedCheckBoxColor={"#8DAF02"}
                      uncheckedCheckBoxColor="gray"
                    />

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#000",
                          fontFamily: "Poppins-Regular",
                        }}
                      >
                        I accept the&nbsp;
                      </Text>

                      <Text
                        onPress={() =>
                          props.navigation.navigate("AppNav", {
                            screen: "Terms and Conditions",
                          })
                        }
                        style={{
                          textDecorationLine: "underline",
                          fontSize: 12,
                          color: "#000",
                          fontFamily: "Poppins-Regular",
                        }}
                      >
                        Privacy Policy & Terms & Conditions
                      </Text>
                    </View>

                  </View>

                </View> */}
              </View>
              <View
                style={{
                  flexBasis: height * 0.12,
                  // backgroundColor: "red",
                  justifyContent: "center",
                }}
              >
                {password.length >= 8 && email.length > 0 && termsAccepted ? (
                  <TouchableOpacity
                    onPress={ValidateUser}
                    style={{
                      backgroundColor: "#02130B",
                      height: 50,
                      marginHorizontal: 20,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      marginVertical: 10,
                      elevation: 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins-SemiBold",
                        color: "#fff",
                      }}
                    >
                      Login
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={ValidateUser}
                    disabled
                    style={{
                      backgroundColor: "#808080",
                      height: 50,
                      marginHorizontal: 22,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 10,
                      elevation: 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Poppins-SemiBold",
                        color: "#fff",
                      }}
                    >
                      Login
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View>
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate("ForgotpasswordData")
                  }
                  style={{
                    marginTop: 30,
                    // marginRight: 30,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#505050",
                      fontFamily: "Poppins-Regular",
                      // marginRight: 5,
                    }}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>


              <View
                style={{
                  marginTop: 40,
                  flexBasis: 80,
                  justifyContent: "flex-end",
                }}
              >
              </View>
            </ScrollView>
          </View>
          <Toast />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#CCCCCC",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "40%",
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 30,
  },
  lottieBackground: {
    width: width * 1,
    height: height * 0.8,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    position: "absolute",
    bottom: "0%",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    // backgroundColor:'red',
    width: "89%",
    borderRadius: 8,
    marginVertical: 10,
  },
  leftIcon: {
    marginRight: 10,
    marginLeft: 15,
  },
  checkbox: {
    marginRight: 5, // to align it with the text
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
    height: 48,
    flexBasis: 200,
    flexGrow: 1,
    flexShrink: 1,
    // borderWidth
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginHorizontal: 25,
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