import { NotificationProvider, useNotification } from "@/Context/NotificationContext";
import { requestAllPermissions } from "@/Permission/Permissions";
import ErrorBoundary from "@/src/components/ErrorBoundary";
import { showToast } from "@/src/components/GlobalToast";
import OTAUpdatePopup from "@/src/components/OTAUpdatePopup";
import { env } from "@/src/config/env";
import { initI18n } from "@/src/localization/i18n";
import { store } from "@/src/redux/store";
import Colors from "@/src/utils/Colors";
import { clearCrashCount } from "@/src/utils/crashRecovery";
import { Logger } from "@/src/utils/logger";
import socketService from "@/src/utils/socketService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as TaskManager from "expo-task-manager";
import i18n from "i18next";
import { PostHogProvider } from "posthog-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import {
	Appearance,
	Linking,
	Platform,
	StatusBar,
	StyleSheet,
	useColorScheme,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

const POSTHOG_API_KEY = env.posthogKey;
const POSTHOG_HOST = env.posthogHost;
const POSTHOG_ENABLED = env.posthogEnabled;

Appearance.setColorScheme("light");

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowList: true,
	}),
});

const BACKGROUND_NOTIFICATION_TASK = "background-notification-task";

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
	if (error) {
		Logger.error("Background notification error:", { Error: String(error) });
		return;
	}
	Logger.info("Background notification received:", { data: String(data) });
});

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {});

const NotificationHandler = () => {
	const { expoPushToken } = useNotification();
	const { t } = useTranslation();
	const lastHandledId = useRef<string | null>(null);

	useEffect(() => {
		if (expoPushToken) {
			Logger.info("🔔 Expo Push Token", {
				expoPushToken: expoPushToken,
			});
			AsyncStorage.setItem("ExpoPushToken", expoPushToken).catch(console.error);
		}
	}, [expoPushToken]);

	const handleNotificationTap = useCallback(
		async (response: Notifications.NotificationResponse) => {
			const notificationId = response.notification.request.identifier;
			if (lastHandledId.current === notificationId) return;
			lastHandledId.current = notificationId;

			const data = response.notification.request.content.data;
			if (!data?.page) return;

			const { id, page, type, androidUrl, iosUrl } = data;

			try {
				if (page === "UPDATE" && type === "UPDATE") {
					const url = Platform.OS === "ios" ? iosUrl : androidUrl;
					if (url && typeof url === "string") await Linking.openURL(url);
					return;
				}

				const navigate = router.canGoBack()
					? router.push.bind(router)
					: router.replace.bind(router);

				switch (page) {
					case "CHAT":
						if (id && typeof id === "string") {
							navigate({
								pathname: "/chatroom/[chatRoomId]",
								params: { chatRoomId: id },
							});
						}
						break;

					case "GROUP_ACTIVITY":
						if (id && typeof id === "string") {
							navigate({
								pathname: "/buddyupeventdescription",
								params: { eventId: id },
							});
						}
						break;

					case "CONTENT":
						if (id && typeof id === "string") {
							navigate({
								pathname: "/contentDetails/[contentId]",
								params: { contentId: id },
							});
						}
						break;

					case "HANGOUT":
						if (id && typeof id === "string") {
							navigate({ pathname: "/singlepost", params: { postId: id } });
						}
						break;

					case "HAPPINESS":
						navigate("/monthlyhappinessindex");
						break;

					case "POMS":
						navigate("/monthlywellbeingpulse");
						break;
				}
			} catch (err) {
				Logger.error("Navigation error:", { Error: String(err) });
				showToast.error("oops", t("somethingwentwrong"));
			}
		},
		[t],
	);

	useEffect(() => {
		const subscription =
			Notifications.addNotificationResponseReceivedListener(handleNotificationTap);
		Notifications.getLastNotificationResponseAsync().then((response) => {
			if (response) handleNotificationTap(response);
		});
		return () => subscription.remove();
	}, [handleNotificationTap]);

	return null;
};

export default function RootLayout() {
	const visibility = NavigationBar.useVisibility();
	const colorScheme = useColorScheme();
	const { t } = useTranslation();
	const [appReady, setAppReady] = useState(false);
	const [localizationReady, setLocalizationReady] = useState(false);

	const [fontsLoaded] = useFonts({
		"Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
		"Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
		"Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
		"Whyte-Inktrap-Regular": require("../assets/fonts/Whyte-Inktrap-Regular.otf"),
		"WhyteInktrap-Bold": require("../assets/fonts/WhyteInktrap-Bold.ttf"),
		"WhyteInktrap-Heavy": require("../assets/fonts/WhyteInktrap-Heavy.ttf"),
		"WhyteInktrap-Medium": require("../assets/fonts/WhyteInktrap-Medium.ttf"),
	});

	useEffect(() => {
		if (!localizationReady) return;

		const requestPermissions = async () => {
			try {
				await requestAllPermissions(t);
			} catch (err) {
				Logger.error("Permission request error:", { Error: String(err) });
			}
		};

		requestPermissions();
	}, [localizationReady, t]);

	useEffect(() => {
		if (Platform.OS !== "android") return;

		(async () => {
			try {
				await NavigationBar.setBackgroundColorAsync("#00000000");
				await NavigationBar.setButtonStyleAsync("light");
				await NavigationBar.setVisibilityAsync("visible");
			} catch (e) {
				Logger.warn("[NavigationBar] setup failed", { Error: String(e) });
			}
		})();
	}, [visibility]);

	useEffect(() => {
		if (!fontsLoaded) return;

		const initApp = async () => {
			try {
				await initI18n();
				setLocalizationReady(true);
				socketService.initializeSocket();
				await clearCrashCount();
				setAppReady(true);
			} catch (e) {
				Logger.warn("Init error:", { Error: String(e) });
			} finally {
				await SplashScreen.hideAsync();
			}
		};

		initApp();
	}, [fontsLoaded]);

	if (!fontsLoaded) return null;

	return (
		<ErrorBoundary>
			<NotificationProvider>
				<PostHogProvider
					apiKey={POSTHOG_API_KEY}
					options={{
						host: POSTHOG_HOST,
						enableSessionReplay: POSTHOG_ENABLED,
					}}
					autocapture={POSTHOG_ENABLED}
				>
					<NotificationHandler />
					<Provider store={store}>
						<SafeAreaProvider>
							<SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
								<StatusBar
									barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
									backgroundColor="#000"
								/>
								<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
									<PaperProvider>
										<I18nextProvider i18n={i18n}>
											<GestureHandlerRootView style={{ flex: 1 }}>
												<OTAUpdatePopup>
													<Stack screenOptions={{ headerShown: false }}>
														<Stack.Screen name="(bottomtab)" />
													</Stack>
													<Toast />
												</OTAUpdatePopup>
											</GestureHandlerRootView>
										</I18nextProvider>
									</PaperProvider>
								</ThemeProvider>
							</SafeAreaView>
						</SafeAreaProvider>
					</Provider>
				</PostHogProvider>
			</NotificationProvider>
		</ErrorBoundary>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white ?? "#fff",
	},
});
