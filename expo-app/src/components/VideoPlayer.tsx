import { PlayerError, VideoPlayerStatus, VideoView, useVideoPlayer } from "expo-video";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface Props {
  uri: string;
}

const VideoPlayer: React.FC<Props> = ({ uri }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.play();
  });
const [playerStatus, setPlayerStatus] = useState<VideoPlayerStatus>('idle');

const [playerError, setPlayerError] = useState<PlayerError|undefined>();
console.log("playerError: ", playerError);
useEffect(() => {
  const subscription = player.addListener('statusChange', ({ status, error }) => {
    setPlayerStatus(status);
    setPlayerError(error);
    console.log('Player status changed: ', status);
  });

  return () => {
    subscription.remove();
  };
}, []);

  return (
    <View style={styles.container}>
      {['loading', 'idle'].includes(playerStatus) && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      <VideoView
        style={styles.video}
        player={player}
        contentFit="contain"
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 250,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loaderContainer: {
    position: "absolute",
    zIndex: 10,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
