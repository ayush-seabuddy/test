import React from "react";
import {
  Dimensions,
  StyleSheet,
  Image,
  FlatList,
  View,
  ScrollView,
} from "react-native";
import HomeWorkoutCard from "../Cards/HomeWorkoutCard";
import HomeHangoutcard from "./postComponent";

const { width, height } = Dimensions.get("screen");

const Post = () => {
  return (
    <>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          // contentContainerStyle={styles.scrollViewContent}
        >
          <HomeHangoutcard />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white'
  },
  // scrollViewContent: {
  //   paddingBottom: 70, // Add padding to the bottom to ensure the last card is not cut off
  // },
  cardContainer: {
    marginTop: 20,
  },
});

export default Post;
