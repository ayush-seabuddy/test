import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { Platform } from 'react-native';
import { Logger } from "@/src/utils/logger";

const CRASH_KEY = 'app_crash_count';
const MAX_CRASHES = 3;

export async function safeReload() {
    try {
        const count = Number((await AsyncStorage.getItem(CRASH_KEY)) || 0);

        if (count >= MAX_CRASHES) {
            await AsyncStorage.removeItem(CRASH_KEY);
            return;
        }

        await AsyncStorage.setItem(CRASH_KEY, String(count + 1));

        setTimeout(async () => {
            if (Platform.OS === 'web') {
                window.location.reload();
            } else {
                await Updates.reloadAsync();
            }
        }, 1200);
    } catch (e) {
        Logger.error('safeReload failed', {Error:String(e)});
    }
}

export async function clearCrashCount() {
    await AsyncStorage.removeItem(CRASH_KEY);
}
