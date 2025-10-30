// UpcomingEventCard.js
import React, { useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Pressable,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";

const MusicCards = ({ navigation, data }) => {
  const RenderData = ({ item }) => {
    return (
      <>
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() => {
            navigation.navigate("MusicPlayer", { dataItem: item });
          }}
        >
          <View style={styles.cardContent}>
            <Image
              style={styles.imageBackground}
              resizeMode="cover"
              source={{ uri: item?.thumbnail }}
            />
            <View style={[styles.textContainer]}>
              <Text
                style={[styles.titleText, styles.textColor]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item?.contentTitle}
              </Text>
              <View
                style={{
                  width: "80%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  {item.hashtags.slice(0, 3).map((_item, index) => (
                    <View
                      key={index}
                      style={{
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                        marginRight: 5,
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
                <View
                  style={{
                    marginTop: -15,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white",
                    padding: 8,
                    borderRadius: 8,
                    height: 28,
                    width: 28,
                  }}
                >
                  <Image
                    style={styles.frameItem}
                    resizeMode="cover"
                    source={ImagesAssets.baseicon2}
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={{ flex: 1, padding: 14 }}>
      {/* <Text
        style={{
          lineHeight: 24,
          fontSize: 20,
          // marginLeft: 10,
          color: "#000",
          fontFamily: "WhyteInktrap-Bold",
          marginBottom: 4,
        }}
      >
        All Music
      </Text> */}
      <FlatList data={data.allContents||data} renderItem={RenderData} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 25,
    width: "100%",
    alignSelf: "center",
    padding: 8,
    marginVertical: 8,
  },
  frameItem: {
    width: 14,
    height: 14,
  },
  cardContent: {
    width: "100%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
    flexDirection: "row",
  },
  imageBackground: {
    marginLeft: 5,
    borderRadius: 16,
    // borderTopLeftRadius: 16,
    // borderTopRightRadius: 16,
    height: 64,
    justifyContent: "flex-end",
    // padding: 10,
    width: 64,
  },
  textContainer: {
    flexDirection: "column",
    width: "100%",
    padding: 12,
    // backgroundColor: "red",
  },
  titleText: {
    width: "65%",
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

export default MusicCards;
