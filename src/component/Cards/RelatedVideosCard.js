import React from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Pressable,
  FlatList,
  Dimensions,
  Image,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

const RelatedVideosCard = ({ navigation, data, onArticleClick }) => {
  const RenderData = ({ item }) => {
    return (
      <Pressable
        style={styles.cardContainer}
        onPress={() => {
          if (onArticleClick) {
            onArticleClick();
          }
          navigation.navigate("VideosDetails", { dataItem: item });
        }}
      >
        <View style={styles.cardContent}>
          <ImageBackground
            style={styles.imageBackground}
            resizeMode="cover"
            source={
              item?.thumbnail
                ? { uri: item?.thumbnail }
                : ImagesAssets.health_card_image
            }
          >
            {/* Bottom gradient overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.gradientOverlay}
            />

            {/* Semi-transparent text background */}
            <View style={styles.textContainer}>
              <Text
                style={[styles.titleText, styles.textColorWhite]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item?.contentTitle?.slice(0, 25)}
              </Text>
            </View>
          </ImageBackground>
        </View>
      </Pressable>
    );
  };

  return (
    <View>
      <FlatList
        horizontal
        data={data}
        renderItem={RenderData}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              style={{ height: 80, width: 80 }}
              source={require("../../assets/images/AnotherImage/no-content.png")}
            />
            <Text style={styles.emptyText}>No Related Videos Found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 5,
    marginRight: 10,
    marginVertical: 8,
  },
  cardContent: {
    borderRadius: 5,
    overflow: "hidden",
  },
  imageBackground: {
    height: width * 0.45 * (9 / 16),
    width: width * 0.45,
    justifyContent: "flex-end",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  textContainer: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  titleText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
  textColorWhite: {
    color: "#fff",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    width,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#000",
    marginTop: 10,
  },
});

export default RelatedVideosCard;
