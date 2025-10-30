import * as React from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Pressable,
  FlatList,
  Dimensions,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";

const { width } = Dimensions.get("window");

// Constants for layout
const CARD_MARGIN = 8;
const GAP_BETWEEN_CARDS = 10;
const PADDING_HORIZONTAL = 14;
const CARD_WIDTH = (width - 2 * PADDING_HORIZONTAL - GAP_BETWEEN_CARDS) / 2;

const ArticleCard = ({ navigation, data }) => {
  const handleCardPress = (item) => {
    switch (item.contentType) {
      case "VIDEO":
        navigation.navigate("VideosDetails", { dataItem: item });
        break;
      case "ARTICLE":
        navigation.navigate("ArticlesDetails", { dataItem: item });
        break;
      case "MUSIC":
        navigation.navigate("MusicPlayer", { dataItem: item });
        break;
      default:
        navigation.navigate("AnouncementDetails", { item });
    }
  };

  const RenderData = ({ item }) => {
    const thumbnailUri = item?.thumbnail || ImagesAssets.health_card_image;
    return (
      <Pressable
        style={[styles.cardContainer, { width: CARD_WIDTH }]}
        onPress={() => handleCardPress(item)}
      >
        <ImageBackground
          style={styles.imageBackground}
          resizeMode="cover"
          source={{ uri: thumbnailUri }}
          imageStyle={styles.cardImage}
        >
          {/* Overlay for better text visibility */}
          <View style={styles.overlay} />

          {/* Title */}
          <View style={styles.textWrapper}>
            <Text
              style={styles.titleText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.contentTitle?.slice(0, 23) || ""}
            </Text>
          </View>
        </ImageBackground>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data.allContents || data}
        renderItem={RenderData}
        keyExtractor={(item, index) => item?.id || index.toString()}
        columnWrapperStyle={styles.columnWrapper}
        numColumns={2}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: PADDING_HORIZONTAL,
  },
  flatListContentContainer: {
    paddingVertical: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: CARD_MARGIN,
    gap: GAP_BETWEEN_CARDS,
  },
  cardContainer: {
    backgroundColor: "#000", // fallback color
    borderRadius: 5,
    overflow: "hidden",
  },
  imageBackground: {
    height: 120,
    justifyContent: "flex-end",
  },
  cardImage: {
    borderRadius: 5,
  },

  textWrapper: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  titleText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
});

export default ArticleCard;
