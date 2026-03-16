import Constants from "expo-constants";

type AppExtraEnv = {
	apiUrl?: string;
	socketUrl?: string;
	chatbotUrl?: string;
	posthogKey?: string;
	posthogHost?: string;
	posthogEnabled?: boolean;
	freshchatAppId?: string;
	freshchatAppKey?: string;
	freshchatDomain?: string;
};

type ExpoExtra = {
	appEnv?: AppExtraEnv;
};

const extra = (Constants.expoConfig?.extra ??
	Constants.manifest2?.extra ??
	{}) as ExpoExtra;

const readString = (value?: string) => value?.trim() ?? "";

const getValue = (key: keyof AppExtraEnv, fallback?: string) => {
	const value = extra.appEnv?.[key];
	if (typeof value === "string") return value.trim();
	return readString(fallback);
};

const getRequired = (key: keyof AppExtraEnv, fallback?: string) => {
	const value = getValue(key, fallback);
	if (!value) {
		throw new Error(`[env] Missing required env var: ${String(key)}`);
	}
	return value;
};

const ensureUrl = (key: string, value: string): string => {
	try {
		new URL(value);
		return value;
	} catch {
		throw new Error(`[env] ${key} must be a valid URL. Received: ${value}`);
	}
};

const getBoolean = (key: keyof AppExtraEnv, fallback?: string, defaultValue = false) => {
	const extraValue = extra.appEnv?.[key];
	if (typeof extraValue === "boolean") return extraValue;
	const normalized = readString(fallback).toLowerCase();
	if (normalized === "true") return true;
	if (normalized === "false") return false;
	return defaultValue;
};

export const env = {
	apiUrl: ensureUrl("apiUrl", getRequired("apiUrl", process.env.EXPO_PUBLIC_API_URL)),
	socketUrl: ensureUrl(
		"socketUrl",
		getRequired("socketUrl", process.env.EXPO_PUBLIC_SOCKET_URL),
	),
	chatbotUrl: ensureUrl(
		"chatbotUrl",
		getRequired("chatbotUrl", process.env.EXPO_PUBLIC_CHATBOT_URL),
	),
	posthogKey: getValue("posthogKey", process.env.EXPO_PUBLIC_POSTHOG_KEY),
	posthogHost: getValue("posthogHost", process.env.EXPO_PUBLIC_POSTHOG_HOST),
	posthogEnabled: getBoolean(
		"posthogEnabled",
		process.env.EXPO_PUBLIC_POSTHOG_ENABLED,
		false,
	),
	freshchatAppId: getValue("freshchatAppId", process.env.EXPO_PUBLIC_FRESHCHAT_APP_ID),
	freshchatAppKey: getValue("freshchatAppKey", process.env.EXPO_PUBLIC_FRESHCHAT_APP_KEY),
	freshchatDomain: getValue("freshchatDomain", process.env.EXPO_PUBLIC_FRESHCHAT_DOMAIN),
} as const;

export type AppEnv = typeof env;
