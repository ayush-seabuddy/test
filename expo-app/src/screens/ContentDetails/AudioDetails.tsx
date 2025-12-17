import CustomLottie from '@/src/components/CustomLottie';
import Slider from '@react-native-community/slider';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { router } from "expo-router";
import { ChevronLeft, FastForward, Pause, Play, Repeat, Repeat1 } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Content } from './type';

const { width, height } = Dimensions.get('window');

const AudioDetails = ({ data: fullDetails }: { data: Content }) => {
  const audioUrl = fullDetails?.contentUrl?.[0];

  React.useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
    });
  }, []);

  const player = useAudioPlayer(audioUrl ?? '', {
    updateInterval: 500,
    downloadFirst: true,
  });

  const status = useAudioPlayerStatus(player);

  const togglePlayback = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTime = (seconds: number | undefined) => {
    if (!seconds || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const seekBy = (seconds: number) => {
    if (!status.isLoaded || status.currentTime === undefined) return;
    const newTime = Math.max(0, Math.min(status.duration ?? 0, status.currentTime + seconds));
    player.seekTo(newTime);
  };

  if (!audioUrl) {
    return <Text>No audio URL available</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={32} color="#000" strokeWidth={2} />
      </TouchableOpacity>

      <View style={styles.mainContent}>
        <View style={styles.thumbnailContainer}>
          {fullDetails?.thumbnail && (
            <Image
              source={{ uri: fullDetails.thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.controlsContainer}>
          <Text style={styles.title}>{fullDetails?.contentTitle}</Text>

          {/* Loop Toggle */}
          <TouchableOpacity
            onPress={() => (player.loop = !player.loop)}
            disabled={!status.isLoaded}
            style={styles.loopButton}
          >
            {player.loop ? (
              <Repeat1 size={32} color="#fff" strokeWidth={2} />
            ) : (
              <Repeat size={32} color="#fff" strokeWidth={2} />
            )}
          </TouchableOpacity>

          {/* Progress Slider */}
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={status.duration || 1}
            value={status.currentTime}
            onSlidingComplete={(value) => player.seekTo(value)}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#fff"
            disabled={!status.isLoaded || !status.duration}
          />

          {/* Time Labels */}
          <View style={styles.timeLabels}>
            <Text style={styles.timeText}>{formatTime(status.currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(status.duration)}</Text>
          </View>

          {/* Controls Row */}
          <View style={styles.playbackControls}>
            {/* Replay 10 seconds */}
            <TouchableOpacity onPress={() => seekBy(-10)} disabled={!status.isLoaded}>
              <FastForward size={32} color="#fff" strokeWidth={2} style={styles.rewindIcon} />
            </TouchableOpacity>

            {/* Play/Pause Button */}
            <TouchableOpacity
              onPress={togglePlayback}
              disabled={!status.isLoaded}
              style={styles.playPauseButton}
            >
              {!status.isLoaded ? (
                <ActivityIndicator color="#000" size="large" />
              ) : status.playing ? (
                <Pause size={40} color="#000" />
              ) : (
                <Play size={40} color="#000" />
              )}
            </TouchableOpacity>

            {/* Forward 10 seconds */}
            <TouchableOpacity onPress={() => seekBy(10)} disabled={!status.isLoaded}>
              <FastForward size={32} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.background}>
        <CustomLottie isBlurView={false} customSyle={{ height: height * 0.55 }} />
      </View>
    </View>
  );
};

export default AudioDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    marginTop: 20,
    marginLeft: 20,
    backgroundColor: '#ccc',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  mainContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  thumbnailContainer: {
    alignItems: 'center',
  },
  thumbnail: {
    width: 300,
    height: 300,
    marginBottom: 30,
    borderRadius: 150,
  },
  controlsContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: width,
    height: height * 0.4,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  loopButton: {
    marginTop: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  timeText: {
    color: '#fff',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  rewindIcon: {
    transform: [{ rotate: '180deg' }],
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    height: height,
    width: width,
    position: 'absolute',
  },
});