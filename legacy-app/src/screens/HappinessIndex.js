import React, { useRef, useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  FlatList,
  Keyboard,
  TextInput,
  SectionList,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCallWithToken, apiServerUrl } from '../Api';
import { Checkbox, ProgressBar, RadioButton } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import { BlurView } from '@react-native-community/blur';
import Toast from 'react-native-toast-message';
import CustomDropdown from '../CommonApi';
import Slider from '@react-native-community/slider';
import moment from 'moment';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProfleSettingHeader from '../component/headers/ProfileHeader/ProfleSettingHeader';
import CustomLottie from '../component/CustomLottie';
import HeaderForTest from '../component/headers/ProfileHeader/HeaderForTest';
import Icon from 'react-native-vector-icons/MaterialIcons';
const { width, height } = Dimensions.get('window');

const HappinessIndex = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [data, setData] = useState([]);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Extract showPopup from route params, default to false
  useEffect(() => {
    const showPopup = route.params?.showPopup ?? false;
    console.log("route.params: ", route.params);
    setIsPopupVisible(showPopup);
    setIsModalVisible(showPopup);
  }, [route.params]);

  const getHappinesIndex = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const result = await apiCallWithToken(
        `${apiServerUrl}/user/getAssessmentQuestions?questionType=HAPPINESS`,
        'GET',
        null,
        token,
      );

      if (result.result.length > 0) {
        const initialResponses = {};
        result.result.forEach((item) => {
          if (item.answerType === 'Linear Scale' || item.answerType === 'Linear Scale(1-5)') {
            initialResponses[item.id] = {
              questionId: item.id,
              answer: 1,
              createdAt: new Date().toISOString(),
            };
          }
        });
        setResponses(initialResponses);
        setData(result.result);
      }
    } catch (error) {
    } finally {
      // setIsModalVisible(true)
    }
  };

  useEffect(() => {
    getHappinesIndex();
  }, []);

  const [responses, setResponses] = useState({});

  const handleInputChange = (questionId, value) => {
    setResponses(prev => {
      const newResponses = {
        ...prev,
        [questionId]: {
          questionId,
          answer: value,
          createdAt: new Date().toISOString(),
        },
      };
      return newResponses;
    });
  };

  const handleCheckboxChange = (questionId, option) => {
    setResponses(prev => {
      const existingResponse = prev[questionId] || { questionId, answer: [] };
      const currentAnswers = Array.isArray(existingResponse.answer)
        ? existingResponse.answer
        : [];
      const updatedAnswer = currentAnswers.includes(option)
        ? currentAnswers.filter(item => item !== option)
        : [...currentAnswers, option];
      const updatedResponse = {
        ...existingResponse,
        answer: updatedAnswer,
        createdAt: new Date().toISOString(),
      };
      const newResponses = {
        ...prev,
        [questionId]: updatedResponse,
      };
      return newResponses;
    });
  };

  const numberOfQuestionsAnswered = data.reduce((count, item) => {
    const response = responses[item.id];
    if (!response || !response.answer) return count;
    switch (item.answerType) {
      case 'Textarea':
      case 'Textfield':
        if (typeof response.answer === 'string' && response.answer.trim() !== '') return count + 1;
        break;
      case 'Checkbox':
        if (Array.isArray(response.answer) && response.answer.length > 0) return count + 1;
        break;
      case 'Radio':
      case 'Dropdown':
        if (typeof response.answer === 'string' && response.answer !== '') return count + 1;
        break;
      case 'Linear Scale':
      case 'Linear Scale(1-5)':
        if (typeof response.answer === 'number' && response.answer > 0) return count + 1;
        break;
    }
    return count;
  }, 0);

  const validateResponses = () => {
    const requiredQuestions = data.filter(item => item.required === true);
    for (const question of requiredQuestions) {
      const response = responses[question.id];
      if (!response || !response.answer) {
        return false;
      }
      switch (question.answerType) {
        case 'Textarea':
        case 'Textfield':
          if (
            typeof response.answer !== 'string' ||
            response.answer.trim() === ''
          ) {
            return false;
          }
          break;
        case 'Checkbox':
          if (!Array.isArray(response.answer) || response.answer.length === 0) {
            return false;
          }
          break;
        case 'Radio':
        case 'Dropdown':
          if (typeof response.answer !== 'string' || response.answer === '') {
            return false;
          }
          break;
        case 'Linear Scale':
        case 'Linear Scale(1-5)':
          if (typeof response.answer !== 'number' || response.answer === 0) {
            return false;
          }
          break;
        default:
          return false;
      }
    }
    return true;
  };

  const isvalid = validateResponses();

  const PostHappinessData = async () => {
    if (!validateResponses()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please answer all required questions.',
      });
      return;
    }
    const extractedArray = Object.values(responses).map(response => ({
      ...response,
      answer: Array.isArray(response.answer)
        ? response.answer.join(';; ')
        : response.answer,
    }));
    const token = await AsyncStorage.getItem('authToken');
    const body = {
      questionType: 'Happiness'.toUpperCase(),
      month: moment().subtract(1, 'months').format('MM-yyyy').toString(),
      answers: extractedArray,
    };
    try {
      const response = await apiCallWithToken(
        apiServerUrl + '/user/saveAssessmentResponses',
        'POST',
        body,
        token,
      );
      if (response.responseCode === 200) {
        navigation.navigate('Home', { screen: 'Health' });
      }
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const progressPercentage = data.length > 0 ? (numberOfQuestionsAnswered / data.length) * 100 : 0;

  const renderItem = ({ item, index }) => {
    return (
      <View style={[styles.frameFlexBox]}>
        <View
          style={[
            styles.youRegularlyMakeNewFriendsParent,
            styles.youParentSpaceBlock,
          ]}>
          <Text style={[styles.youRegularlyMake, styles.personalityTypo]}>
            {index + 1}. {item.question}{' '}
            {item.required == false ? '(optional)' : ''}
          </Text>
          {item.answerType === 'Textarea' && (
            <TextInput
              style={{
                backgroundColor: '#fff',
                padding: 8,
                borderRadius: 8,
                fontFamily: 'Poppins-Regular',
                fontSize: 15,
              }}
              placeholder={'Enter your answer'}
              value={responses[item.id]?.answer || ''}
              multiline
              onChangeText={value => handleInputChange(item.id, value)}
            />
          )}
          {item.answerType === 'Textfield' && (
            <TextInput
              style={{
                backgroundColor: '#fff',
                padding: 8,
                borderRadius: 8,
                height: 50,
                fontFamily: 'Poppins-Regular',
                fontSize: 15,
              }}
              placeholder={item.question}
              value={responses[item.id]?.answer || ''}
              onChangeText={value => handleInputChange(item.id, value)}
            />
          )}
          {item.answerType === 'Dropdown' && (
            <CustomDropdown
              data={item.answerOptions.map(option => ({
                label: option,
                value: option,
              }))}
              value={responses[item.id]?.answer || ''}
              onChange={value => handleInputChange(item.id, value)}
              placeholder="Select an option"
              dropdownStyle={{
                borderWidth: 1,
                borderColor: '#c1c1c1',
                borderRadius: 8,
                backgroundColor: '#fff',
                width: '100%',
              }}
            />
          )}
          {item.answerType === 'Checkbox' &&
            item.answerOptions?.map((option, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    handleCheckboxChange(item.id, option);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: -5,
                  }}>
                  <Checkbox.Android
                    status={
                      Array.isArray(responses[item.id]?.answer) &&
                        responses[item.id]?.answer.includes(option)
                        ? 'checked'
                        : 'unchecked'
                    }
                    color={
                      Array.isArray(responses[item.id]?.answer) &&
                        responses[item.id]?.answer.includes(option)
                        ? '#B0DB02'
                        : '#c1c1c1'
                    }
                    uncheckedColor="#808080"
                  />
                  <Text
                    style={{
                      color: '#fff',
                      fontFamily: 'Poppins-Regular',
                      fontSize: 14,
                      lineHeight: 28,
                    }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          {item.answerType === 'Radio' && (
            <RadioButton.Group
              onValueChange={value => {
                handleInputChange(item.id, value);
              }}
              value={
                responses[item.id]?.answer !== undefined
                  ? responses[item.id]?.answer.toString()
                  : ''
              }>
              {item.answerOptions.map((option, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <RadioButton.Android
                    value={option.toString()}
                    color="rgba(132, 164, 2, 1)"
                    uncheckedColor="#fff"
                  />
                  <Text style={{ color: '#fff' }}>{option}</Text>
                </View>
              ))}
            </RadioButton.Group>
          )}
          {item.answerType === 'Linear Scale(1-5)' && (
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={responses[item.id]?.answer || 1}
              onValueChange={value => handleInputChange(item.id, value)}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#c1c1c1"
            />
          )}
          {item.answerType === 'Linear Scale' && (
            <>
              <Slider
                style={{ width: '100%', height: 10 }}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={responses[item.id]?.answer || 1}
                onValueChange={value => handleInputChange(item.id, value)}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#c1c1c1"
              />
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  width: '100%',
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 24,
                    fontFamily: 'Poppins-SemiBold',
                    color: '#fff',
                  }}>
                  Very Unhappy
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 24,
                    fontFamily: 'Poppins-SemiBold',
                    color: '#fff',
                  }}>
                  Very Happy
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const sectionedData = data.reduce((acc, item) => {
    const section = acc.find(sec => sec.title === item.section);
    if (section) {
      section.data.push(item);
    } else {
      acc.push({ title: item.section, data: [item] });
    }
    return acc;
  }, []);

  const handleHeaderLayout = event => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  const currentDate = new Date();
  const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
  const previousMonthName = previousMonth.toLocaleString("default", { month: "long" });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight + (Platform.OS === 'ios' ? -20 : 0)}
    >
      <View onLayout={handleHeaderLayout}>
        <HeaderForTest navigation={navigation} title={'Monthly Happiness Index'} isRequired={isModalVisible} screenName={'HAPPINESSINDEX'} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight + (Platform.OS === 'ios' ? -20 : 0)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {Platform.OS === 'ios' ? (
            <CustomLottie isBlurView={false} type={'fullscreen'} />
          ) : (
            <LottieView
              source={require('../assets/Background.json')}
              autoPlay
              loop
              resizeMode="cover"
              style={{ height: '100%', position: 'absolute' }}
            />
          )}
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={30}
            reducedTransparencyFallbackColor="white"
          >
            <View style={{ backgroundColor: 'rgba(215, 215, 215, 0.9)', flex: 1 }}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={{ paddingHorizontal: 14, paddingVertical: 10, gap: 16 }}>
                    <Text
                      style={{
                        color: '#000',
                        fontSize: 14,
                        marginTop: 10,
                        fontFamily: 'Poppins-Regular',
                      }}
                    >
                      This short survey helps us understand how you’re feeling at sea across work, relationships, rest, and connection. Your feedback shapes better support, systems, and onboard culture. Tailored to your real needs.{"\n\n"}

                      🔹 Anonymous & Confidential: Your responses are safe and for improvement, not evaluation{"\n\n"}

                      🔹 Impactful: Honest answers lead to real changes
                    </Text>

                    <Text
                      style={{
                        color: "#000",
                        fontSize: 14,
                        textAlign: 'right',
                        marginTop: 10,
                        fontFamily: "Poppins-Regular",
                      }}
                    >
                      ⏰ Under 10 mins
                    </Text>
                    <ProgressBar
                      progress={progressPercentage / 100}
                      color={"rgba(132, 164, 2, 1)"}
                      style={{
                        borderRadius: 6,
                        height: 9,
                      }}
                    />

                    <Text style={{
                      textAlign: 'right',
                      color: "#161616",
                      fontSize: 14,
                      fontFamily: "Poppins-Regular"
                    }}>
                      {Math.round(progressPercentage)}%
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: '#00000066',
                      borderTopLeftRadius: 50,
                      borderTopRightRadius: 50,
                      width: '100%',
                    }}
                  >
                    <View
                      style={{
                        height: 3,
                        width: '28%',
                        backgroundColor: '#FFFFFF66',
                        alignSelf: 'center',
                        marginTop: 10,
                        borderRadius: 10,
                      }}
                    />
                    <View
                      style={{
                        marginHorizontal: 20,
                        marginTop: 20,
                        marginBottom: 5,
                      }}
                    >
                      <Text style={styles.personalityTest}>
                        {numberOfQuestionsAnswered || 0}/{data.length}
                      </Text>
                    </View>
                    <SectionList
                      nestedScrollEnabled={true}
                      sections={sectionedData}
                      keyExtractor={item => item.id}
                      renderItem={renderItem}
                      renderSectionHeader={renderSectionHeader}
                      showsVerticalScrollIndicator={false}
                      style={styles.sectionList}
                      contentContainerStyle={[
                        styles.contentContainer,
                        { paddingBottom: 10 },
                      ]}
                      scrollEnabled={false}
                      ListFooterComponent={
                        <View style={{ alignItems: "center", marginBottom: 10 }}>
                          {/* Disclaimer Text */}
                          <Text
                            style={{
                              marginHorizontal: 20,
                              marginVertical: 10,
                              fontFamily: "Poppins-Regular",
                              fontSize: 14,
                              fontStyle: "italic", // Italic applied
                              color: "#fff",
                            }}
                          >
                            * This survey is private and strictly confidential only to support crew wellbeing, not performance review or employment decisions.
                          </Text>

                          {/* Submit Button */}
                          <TouchableOpacity
                            style={{
                              height: 50,
                              width: '90%',
                              backgroundColor: '#fff',
                              marginVertical: 20,
                              alignSelf: 'center',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 10,
                              opacity: isvalid ? 1 : 0.5,
                            }}
                            onPress={() => {
                              if (isvalid) PostHappinessData();
                            }}
                          >
                            <Text
                              style={{
                                color: '#06361F',
                                fontSize: 18,
                                fontWeight: 'bold',
                              }}
                            >
                              Submit
                            </Text>
                          </TouchableOpacity>
                        </View>
                      }

                    />
                  </View>
                </ScrollView>
              </TouchableWithoutFeedback>
            </View>
          </BlurView>
          {/* Popup Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={isPopupVisible}
            onRequestClose={() => setIsPopupVisible(false)}
          >
            <View style={styles.overlay}>
              <View style={styles.modalContainer}>
                <View
                  style={{
                    backgroundColor: '#fff7d1',
                    borderRadius: 50,
                    padding: 15,
                    marginBottom: 20,
                  }}
                >
                  <Icon name="warning" size={40} color="#d4a017" />
                </View>
                <Text style={[styles.title, { marginBottom: 0 }]}>{previousMonthName} </Text>
                <Text style={styles.title}>Happiness Index</Text>
                <Text style={styles.subTitle}>⏰ 10 mins · Industry Standard</Text>
                <Text style={styles.message}>Fill the Seafarers’ Happiness Index now and contribute to global insights that shape a better future for all seafarers.</Text>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setIsPopupVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Start Survey</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Toast />
        </View>
      </KeyboardAvoidingView>
    </KeyboardAvoidingView>
  );
};

export default HappinessIndex;

const styles = StyleSheet.create({
  mbtiChildPosition: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    top: 0,
    width: '100%',
    left: 0,
    position: 'absolute',
  },
  dateIconLayout: {
    maxHeight: '100%',
    position: 'absolute',
  },
  parentFlexBox: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateParentFlexBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  youParentSpaceBlock: {
    gap: 16,
    paddingVertical: 24,
    borderRadius: 16,
    alignSelf: 'stretch',
    paddingHorizontal: 16,
  },
  personalityTypo: {
    fontFamily: 'WhyteInktrap-Bold',
    lineHeight: 25,
  },
  sectionHeader: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Poppins-SemiBold',
    paddingHorizontal: 10,
    marginTop: 10,
    marginHorizontal: 10,
    color: '#000',
  },
  frameFlexBox: {
    gap: 8,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  radioLayout2: {
    height: 24,
    width: 24,
  },
  radioLayout1: {
    height: 20,
    width: 20,
  },
  radioLayout: {
    height: 16,
    width: 16,
  },
  radioShadowBox: {
    shadowColor: 'rgba(251, 207, 33, 0.16)',
    shadowOpacity: 1,
    elevation: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  agreeTypo: {
    lineHeight: 21,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  buttonShadowBox: {
    shadowOpacity: 1,
    borderRadius: 8,
  },
  buttonTypo: {
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 21,
    fontSize: 14,
  },
  button2FlexBox: {
    alignItems: 'flex-end',
    position: 'absolute',
  },
  progressPosition: {
    borderRadius: 4,
    height: 8,
    top: 0,
    left: 0,
    position: 'absolute',
  },
  buttonBg: {
    backgroundColor: '#fff',
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  right: {
    height: '29.74%',
    bottom: '36.05%',
    width: 67,
    right: 16,
    top: '34.21%',
    position: 'absolute',
  },
  dateIcon: {
    height: '29.21%',
    bottom: '36.58%',
    width: 28,
    left: 16,
    top: '34.21%',
  },
  personalityTest: {
    lineHeight: 20,
    textAlign: 'right',
    color: '#fff',
    fontSize: 14,
    fontFamily: 'WhyteInktrap-Medium',
    textTransform: 'capitalize',
  },
  personalityTestParent: {
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  youRegularlyMake: {
    lineHeight: 19,
    fontSize: 16,
    textAlign: 'left',
    color: '#fff',
    textTransform: 'capitalize',
    fontFamily: 'WhyteInktrap-Bold',
    lineHeight: 25,
  },
  radioButtonsIcon: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  radioButtons: {
    backgroundColor: '#f7fbe6',
    elevation: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowColor: 'rgba(176, 219, 2, 0.16)',
    shadowOpacity: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  radioButtons1: {
    backgroundColor: '#f7fbe6',
    elevation: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowColor: 'rgba(176, 219, 2, 0.16)',
    shadowOpacity: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  radioButtonsParent: {
    gap: 24,
  },
  radioShadowBox1: {
    shadowColor: 'rgba(103, 110, 118, 0.16)',
    height: 16,
    width: 16,
    shadowOpacity: 1,
    elevation: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  radioButtons3: {
    height: 16,
    width: 16,
  },
  radioButtons4: {
    height: 20,
    width: 20,
  },
  radioButtons5: {
    height: 24,
    width: 24,
  },
  frameParent2: {
    gap: 32,
  },
  agree: {
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
  },
  disagree: {
    textAlign: 'right',
    fontFamily: 'Poppins-Regular',
  },
  agreeParent: {
    alignSelf: 'stretch',
  },
  frameParent1: {
    alignItems: 'center',
  },
  youRegularlyMakeNewFriendsParent: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  radioButtonsRow: {
    flexDirection: 'row',
  },
  radioButton: {
    marginHorizontal: 10,
  },
  button1: {
    color: '#06361f',
    textAlign: 'center',
  },
  stateLayer: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  button: {
    shadowColor: 'rgba(103, 110, 118, 0.08)',
    shadowRadius: 5,
    elevation: 5,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: '30%',
    marginTop: '8%',
  },
  frameGroup: {
    height: '95%',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 0,
  },
  frameItem: {
    top: 16,
    left: 125,
    width: 140,
    zIndex: 1,
    height: 7,
    borderRadius: 25,
  },
  frameParent: {
    top: '23%',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    height: '85%',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
    width: '100%',
    left: 0,
    position: 'absolute',
  },
  button3: {
    color: '#161616',
    textAlign: 'center',
  },
  heroiconsOutlinearrowRight: {
    width: 18,
    height: 18,
    overflow: 'hidden',
  },
  stateLayer1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button2: {
    top: '2%',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRadius: 8,
    right: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  map: {
    fontFamily: 'Whyte Inktrap',
  },
  personalityMap: {
    top: 20,
    fontSize: 20,
    lineHeight: 24,
    color: '#161616',
    textAlign: 'left',
    textTransform: 'capitalize',
    left: 16,
    position: 'absolute',
  },
  progressBar: {
    height: 20,
    width: '90%',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  progressBar1: {
    height: 10,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#B0DB02',
    position: 'absolute',
  },
  tooltip: {
    position: 'absolute',
    top: -30,
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  content: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  text1: {
    color: '#fff',
    fontSize: 12,
  },
  mbti: {
    height: '20%',
    overflow: 'hidden',
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionHeaderContainer: {
    paddingVertical: 10,
    marginHorizontal: 20,
  },
  sectionHeaderText: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  sectionList: {
    flex: 1,
    marginBottom: 10,
  },
  contentContainer: {
    paddingBottom: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  subTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 15,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
});