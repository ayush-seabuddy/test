// service.js - Place this file in your project root directory
import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
  // This service needs to be registered for the module to work
  // but we don't need to export anything
  
  // Listen to events from the notification bar
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });
  
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });
  
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });
  
  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });
  
  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });
  
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });
  
  // Handle jumps forward and backward from notification/lock screen
  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
    const position = await TrackPlayer.getPosition();
    const jumpInterval = event.interval || 10;
    TrackPlayer.seekTo(position + jumpInterval);
  });
  
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
    const position = await TrackPlayer.getPosition();
    const jumpInterval = event.interval || 10;
    TrackPlayer.seekTo(Math.max(0, position - jumpInterval));
  });
  
  // Handle event when track playback has completed
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (event) => {
  });

  // Handle playback state changes
  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
  });
};