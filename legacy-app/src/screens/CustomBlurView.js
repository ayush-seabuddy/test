import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface } from "react-native-paper";

const CustomBlurView = ({ style }) => {
  return (
    <Surface style={[styles.blurContainer, style]} elevation={4}>
      <View style={styles.overlay} />
    </Surface>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Adjust for transparency
    borderRadius: 10, // Optional for a soft look
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // More opacity for blur effect
  },
});

export default CustomBlurView;
