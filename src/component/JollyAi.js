import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  Animated,
  Easing
} from "react-native";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import socketService from "../Socket/Socket";
import ProfleSettingHeader from "./headers/ProfileHeader/ProfleSettingHeader";
import Ionicons from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import JolliHeader from "./headers/ProfileHeader/JolliHeader";
import { Modal } from "react-native-paper";
import { getApiLevel } from "../Api";

const JollyAi = ({ route, navigation }) => {
  const { chatType } = route.params;
  const { name } = route.params;
  const [ChatRoomData, setChatRoomData] = useState([]);
  const [isDataLodaing, setIsDataLoding] = useState(true);
  const [ChatText, setChatText] = useState("");
  // const [inputHeight, setInputHeight] = useState(50);
  const inputHeight = useRef(40)
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const [androidPadding, setAndroidPadding] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef(null); // Ref for TextInput to control focus
  const apiLevel = getApiLevel()

  const suggestionCategories = {
    general: {
      title: "General Questions",
      questions: [
        "What can you do?",
        "How does this work?",
        "What are your features?",
        "Tell me about yourself"
      ]
    },
    HEALTH: {
      title: "Your 24/7 wellness check-in! Let's talk about your health-mind, body or mood",
      questions: [
        "I need motivation today",
        "How can I sleep better?",
        "What's healthy habit to try?",
        "Give me tips to reduce stress"
      ]
    },
    SPIRITUAL: {
      title: "Presonal guidance for your peace guided by faith. Tap a prompt below or share whatever's on your mind.",
      questions: [
        "Share a teaching for today",
        "What does my faith say about stress?",
        "Give me strength today",
        "Let's reflect together"
      ]
    },
    TECHNICAL: {
      title: "Got a question about technical or marine rules onboard? I'll get you answers from SOLAS, MARPOL, and other maritime codes - fast and clear.",
      questions: [
        "Explain this MARPOL rule",
        "Clarify this checklist item",
        "I'm unsure about a procedure"
      ]
    },
  };

  const containerStylePhotoModal = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const currentSuggestions = suggestionCategories[chatType] || suggestionCategories.general;

  const toggleSuggestions = () => {
    if (showSuggestions) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true
      }).start(() => setShowSuggestions(false));
    } else {
      setShowSuggestions(true);
      Keyboard.dismiss(); // Dismiss keyboard when opening suggestions
      if (textInputRef.current) {
        textInputRef.current.blur(); // Remove focus from TextInput
      }
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true
      }).start();
    }
  };

  useEffect(() => {
    if (!isDataLodaing && ChatRoomData.length === 0) toggleSuggestions();
  }, [isDataLodaing]);

  const selectQuestion = (question) => {
    setChatText(question);
    toggleSuggestions();
    // Auto-focus on the input after selection
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardPadding(70);
      setAndroidPadding(30)
      setShowSuggestions(false); // Hide suggestions when keyboard appears
    });

    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardPadding(0);
      setAndroidPadding(0)
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const AiChat = async () => {
    try {
      const userDetails = await AsyncStorage.getItem("userDetails");
      const userID = JSON.parse(userDetails);
      const userId = userID.id;

      const payload = { userId, chatType, page: 1, limit: 100 };

      if (!socketService) {
        return;
      }

      socketService.emit("initiateJolliAIChat", payload);

      socketService.on("jolliAIChatHistory", (data) => {
        const sortedMessages = data.userWithMessages.jolliAiChatMessages
          .map((msg) => ({ ...msg, isSender: !msg.isAIMessage }))
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setChatRoomData(sortedMessages);
        setIsDataLoding(false);
        scrollToBottom();
      });
    } catch (error) {
      console.log("Error fetching chat history", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      AiChat();
      socketService.initilizeSocket();
    }, [])
  );

  useEffect(() => {
    socketService.initilizeSocket();
    AiChat();

    socketService.on("receiveJolliAIMessage", (data) => {

      const receivedAIMessage = { ...data.aiResponse, isSender: false };

      setChatRoomData((prevChats) => [...prevChats, receivedAIMessage]);
      setIsDataLoding(false);
      setLoading(false);

      scrollToBottom();
    });

    return () => {
      socketService.removeListener("receiveJolliAIMessage");
      socketService.removeListener("jolliAIChatHistory");
    };
  }, []);

  const HandelPress = async () => {
    if (!ChatText.trim()) return;

    const userDetails = await AsyncStorage.getItem("userDetails");
    const userID = JSON.parse(userDetails);
    const userId = userID.id;
    const tempId = new Date().getTime().toString();

    const payload = { userId, content: ChatText, chatType };


    if (!socketService) {
      return;
    }

    const newMessage = {
      id: tempId,
      userId,
      content: ChatText,
      chatType,
      createdAt: new Date().toISOString(),
      isSender: true,
      tempId,
    };

    setChatRoomData((prevChats) => [...prevChats, newMessage]);
    setIsDataLoding(false);
    setLoading(true);

    scrollToBottom();

    socketService.emit("sendJolliAIMessage", payload);

    setChatText("");
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [ChatRoomData]);

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const msgDate = moment(msg.createdAt).format("YYYY-MM-DD");
      const today = moment().format("YYYY-MM-DD");
      const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");

      let sectionTitle;
      if (msgDate === today) {
        sectionTitle = "Today";
      } else if (msgDate === yesterday) {
        sectionTitle = "Yesterday";
      } else {
        sectionTitle = moment(msg.createdAt).format("MMMM DD, YYYY");
      }

      if (!grouped[sectionTitle]) {
        grouped[sectionTitle] = [];
      }
      grouped[sectionTitle].push(msg);
    });

    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data,
    }));
  };

  const chatSections = groupMessagesByDate(ChatRoomData);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <JolliHeader navigation={navigation} title={`${name}`} />

      <FlatList
        ref={flatListRef}
        data={chatSections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>{item.title}</Text>
            </View>
            {item.data.map((msg, index) => (
              <View key={index}>
                <View
                  style={[
                    styles.messageContainer,
                    msg.isSender
                      ? styles.senderMessage
                      : styles.receiverMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.isSender
                        ? styles.senderMessagemessageText
                        : styles.receiverMessagemessageText,
                    ]}
                  >
                    {msg.content}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.timestamp,
                    msg.isSender
                      ? styles.senderMessagetimestamp
                      : styles.receiverMessagetimestamp,
                  ]}
                >
                  {moment(msg.createdAt).format("hh:mm A")}
                </Text>
              </View>
            ))}
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={styles.loaderContainer}>
              <LottieView
                source={require("../assets/Chatloader.json")}
                autoPlay
                loop
                resizeMode="cover"
                style={{ height: 40, width: 40 }}
              />
              <Text style={styles.loaderText}>Jollie is typing...</Text>
            </View>
          ) : (
            <View style={{ height: 10 }} />
          )
        }
      />

      <Modal
        visible={showSuggestions && !ChatText}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleSuggestions}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          bottom: 0,
          position: 'absolute',
          paddingBottom: 60,
          left: 0,
          right: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <Animated.View style={[styles.modalOverlay]}>
          <Pressable style={styles.modalOverlayPressable} onPress={toggleSuggestions} />
        </Animated.View>

        <Animated.View style={[styles.suggestionsContainer, {
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [300, 0]
            })
          }],
          opacity: fadeAnim
        }]}>
          <TouchableOpacity
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
            onPress={toggleSuggestions}
          >
            <View>
              <Ionicons name="close" size={24} color="#666" />
            </View>
          </TouchableOpacity>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>{currentSuggestions.title}</Text>
          </View>

          <ScrollView>
            {currentSuggestions.questions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => selectQuestion(question)}
              >
                <Ionicons
                  name="chatbox-outline"
                  size={18}
                  color="rgba(132, 164, 2, 1)"
                  style={styles.suggestionIcon}
                />
                <Text style={styles.suggestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : getApiLevel() > 34 ? "padding" : "height"}
        style={Platform.OS === "ios" ? {} : {}}
        keyboardVerticalOffset={Platform.OS == 'ios' ? 60 : apiLevel > '34' ? androidPadding : 0}
      >
        <View style={styles.inputContainer}>
          {!ChatText && (
            <TouchableOpacity
              onPress={toggleSuggestions}
              style={styles.suggestionButton}
            >
              <Ionicons
                name="bulb-outline"
                size={24}
                color="rgba(132, 164, 2, 1)"
              />
            </TouchableOpacity>
          )}

          <TextInput
            ref={textInputRef}
            style={[
              styles.input, {
                maxHeight: 150
              }
              // {
              //   height: Math.min(inputHeight.current||40, 120), // 40 default → max ~5 lines (~120px)
              // },
            ]}
            placeholder={currentSuggestions.questions[0]}
            value={ChatText}
            onChangeText={setChatText}
            placeholderTextColor="#c1c1c1"
            multiline={true}
            onContentSizeChange={(e) =>
              // setInputHeight(Math.max(e.nativeEvent.contentSize.height, 40))
              inputHeight.current = Math.max(e.nativeEvent.contentSize.height, 40)
            }
            scrollEnabled={true} // Scroll when > 5 lines
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            onPress={HandelPress}
            style={[
              styles.sendButton,
              !ChatText && { backgroundColor: "#ccc" }
            ]}
            disabled={!ChatText}
          >
            <Ionicons
              name="send-outline"
              size={20}
              color={ChatText ? "#fff" : "#888"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default JollyAi;

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 5,
  },
  sectionHeader: {
    fontSize: 12,
    backgroundColor: "#EAEAEA",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    fontWeight: "bold",
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  messageContainer: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    fontFamily: "Poppins-Regular",
  },
  senderMessage: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(132, 164, 2, 1)",
    marginRight: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 30,
  },
  receiverMessage: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(230, 230, 230, 0.5)",
    marginLeft: 10,
    borderBottomLeftRadius: 0,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
  },
  messageText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Poppins-Regular",
  },
  senderMessagemessageText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Poppins-Regular",
  },
  receiverMessagemessageText: {
    fontSize: 14,
    color: "rgba(19, 19, 19, 1)",
    fontFamily: "Poppins-Regular",
  },
  timestamp: {
    fontSize: 12,
    color: "rgba(19, 19, 19, 0.25)",
    marginTop: 5,
  },
  senderMessagetimestamp: {
    alignSelf: "flex-end",
    paddingHorizontal: 10,
  },
  receiverMessagetimestamp: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
  },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    marginLeft: 10,
  },
  loaderText: {
    marginLeft: 10,
    fontSize: 12,
    color: "gray",
    fontFamily: "Poppins-Regular",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    gap: 15,
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: "rgba(132, 164, 2, 1)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    height: 40,
    width: 40,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  microphoneIcon: {
    width: 22,
    height: 22,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  modalOverlayPressable: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  suggestionsContainer: {
    // position: 'absolute',
    // bottom: 20,
    // left: 0,
    // right: 0,
    // backgroundColor: '#fff',
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // padding: 20,
    // maxHeight: '60%',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  suggestionButton: {
    left: 10,
    zIndex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 13,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: '#f8f8f8',
    fontFamily: 'Poppins-Regular',
    textAlignVertical: 'top', // important for multiline
  },
});