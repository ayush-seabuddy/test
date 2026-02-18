import { useFocusEffect } from "expo-router";
import { PlayerError, VideoPlayerStatus, VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import CommonLoader from "./CommonLoader";
import { Logger } from "../utils/logger";

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
  Logger.error("playerError: ", playerError);
  useEffect(() => {
    const subscription = player.addListener('statusChange', ({ status, error }) => {
      setPlayerStatus(status);
      setPlayerError(error);
      Logger.info('Player status changed: ', {Status:String(status)});
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        try {
          player.pause()
        } catch (e) {
          Logger.warn("Mute failed (likely already released):", {Error:String(e)});
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
