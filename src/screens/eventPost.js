import React from "react";
import { View, FlatList, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Video from "react-native-video";

const { width } = Dimensions.get("screen");

const MediaFlatList = ({ mediaUrls = [] }) => {
  const isVideo = (url) => /\.(mp4|mov|avi)$/i.test(url);

  const renderItem = ({ item }) => (
    <TouchableOpacity>
      <View style={styles.mediaContainer}>
        {isVideo(item) ? (
          <Video
            source={{ uri: item }}
            style={styles.media}
            resizeMode="contain"
            muted
            repeat
          />
        ) : (
          <Image
            source={{ uri: item }}
            style={styles.media}
            resizeMode="cover"
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={mediaUrls}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  mediaContainer: {
    width,
    height: 300,
    backgroundColor: "#000",
  },
  media: {
    width: "100%",
    height: "100%",
  },
});

export default MediaFlatList;
