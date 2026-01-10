import { useFocusEffect } from "expo-router";
import { PlayerError, VideoPlayerStatus, VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import CommonLoader from "./CommonLoader";

interface Props {
  uri: string;
}

const VideoPlayer: React.FC<Props> = ({ uri }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.play();
  });
  const [playerStatus, setPlayerStatus] = useState<VideoPlayerStatus>('idle');

  const [playerError, setPlayerError] = useState<PlayerError | undefined>();
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

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          player.pause()  // This usually works even if native object is detaching
        } catch (e) {
          console.warn("Mute failed (likely already released):", e);
        }
      };
    }, [player])
  );



  return (
    <View style={styles.container}>
      {['loading', 'idle'].includes(playerStatus) && (
        <View style={styles.loaderContainer}>
          <CommonLoader fullScreen color="#fff" />
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
