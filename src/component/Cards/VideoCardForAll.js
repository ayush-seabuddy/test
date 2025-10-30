// UpcomingEventCard.js
import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Pressable,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Video, { VideoRef } from "react-native-video";
import { Badge } from "react-native-paper";


const { height, width } = Dimensions.get("window");
const VideoCardForAll = ({ navigation, data, fetchUserList }) => {

  const RenderData = ({ item }) => {
    return (
      <>
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => {
            navigation.navigate("VideosDetails", { dataItem: item });
          }}
        >
          <ImageBackground
            style={styles.imageBackground}
            resizeMode="cover"
            source={{ uri: item.thumbnail }}
          >
            {/* Removed pointsWrapper code */}
          </ImageBackground>
          <View style={[styles.textContainer]}>
            <Text
              style={[styles.titleText, styles.textColor]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.contentTitle.slice(0, 25)}
            </Text>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={{ flex: 1, padding: 14 }}>

      <FlatList
        data={data}
        numColumns={2}
        renderItem={RenderData}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={fetchUserList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  columnWrapper: {
    justifyContent: "space-between",
  },
  cardContainer: {
    borderRadius: 5,
    width: width * 0.45,
    alignSelf: "center",
    overflow: 'hidden',
    marginVertical: 5,
  },
  imageBackground: {
    borderRadius: 10,
    height: 80,
    justifyContent: "flex-end",
    borderRadius: 10,
  },
  textContainer: {
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)"
  },
  titleText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
  tagContainer: {
    flexDirection: "row",
    gap: 4,
  },
  tagWrapper: {
    backgroundColor: "#b7b7b7",
    borderRadius: 16,
    paddingHorizontal: 5,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
  textColor: {
    color: "#161616",
  },
  textColorWhite: {
    color: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VideoCardForAll;