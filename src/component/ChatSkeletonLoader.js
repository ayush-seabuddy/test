import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const ChatSkeletonLoader = () => {
  return (
    <View style={styles.container}>
      {/* Simulate multiple chat bubbles */}
      {[1, 2, 3, 4,5,6,7,8].map((_, index) => (
        <View
          key={index}
          style={[
            styles.messageBubble,
            index % 2 === 0 ? styles.leftBubble : styles.rightBubble,
          ]}
        >
          <LinearGradient
            colors={['#e0e0e0', '#f0f0f0', '#e0e0e0']}
            style={styles.gradient}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    width: width * 0.6,
    height: 50,
    borderRadius: 15,
    marginVertical: 5,
    overflow: 'hidden',
  },
  leftBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  rightBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  gradient: {
    flex: 1,
  },
});

export default ChatSkeletonLoader;