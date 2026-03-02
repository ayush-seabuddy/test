import { ConfigContext, ExpoConfig } from "expo/config";
import { version } from "./package.json";

/* -----------------------------
   EAS PROJECT SETTINGS
------------------------------ */
const EAS_PROJECT_ID = "130f7684-8e60-49eb-8e4c-746ee8b1ff0b";
const PROJECT_SLUG = "SeaBuddy";
const OWNER = "seabuddyco1";

/* -----------------------------
   BASE APP INFO
------------------------------ */
const APP_NAME = "SeaBuddy";
const BUNDLE_IDENTIFIER = "co.seabuddy.platform";
const PACKAGE_NAME = "co.seabuddy.platform";
const SCHEME = "seabuddy";

/* -----------------------------
   ENV CONFIG
------------------------------ */
export const getDynamicAppConfig = (
	environment: "development" | "preview" | "production",
) => {
	if (environment === "production") {
		return {
			name: APP_NAME,
			bundleIdentifier: BUNDLE_IDENTIFIER,
			packageName: PACKAGE_NAME,
			scheme: SCHEME,
		};
	}

	if (environment === "preview") {
		return {
			name: `${APP_NAME} Preview`,
			bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
			packageName: `${PACKAGE_NAME}.preview`,
			scheme: `${SCHEME}-preview`,
		};
	}

	return {
		name: `${APP_NAME} Dev`,
		bundleIdentifier: `${BUNDLE_IDENTIFIER}.dev`,
		packageName: `${PACKAGE_NAME}.dev`,
		scheme: `${SCHEME}-dev`,
	};
};

/* -----------------------------
   MAIN CONFIG
------------------------------ */
export default ({ config }: ConfigContext): ExpoConfig => {
	const env =
		(process.env.APP_ENV as "development" | "preview" | "production") ??
		"development";

	console.log("⚙️ Building for:", env);

	const isProduction = env === "production";
	const isPreview = env === "preview";

	const dynamic = getDynamicAppConfig(env);

	return {
		...config,

		name: dynamic.name,
		slug: PROJECT_SLUG,
		version,
		owner: OWNER,
		scheme: dynamic.scheme,

		orientation: "portrait",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,

		splash: {
			...config.splash,
			backgroundColor: "#ffffff",
		},

		/* OTA Updates */
		updates: {
			enabled: isProduction || isPreview,
			checkAutomatically: "ON_LOAD",
			fallbackToCacheTimeout: 0,
			url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
		},

		runtimeVersion: {
			policy: "appVersion",
		},

		/* iOS */
		ios: {
			...config.ios,
			bundleIdentifier: dynamic.bundleIdentifier,
			supportsTablet: true,
			infoPlist: {
				...config.ios?.infoPlist,
				NSCameraUsageDescription:
					"SeaBuddy needs access to your camera to upload photos and videos.",
				NSPhotoLibraryUsageDescription:
					"SeaBuddy needs access to your photo library to share photos.",
				NSMicrophoneUsageDescription:
					"SeaBuddy needs access to your microphone to record audio and videos.",
				NSLocationWhenInUseUsageDescription:
					"SeaBuddy uses your location to enhance your experience.",
			},
		},

		/* Android */
		android: {
			...config.android,
			package: dynamic.packageName,
		},

		extra: {
			...config.extra,
			env,
			eas: {
				projectId: EAS_PROJECT_ID,
			},
		},

		web: {
			bundler: "metro",
			output: "static",
			favicon: "./assets/images/favicon.png",
		},

		plugins: [
			"@react-native-community/datetimepicker",
			"expo-asset",
			"expo-router",
			"expo-localization",
			"expo-font",

			[
				"expo-video",
				{
					supportsBackgroundPlayback: true,
					supportsPictureInPicture: true,
				},
			],

			[
				"expo-notifications",
				{
					icon: "./assets/images/icon.png",
					defaultChannel: "default",
					enableBackgroundRemoteNotifications: false,
				},
			],

			[
				"expo-screen-orientation",
				{
					supportedOrientations: ["portrait", "landscape"],
				},
			],

			[
				"expo-build-properties",
				{
					android: {
						minSdkVersion: 26,
						compileSdkVersion: 35,
						targetSdkVersion: 35,
						enableProguardInReleaseBuilds: true,
						enableShrinkResourcesInReleaseBuilds: true,
						enableMinifyInReleaseBuilds: true,
					},
					ios: {
						deploymentTarget: "15.1",
						useFrameworks: "static",
						flipper: false,
					},
				},
			],

			[
				"expo-navigation-bar",
				{
					backgroundColor: "#000000",
					barStyle: "light",
					borderColor: "#1f2937",
					visibility: "visible",
					behavior: "inset-swipe",
					position: "relative",
				},
			],

			[
				"expo-sqlite",
				{
					enableFTS: true,
					useSQLCipher: true,
				},
			],
		],

		experiments: {
			typedRoutes: true,
		},
	};
};
