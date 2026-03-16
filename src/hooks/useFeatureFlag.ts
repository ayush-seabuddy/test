import { usePostHog } from "posthog-react-native";
import { useEffect, useState } from "react";

/**
 * Hook to check if a feature flag is enabled
 * @param flagKey - The feature flag key from PostHog
 * @param defaultValue - Default value if flag is not set (defaults to false)
 * @returns boolean indicating if the feature is enabled
 *
 * @example
 * const isNewChatEnabled = useFeatureFlag('new-chat-ui');
 * if (!isNewChatEnabled) return null;
 * return <NewChatUI />;
 */
export const useFeatureFlag = (
	flagKey: string,
	defaultValue: boolean = false,
): boolean => {
	const posthog = usePostHog();
	const [isEnabled, setIsEnabled] = useState<boolean>(defaultValue);

	useEffect(() => {
		if (!posthog) {
			setIsEnabled(defaultValue);
			return;
		}

		// Check the feature flag value (async)
		const checkFlag = async () => {
			try {
				const enabled = await posthog.isFeatureEnabled(flagKey);
				setIsEnabled(enabled ?? defaultValue);
			} catch (error) {
				console.error(`Error checking feature flag "${flagKey}":`, error);
				setIsEnabled(defaultValue);
			}
		};

		checkFlag();

		// Listen for feature flag changes from PostHog
		const unsubscribe = posthog.onFeatureFlags(() => {
			checkFlag();
		});

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [posthog, flagKey, defaultValue]);

	return isEnabled;
};

/**
 * Hook to get feature flag payload (for multivariate/string flags)
 * Useful for A/B tests or configuration values
 *
 * @param flagKey - The feature flag key from PostHog
 * @returns The flag payload value or undefined
 *
 * @example
 * const chatVersion = useFeatureFlagPayload('chat-version');
 * // chatVersion might be 'v1', 'v2', or { theme: 'dark', layout: 'compact' }
 */
export const useFeatureFlagPayload = (
	flagKey: string,
): string | number | boolean | object | null | undefined => {
	const posthog = usePostHog();
	const [payload, setPayload] = useState<
		string | number | boolean | object | null | undefined
	>(undefined);

	useEffect(() => {
		if (!posthog) {
			return;
		}

		const checkPayload = async () => {
			try {
				const flagPayload = await posthog.getFeatureFlagPayload(flagKey);
				setPayload(flagPayload ?? undefined);
			} catch (error) {
				console.error(`Error getting feature flag payload "${flagKey}":`, error);
				setPayload(undefined);
			}
		};

		checkPayload();

		const unsubscribe = posthog.onFeatureFlags(() => {
			checkPayload();
		});

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [posthog, flagKey]);

	return payload;
};
