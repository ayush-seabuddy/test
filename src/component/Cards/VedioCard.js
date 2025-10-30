import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";

const { height, width } = Dimensions.get("window");

const VedioCard = ({ navigation, data, keyId, type }) => {
  const [Data, setData] = useState(data || []);

  const RenderData = ({ item }) => {
    const shouldRender =
      (keyId === "Home" && item.contentCategory === type) ||
      (keyId !== "Home" && item.contentCategory !== "TRAINING");

    if (!shouldRender) return null;

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => navigation.navigate("VideosDetails", { dataItem: item })}
      >
        <View style={styles.cardContent}>
          <ImageBackground
            style={styles.imageBackground}
            resizeMode="cover"
            source={{
              uri: item?.thumbnail || ImagesAssets.health_card_image,
            }}
          >
            <View style={styles.textContainer}>
              <Text
                style={[styles.titleText, styles.textColorWhite]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item?.contentTitle?.slice(0, 25) || "Untitled"}
              </Text>
            </View>
            <View style={styles.gradientOverlay} />
          </ImageBackground>

          {keyId !== "Home" && item.hashtags?.length > 0 && (
            <View style={styles.tagContainer}>
              {item.hashtags.slice(0, 2).map((_item, index) => (
                <View
                  key={`hashtag-${item.id}-${index}`} // Unique key for hashtags
                  style={{
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#b7b7b7",
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 1,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={[styles.tagText, styles.textColorWhite]}>
                      {_item.length > 9 ? `${_item.slice(0, 9)}...` : _item}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={Data}
        renderItem={RenderData}
        keyExtractor={(item) => item.id.toString()} // Ensure unique keys
        horizontal
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 10,
              width: width,
            }}
          >
            <Image
              style={{ height: 80, width: 80 }}
              source={require("../../assets/images/AnotherImage/no-content.png")}
            />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins-Regular",
                color: "#000",
                marginTop: 10,
              }}
            >
              No Video Found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 5,
    alignSelf: "center",
    marginRight: 10,
  },
  cardContent: {
    borderRadius: 5,
    overflow: "hidden",
  },
  imageBackground: {
    height: width * 0.5 * (9 / 16), // Maintain 16:9 aspect ratio
    width: width * 0.5,
    justifyContent: "flex-end",
  },
  textContainer: {
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
  },
  titleText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  tagContainer: {
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
  textColorWhite: {
    color: "#fff",
  },
});

export default VedioCard;