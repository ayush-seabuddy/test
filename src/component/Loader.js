import {
  View,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import React, { useEffect } from "react";

const Loader = ({ isLoading }) => {

  useEffect(() => {
  }, [isLoading]);

  if (!isLoading) {
    return (
      <StatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor="transparent"
      />
    );
  }

  return (
    <View style={styles.loaderContainer}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor="rgba(0, 0, 0, 0.5)"
      />
      <View style={styles.loaderOverlay}>
        <ActivityIndicator size="large" color="#06361F" />
      </View>
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000, // Ensure loader appears above other content
    elevation: 1000, // For Android
  },
  loaderOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});