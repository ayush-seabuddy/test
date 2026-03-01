import CommonLoader from "@/src/components/CommonLoader";
import GlobalHeader from "@/src/components/GlobalHeader";
import Colors from "@/src/utils/Colors";
import { Logger } from "@/src/utils/logger";
import socketService from "@/src/utils/socketService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { t } from "i18next";
import LottieView from "lottie-react-native";
import {
  InfoIcon,
  Lightbulb,
  MessageSquare,
  SendHorizonal,
} from "lucide-react-native";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const AIChatbotScreen = () => {
  const { chatbotType, chatbotName } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionSuggestions, setQuestionSuggestions] = useState<string[]>([]);

  const INFO = {
    HEALTH: {
      title: t("healthSuggestion.title"),
      questions: [
        t("healthSuggestion.q1"),
        t("healthSuggestion.q2"),
        t("healthSuggestion.q3"),
        t("healthSuggestion.q4"),
      ],
    },
    SPIRITUAL: {
      title: t("spiritualSuggestion.title"),
      questions: [
        t("spiritualSuggestion.q1"),
        t("spiritualSuggestion.q2"),
        t("spiritualSuggestion.q3"),
        t("spiritualSuggestion.q4"),
      ],
    },
    TECHNICAL: {
      title: t("technicalSuggestion.title"),
      questions: [
        t("technicalSuggestion.q1"),
        t("technicalSuggestion.q2"),
        t("technicalSuggestion.q3"),
      ],
    },
  };
  useEffect(() => {
    if (chatbotType === "HEALTH") {
      setQuestionTitle(INFO.HEALTH.title);
      setQuestionSuggestions(INFO.HEALTH.questions);
    } else if (chatbotType === "SPIRITUAL") {
      setQuestionTitle(INFO.SPIRITUAL.title);
      setQuestionSuggestions(INFO.SPIRITUAL.questions);
    } else {
      setQuestionTitle(INFO.TECHNICAL.title);
      setQuestionSuggestions(INFO.TECHNICAL.questions);
    }
    if (messages.length === 0) {
      setSuggestionsVisible(true);
    }
  }, [chatbotType, messages.length]);

  const loadChatHistory = async () => {
    try {
      const userDetails = await AsyncStorage.getItem("userDetails");
      const user = JSON.parse(userDetails || "{}");
      const userId = user.id;

      if (!socketService || !userId) return;

      const payload = {
        userId,
        chatType: chatbotType || "GENERAL",
        page: 1,
        limit: 100,
      };

      socketService.emit("initiateJolliAIChat", payload);

      socketService.on("jolliAIChatHistory", (data: any) => {
        const sortedMessages = (
          data.userWithMessages?.jolliAiChatMessages || []
        )
          .map((msg: any) => ({
            ...msg,
            isSender: !msg.isAIMessage,
            createdAt: new Date(msg.createdAt),
          }))
          .sort(
            (a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime(),
          );

        setMessages(sortedMessages);
        setIsLoadingHistory(false);
        scrollToBottom();
      });

      socketService.on("receiveJolliAIMessage", (data: any) => {
        const aiMessage = {
          ...data.aiResponse,
          isSender: false,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
        scrollToBottom();
      });
    } catch (error) {
      Logger.error("Error loading chat history:", { Error: String(error) });
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadChatHistory();

    return () => {
      socketService.removeAllListeners("jolliAIChatHistory");
      socketService.removeAllListeners("receiveJolliAIMessage");
    };
  }, [chatbotType]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const sendMessage = async () => {
    if (!question.trim()) return;

    const userDetails = await AsyncStorage.getItem("userDetails");
    const user = JSON.parse(userDetails || "{}");
    const userId = user.id;

    const tempId = Date.now().toString();

    const userMessage = {
      id: tempId,
      content: question,
      isSender: true,
      createdAt: new Date().toISOString(),
      tempId,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsTyping(true);
    scrollToBottom();

    socketService.emit("sendJolliAIMessage", {
      userId,
      content: question,
      chatType: chatbotType || "GENERAL",
    });
  };
  const groupMessagesByDate = (msgs: any[]) => {
    const grouped: any = {};
    msgs.forEach((msg) => {
      const dateKey = moment(msg.createdAt).format("YYYY-MM-DD");
      const today = moment().format("YYYY-MM-DD");
      const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");

      let label = "";
      if (dateKey === today) label = "Today";
      else if (dateKey === yesterday) label = "Yesterday";
      else label = moment(msg.createdAt).format("MMMM DD, YYYY");

      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(msg);
    });

    return Object.keys(grouped).map((key) => ({
      title: key,
      data: grouped[key],
    }));
  };

  const chatSections = groupMessagesByDate(messages);

  const toggleSuggestions = () => {
    if (suggestionsVisible) {
      setSuggestionsVisible(false);
    } else {
      setSuggestionsVisible(true);
      Keyboard.dismiss();
    }
  };

  const selectSuggestion = (text: string) => {
    setQuestion(text);
    setSuggestionsVisible(false);
  };

  const getDisclaimerContent = () => {
    if (chatbotName === "Marine") return t("marinebuddy_disclaimer");
    if (chatbotName === "Health") return t("healthbuddy_disclaimer");
    return t("spiritualbuddy_disclaimer");
  };

  return (
    <View style={styles.main}>
      <View style={styles.headerContainer}>
        <GlobalHeader
          title={`${chatbotName} Buddy`}
          titleStyle={{ textAlign: "center" }}
          rightIcon={
            <TouchableOpacity onPress={() => setShowDisclaimer(true)}>
              <InfoIcon size={20} />
            </TouchableOpacity>
          }
        />
      </View>

      <Modal
        transparent
        visible={showDisclaimer}
        animationType="fade"
        onRequestClose={() => setShowDisclaimer(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDisclaimer(false)}>
          <View style={styles.disclaimerOverlay}>
            <View style={styles.disclaimerContainer}>
              <Text style={styles.disclaimerText}>
                {getDisclaimerContent()}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <FlatList
          ref={flatListRef}
          data={chatSections}
          keyExtractor={(item) => item.title}
          style={styles.chatList}
          contentContainerStyle={{
            paddingHorizontal: 15,
            flexGrow: 1,
          }}
          renderItem={({ item }) => (
            <View>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{item.title}</Text>
              </View>
              {item.data.map((msg: any) => (
                <View key={msg.id || msg.tempId} style={{ marginVertical: 4 }}>
                  <View
                    style={[
                      styles.messageBubble,
                      msg.isSender ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        msg.isSender ? styles.userText : styles.aiText,
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.timestamp,
                      msg.isSender ? styles.userTimestamp : styles.aiTimestamp,
                    ]}
                  >
                    {moment(msg.createdAt).format("hh:mm A")}
                  </Text>
                </View>
              ))}
            </View>
          )}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingContainer}>
                <LottieView
                  source={require("@/assets/typing-dots.json")}
                  autoPlay
                  loop
                  style={{ width: 60, height: 30 }}
                />
                <Text style={styles.typingText}>{t("jollieistyping")}</Text>
              </View>
            ) : (
              <View style={{ height: 20 }} />
            )
          }
        />

        <Modal transparent visible={suggestionsVisible} animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSuggestionsVisible(false)}
          >
            <Animated.View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.bottomTitle}>{questionTitle}</Text>

              <FlatList
                data={questionSuggestions}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionBox}
                    onPress={() => selectSuggestion(item)}
                  >
                    <MessageSquare size={18} color={Colors.lightGreen} />
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </Animated.View>
          </TouchableOpacity>
        </Modal>

        <View style={{ height: 80 }}>
          <View
            style={[styles.inputBar, { bottom: keyboardHeight > 0 ? 45 : 30 }]}
          >
            <TouchableOpacity
              style={styles.iconWrap}
              onPress={toggleSuggestions}
            >
              <Lightbulb size={22} color={Colors.lightGreen} />
            </TouchableOpacity>

            <TextInput
              placeholder={questionSuggestions[0]}
              value={question}
              onChangeText={setQuestion}
              multiline
              style={styles.inputField}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                !question.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!question.trim()}
            >
              {isTyping ? (
                <CommonLoader color="#fff" />
              ) : (
                <SendHorizonal size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AIChatbotScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  main: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    backgroundColor: "#fff",
    zIndex: 10,
  },
  chatList: {
    flex: 1,
  },
  dateHeader: { alignItems: "center", marginVertical: 10 },
  dateText: {
    fontSize: 12,
    color: "#888",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginVertical: 2,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(132, 164, 2, 1)",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 14, fontFamily: "Poppins-Regular" },
  userText: { color: "#fff" },
  aiText: { color: "#333" },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
    marginHorizontal: 10,
  },
  userTimestamp: { textAlign: "right" },
  aiTimestamp: { textAlign: "left" },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
    marginVertical: 10,
  },
  typingText: { marginLeft: 10, color: "#888", fontSize: 13 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 15,
    right: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 45,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    paddingHorizontal: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: { backgroundColor: "#ccc" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 15,
  },
  bottomTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#333",
    marginBottom: 15,
  },
  suggestionBox: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  suggestionText: {
    fontSize: 14.5,
    color: "#222",
    fontFamily: "Poppins-Regular",
  },

  disclaimerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  disclaimerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    margin: 24,
    width: "100%",
    maxWidth: 400,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 20,
    color: "#444",
    fontFamily: "Poppins-Regular",
  },
});
