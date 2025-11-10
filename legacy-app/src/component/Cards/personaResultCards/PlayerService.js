// playerService.js - Create this file to handle global player initialization
import TrackPlayer from 'react-native-track-player';
import { Capability } from 'react-native-track-player';

// Flag to track if player has been initialized
let isPlayerInitialized = false;

export const setupGlobalPlayer = async () => {
  if (isPlayerInitialized) {
    return true;
  }

  try {
    
    // Reset player if it was partially initialized
    try {
      await TrackPlayer.reset();
    } catch (resetErr) {
      console.log("[PlayerService] Player not ready for reset yet");
    }
    
    // Setup player with optimal settings
    await TrackPlayer.setupPlayer({
      minBuffer: 15,
      maxBuffer: 50,
      backBuffer: 30,
      waitForBuffer: true
    });
    
    // Configure player options
    await TrackPlayer.updateOptions({
      stopWithApp: false,
      
      android: {
        appKilledPlaybackBehavior: 'StopPlaybackAndRemoveNotification',
      },
      
      ios: {
        backgroundMode: true,
      },
      
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
        Capability.Skip,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.JumpForward,
        Capability.JumpBackward,
      ],
      
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      
      progressUpdateEventInterval: 1,
      jumpInterval: 10,
      
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.JumpForward,
        Capability.JumpBackward,
      ],
    });
    
    isPlayerInitialized = true;
    return true;
  } catch (error) {
    console.error("[PlayerService] Failed to initialize player:", error);
    isPlayerInitialized = false;
    return false;
  }
};

export const resetPlayer = async () => {
  try {
    await TrackPlayer.reset();
  } catch (error) {
    console.error("[PlayerService] Error resetting player:", error);
  }
};

export const isSetup = () => {
  return isPlayerInitialized;
};