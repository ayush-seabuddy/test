import {Text, TextInput, AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import { setupGlobalPlayer } from './src/component/Cards/personaResultCards/PlayerService.js'; 
import TrackPlayer from 'react-native-track-player';


import messaging from "@react-native-firebase/messaging";
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
async function registerAppWithFCM() {
  await messaging().registerDeviceForRemoteMessages();
}

registerAppWithFCM();

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  // console.log("Message handled in the background", remoteMessage);
});
setupGlobalPlayer().catch(err => {
  console.error('[App] Failed to initialize track player:', err);
});

TrackPlayer.registerPlaybackService(() => require('./src/component/Cards/personaResultCards/AudioService.js'));

messaging().onMessage(async (remoteMessage) => {
  // console.log("Foreground FCM message:", remoteMessage);
});
AppRegistry.registerComponent(appName, () => App);
