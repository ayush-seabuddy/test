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
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Video, { VideoRef } from "react-native-video";
import { Badge } from "react-native-paper";

const VedioCards = ({ navigation, data }) => {
  console.log(data);

  const RenderData = ({ item }) => {
    console.log(item, "kjfghdfghfghdfghk");
    return (
      <>
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => {
            navigation.navigate("VideosDetails", { dataItem: item });
          }}
        >
          <View style={styles.cardContent}>
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

              <View style={styles.tagContainer}>
                {item.hashtags.slice(0, 2).map((_item, index) => (
                  <View
                    key={index}
                    style={{
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                    }}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        styles.textColorWhite,
                        {
                          backgroundColor: "#b7b7b7",
                          paddingHorizontal: 10,
                          borderRadius: 10,
                        },
                      ]}
                    >
                      {_item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={{ flex: 1, padding: 14 }}>
      <Text
        style={{
          lineHeight: 24,
          fontSize: 20,
          // marginLeft: 10,
          color: "#000",
          fontFamily: "WhyteInktrap-Bold",
          marginBottom: 4,
        }}
      >
        All Video
      </Text>
      <FlatList
        data={data.allContents}
        numColumns={2}
        renderItem={RenderData}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContentContainer}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flatListContentContainer: {
    // paddingHorizontal: 10, // Add horizontal padding to the list
  },
  columnWrapper: {
    justifyContent: "space-between", // Add space between columns
    // marginBottom: 10, // Optionally add vertical space between rows
  },
  cardContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 25,
    // width: "100%",
    alignSelf: "center",
    padding: 8,
    marginVertical: 8,
    marginRight: 10,
  },
  cardContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },
  imageBackground: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 80,
    justifyContent: "flex-end",
    padding: 8,
    width: 170,
  },
  textContainer: {
    paddingVertical: 12,
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

export default VedioCards;
