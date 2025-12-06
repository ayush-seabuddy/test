import { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

type VideoPlayerProps = {
  videoSource: string;
};

export default function VideoPlayer({ videoSource }: VideoPlayerProps) {
  const { height: windowHeight } = useWindowDimensions();

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    if (videoSource) {
      player.play();
    }
  }, [videoSource, player]);

  const statusBarHeight = StatusBar.currentHeight ?? 0;
  const safeHeight =
    Platform.OS === 'ios'
      ? windowHeight
      : windowHeight - statusBarHeight;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <VideoView
        player={player}
        style={[styles.video, { height: safeHeight }]}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: SCREEN_WIDTH,
  },
});