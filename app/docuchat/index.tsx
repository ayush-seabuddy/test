import { ENDPOINTS } from "@/src/apis/endpoints";
import CommonLoader from "@/src/components/CommonLoader";
import GlobalHeader from "@/src/components/GlobalHeader";
import { useFeatureFlag } from "@/src/hooks/useFeatureFlag";
import Colors from "@/src/utils/Colors";
import { Logger } from "@/src/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	Bot,
	ChevronDown,
	ChevronUp,
	Lightbulb,
	MessageSquare,
	SendHorizonal,
	Trash2,
} from "lucide-react-native";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
	Alert,
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
	View,
} from "react-native";
import Markdown from "react-native-markdown-display";

const THINKING_MESSAGES = [
	"Thinking",
	"Looking it up",
	"Checking facts",
	"Almost there",
	"Putting it together",
];

const ThinkingIndicator = () => {
	const [msgIndex, setMsgIndex] = useState(0);
	const fadeAnim = useRef(new Animated.Value(1)).current;
	const dot1 = useRef(new Animated.Value(0.3)).current;
	const dot2 = useRef(new Animated.Value(0.3)).current;
	const dot3 = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		const pulse = (dot: Animated.Value, delay: number) =>
			Animated.loop(
				Animated.sequence([
					Animated.delay(delay),
					Animated.timing(dot, {
						toValue: 1,
						duration: 400,
						useNativeDriver: true,
					}),
					Animated.timing(dot, {
						toValue: 0.3,
						duration: 400,
						useNativeDriver: true,
					}),
				]),
			).start();

		pulse(dot1, 0);
		pulse(dot2, 200);
		pulse(dot3, 400);
	}, []);

	useEffect(() => {
		const cycle = setInterval(() => {
			Animated.timing(fadeAnim, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start(() => {
				setMsgIndex((i) => (i + 1) % THINKING_MESSAGES.length);
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
				}).start();
			});
		}, 1800);
		return () => clearInterval(cycle);
	}, []);

	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: 5,
				paddingVertical: 6,
			}}
		>
			<Animated.Text
				style={{
					opacity: fadeAnim,
					color: "#888",
					fontFamily: "Poppins-Regular",
					fontSize: 14,
				}}
			>
				{THINKING_MESSAGES[msgIndex]}
			</Animated.Text>
			{[dot1, dot2, dot3].map((dot, i) => (
				<Animated.View
					key={i}
					style={{
						width: 5,
						height: 5,
						borderRadius: 2.5,
						backgroundColor: Colors.lightGreen,
						opacity: dot,
					}}
				/>
			))}
		</View>
	);
};

const SUGGESTIONS = [
	"What is the company's UKC policy?",
	"What is the bunkering procedure?",
	"What are the steps for enclosed space entry?",
	"What is the permit-to-work process?",
	"What is the garbage management procedure?",
	"What is the emergency steering procedure?",
	"What are the mooring safety controls?",
	"What is the ballast water exchange procedure?",
];

const STORAGE_MESSAGES_KEY = "@docuchat/messages";
const STORAGE_HISTORY_KEY = "@docuchat/history";

const DocuChatScreen = () => {
	const hideDocuchatEmojis = useFeatureFlag("test-feature-flag");
	const [messages, setMessages] = useState<any[]>([]);
	const [question, setQuestion] = useState("");
	const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
	const [suggestionsVisible, setSuggestionsVisible] = useState(true);
	const [showAllSuggestions, setShowAllSuggestions] = useState(false);
	const [chatHistory, setChatHistory] = useState<
		{ role: "user" | "assistant"; content: string }[]
	>([]);
	const flatListRef = useRef<FlatList>(null);

	// Load persisted messages on mount
	useEffect(() => {
		const load = async () => {
			try {
				const [savedMessages, savedHistory] = await Promise.all([
					AsyncStorage.getItem(STORAGE_MESSAGES_KEY),
					AsyncStorage.getItem(STORAGE_HISTORY_KEY),
				]);
				if (savedMessages) setMessages(JSON.parse(savedMessages));
				if (savedHistory) setChatHistory(JSON.parse(savedHistory));
				if (savedMessages && JSON.parse(savedMessages).length > 0) {
					setSuggestionsVisible(false);
				}
			} catch {}
		};
		load();
	}, []);

	// Persist messages whenever they change (but not mid-stream)
	useEffect(() => {
		if (streamingMsgId) return;
		if (messages.length === 0) return;
		AsyncStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages)).catch(() => {});
	}, [messages, streamingMsgId]);

	// Persist chatHistory whenever it changes
	useEffect(() => {
		if (chatHistory.length === 0) return;
		AsyncStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(chatHistory)).catch(
			() => {},
		);
	}, [chatHistory]);

	const clearChat = () => {
		Alert.alert(
			"Clear chat",
			"Are you sure you want to delete the entire conversation?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Clear",
					style: "destructive",
					onPress: () => {
						setMessages([]);
						setChatHistory([]);
						setSuggestionsVisible(true);
						AsyncStorage.multiRemove([STORAGE_MESSAGES_KEY, STORAGE_HISTORY_KEY]).catch(
							() => {},
						);
					},
				},
			],
		);
	};

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

		const text = question;
		const tempId = Date.now().toString();
		const streamMsgId = `ai-${Date.now()}`;

		setMessages((prev) => [
			...prev,
			{
				id: tempId,
				content: text,
				isSender: true,
				createdAt: new Date().toISOString(),
			},
			{
				id: streamMsgId,
				content: "",
				isSender: false,
				createdAt: new Date().toISOString(),
			},
		]);
		setQuestion("");
		setSuggestionsVisible(false);
		scrollToBottom();
		setStreamingMsgId(streamMsgId);

		const authToken = await AsyncStorage.getItem("authToken");

		Logger.info("DocuChat stream:", { url: ENDPOINTS.MARINE_CHAT_STREAM });

		await new Promise<void>((resolve) => {
			const xhr = new XMLHttpRequest();
			xhr.open("POST", ENDPOINTS.MARINE_CHAT_STREAM);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.setRequestHeader("authToken", authToken || "");
			xhr.timeout = 60000;

			let processedLength = 0;
			let fullContent = "";
			let buffer = "";

			const processChunk = (newText: string) => {
				buffer += newText;
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";

				for (const line of lines) {
					if (!line.startsWith("data: ")) continue;
					const data = line.slice(6);
					if (data === "[DONE]") return;

					try {
						const parsed = JSON.parse(data);
						if (parsed.type === "sources") continue;
						if (parsed.type === "error") {
							fullContent = parsed.message || "Something went wrong. Please try again.";
							setMessages((prev) =>
								prev.map((m) =>
									m.id === streamMsgId ? { ...m, content: fullContent } : m,
								),
							);
							continue;
						}
						const token: string =
							parsed.response ?? parsed.choices?.[0]?.delta?.content ?? "";
						if (token) {
							fullContent += token;
							setMessages((prev) =>
								prev.map((m) =>
									m.id === streamMsgId ? { ...m, content: fullContent } : m,
								),
							);
						}
					} catch {}
				}
			};

			xhr.onprogress = () => {
				const newText = xhr.responseText.slice(processedLength);
				processedLength = xhr.responseText.length;
				processChunk(newText);
			};

			xhr.onload = () => {
				if (xhr.status !== 200) {
					Logger.error("DocuChat stream error:", {
						status: String(xhr.status),
					});
					setMessages((prev) =>
						prev.map((m) =>
							m.id === streamMsgId
								? { ...m, content: "Something went wrong. Please try again." }
								: m,
						),
					);
					setStreamingMsgId(null);
					resolve();
					return;
				}

				const remaining = xhr.responseText.slice(processedLength);
				if (remaining) processChunk(remaining);

				if (!fullContent) {
					fullContent = "Something went wrong. Please try again.";
					setMessages((prev) =>
						prev.map((m) => (m.id === streamMsgId ? { ...m, content: fullContent } : m)),
					);
				}

				setChatHistory((prev) => [
					...prev,
					{ role: "user", content: text },
					{ role: "assistant", content: fullContent },
				]);
				setStreamingMsgId(null);
				scrollToBottom();
				resolve();
			};

			xhr.onerror = () => {
				Logger.error("DocuChat stream XHR error", {});
				setMessages((prev) =>
					prev.map((m) =>
						m.id === streamMsgId
							? {
									...m,
									content: "Sorry, something went wrong. Please try again.",
								}
							: m,
					),
				);
				setStreamingMsgId(null);
				scrollToBottom();
				resolve();
			};

			xhr.ontimeout = () => {
				Logger.error("DocuChat stream timeout", {});
				setMessages((prev) =>
					prev.map((m) =>
						m.id === streamMsgId
							? { ...m, content: "Request timed out. Please try again." }
							: m,
					),
				);
				setStreamingMsgId(null);
				scrollToBottom();
				resolve();
			};

			xhr.send(JSON.stringify({ type: "marine", message: text, history: chatHistory }));
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

	const selectSuggestion = (text: string) => {
		setQuestion(text);
		setSuggestionsVisible(false);
	};

	return (
		<View style={styles.main}>
			<View style={styles.headerContainer}>
				<GlobalHeader
					title="SMS Docuchat"
					titleStyle={{ textAlign: "center" }}
					rightIcon={messages.length > 0 ? <Trash2 size={20} color="#888" /> : undefined}
					onRightPress={messages.length > 0 ? clearChat : undefined}
				/>
			</View>

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
					contentContainerStyle={{ paddingHorizontal: 15, flexGrow: 1 }}
					renderItem={({ item }) => (
						<View>
							<View style={styles.dateHeader}>
								<Text style={styles.dateText}>{item.title}</Text>
							</View>
							{item.data.map((msg: any) => (
								<View key={msg.id} style={{ marginVertical: 6 }}>
									{msg.isSender ? (
										<View style={styles.userMessageRow}>
											<View style={styles.userBubble}>
												<Text style={styles.userText}>{msg.content}</Text>
											</View>
											<Text style={styles.userTimestamp}>
												{moment(msg.createdAt).format("hh:mm A")}
											</Text>
										</View>
									) : (
										<View style={styles.aiMessageRow}>
											<View style={styles.aiAvatar}>
												<Bot size={15} color="#fff" />
											</View>
											<View style={styles.aiMessageContent}>
												{msg.content === "" ? (
													<ThinkingIndicator />
												) : (
													<Markdown style={markdownStyles}>
														{msg.id === streamingMsgId ? msg.content + "▌" : msg.content}
													</Markdown>
												)}
												{msg.content !== "" && (
													<Text style={styles.aiTimestamp}>
														{moment(msg.createdAt).format("hh:mm A")}
													</Text>
												)}
											</View>
										</View>
									)}
								</View>
							))}
						</View>
					)}
					ListEmptyComponent={
						suggestionsVisible ? (
							<View style={styles.emptyContainer}>
								{!hideDocuchatEmojis && <Bot size={40} color={Colors.darkGreen} />}
								<Text style={styles.emptyTitle}>SMS Docuchat</Text>
								<Text style={styles.emptySubtitle}>
									Ask me anything about company SMS procedures and policies.
								</Text>
								<View style={styles.suggestionChips}>
									{(showAllSuggestions ? SUGGESTIONS : SUGGESTIONS.slice(0, 4)).map(
										(s, i) => (
											<TouchableOpacity
												key={i}
												style={styles.chip}
												onPress={() => selectSuggestion(s)}
											>
												<MessageSquare size={13} color={Colors.darkGreen} />
												<Text style={styles.chipText}>{s}</Text>
											</TouchableOpacity>
										),
									)}
									<TouchableOpacity
										style={styles.seeMoreBtn}
										onPress={() => setShowAllSuggestions((v) => !v)}
									>
										{showAllSuggestions ? (
											<ChevronUp size={15} color="#888" />
										) : (
											<ChevronDown size={15} color="#888" />
										)}
										<Text style={styles.seeMoreText}>
											{showAllSuggestions ? "Show less" : "See more prompts"}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						) : null
					}
					ListFooterComponent={<View style={{ height: 20 }} />}
				/>

				<Modal
					transparent
					visible={suggestionsVisible && messages.length > 0}
					animationType="fade"
				>
					<TouchableOpacity
						style={styles.modalOverlay}
						activeOpacity={1}
						onPress={() => setSuggestionsVisible(false)}
					>
						<Animated.View style={styles.modalContent}>
							<View style={styles.modalHandle} />
							<Text style={styles.bottomTitle}>Suggested questions</Text>
							<FlatList
								data={SUGGESTIONS}
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
					<View style={[styles.inputBar, { bottom: 30 }]}>
						<TouchableOpacity
							style={styles.iconWrap}
							onPress={() => {
								setSuggestionsVisible(true);
								Keyboard.dismiss();
							}}
						>
							<Lightbulb size={22} color={Colors.lightGreen} />
						</TouchableOpacity>

						<TextInput
							placeholder="Ask about company SMS.."
							placeholderTextColor="#999"
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
								(!question.trim() || !!streamingMsgId) && styles.sendButtonDisabled,
							]}
							onPress={sendMessage}
							disabled={!question.trim() || !!streamingMsgId}
						>
							{streamingMsgId ? (
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
};;

export default DocuChatScreen;

const markdownStyles = {
	body: {
		fontFamily: "Poppins-Regular",
		fontSize: 14,
		color: "#333",
		margin: 0,
		padding: 0,
	},
	heading1: {
		fontFamily: "Poppins-SemiBold",
		fontSize: 17,
		color: "#111",
		marginTop: 6,
		marginBottom: 4,
	},
	heading2: {
		fontFamily: "Poppins-SemiBold",
		fontSize: 15.5,
		color: "#111",
		marginTop: 6,
		marginBottom: 4,
	},
	heading3: {
		fontFamily: "Poppins-Medium",
		fontSize: 14.5,
		color: "#222",
		marginTop: 4,
		marginBottom: 2,
	},
	strong: { fontFamily: "Poppins-SemiBold", color: "#111" },
	em: { fontFamily: "Poppins-Italic", color: "#444" },
	bullet_list: { marginVertical: 4 },
	ordered_list: { marginVertical: 4 },
	list_item: { marginVertical: 2 },
	hr: { backgroundColor: "#ddd", height: 1, marginVertical: 8 },
	code_inline: {
		fontFamily: "monospace",
		fontSize: 13,
		backgroundColor: "#e8e8e8",
		borderRadius: 4,
		paddingHorizontal: 4,
		color: "#c0392b",
	},
	fence: {
		backgroundColor: "#f4f4f4",
		borderRadius: 8,
		padding: 10,
		marginVertical: 6,
		fontFamily: "monospace",
		fontSize: 12,
		color: "#333",
	},
	paragraph: { marginTop: 2, marginBottom: 4 },
};

const styles = StyleSheet.create({
	main: { flex: 1, backgroundColor: "#fff" },
	headerContainer: { backgroundColor: "#fff", zIndex: 10 },
	chatList: { flex: 1 },
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
	userMessageRow: { alignItems: "flex-end" },
	userBubble: {
		alignSelf: "flex-end",
		backgroundColor: "rgba(132, 164, 2, 1)",
		borderRadius: 18,
		borderBottomRightRadius: 4,
		padding: 12,
		maxWidth: "80%",
	},
	userText: { color: "#fff", fontSize: 14, fontFamily: "Poppins-Regular" },
	userTimestamp: {
		fontSize: 11,
		color: "#bbb",
		marginTop: 4,
		textAlign: "right",
		marginRight: 2,
	},
	aiMessageRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 12,
	},
	aiAvatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: Colors.darkGreen,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 2,
		flexShrink: 0,
	},
	aiMessageContent: { flex: 1 },
	aiTimestamp: { fontSize: 11, color: "#bbb", marginTop: 4 },
	emptyContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
		paddingTop: 60,
		gap: 12,
	},
	emptyTitle: {
		fontSize: 20,
		fontFamily: "Poppins-SemiBold",
		color: Colors.darkGreen,
	},
	emptySubtitle: {
		fontSize: 13,
		fontFamily: "Poppins-Regular",
		color: "#888",
		textAlign: "center",
		lineHeight: 20,
	},
	suggestionChips: {
		marginTop: 8,
		gap: 8,
		width: "100%",
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: "#f5f5f5",
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 14,
	},
	chipText: {
		fontSize: 13,
		fontFamily: "Poppins-Regular",
		color: "#333",
		flex: 1,
	},
	seeMoreBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
		paddingVertical: 8,
		marginTop: 2,
	},
	seeMoreText: {
		fontSize: 13,
		fontFamily: "Poppins-Regular",
		color: "#888",
	},
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
});
