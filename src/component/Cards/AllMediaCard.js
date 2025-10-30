import React from "react";
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
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

const AllMediaCard = ({ navigation, data, fetchUserList }) => {
  const getContentTypeConfig = (contentType) => {
    switch (contentType) {
      case "ARTICLE":
        return {
          navigationScreen: "ArticlesDetails",
          imageStyle: styles.imageBackground,
        };
      case "VIDEO":
        return {
          navigationScreen: "VideosDetails",
          imageStyle: styles.imageBackground,
        };
      case "MUSIC":
        return {
          navigationScreen: "MusicPlayer",
          imageStyle: styles.imageBackground,
        };
      default:
        return {
          navigationScreen: null,
          imageStyle: styles.imageBackground,
        };
    }
  };

  const RenderData = ({ item }) => {
    const config = getContentTypeConfig(item.contentType);
    if (!config.navigationScreen) return null;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.cardContainer}
        onPress={() =>
          navigation.navigate(config.navigationScreen, { dataItem: item })
        }
      >
        <View style={styles.cardContent}>
          <ImageBackground
            style={config.imageStyle}
            resizeMode="cover"
            source={{ uri: item.thumbnail || ImagesAssets.health_card_image }}
          >
            {/* Bottom gradient overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.gradientOverlay}
            />

            {/* Text container with semi-transparent background */}
            <View style={styles.textContainer}>
              <Text
                style={[styles.titleText, styles.textColorWhite]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item?.contentTitle.slice(0, 25)}
              </Text>
            </View>
          </ImageBackground>
        </View>
      </TouchableOpacity>
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
        contentContainerStyle={styles.flatListContentContainer}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={fetchUserList}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              style={{ height: 80, width: 80 }}
              source={require("../../assets/images/AnotherImage/no-content.png")}
            />
            <Text style={styles.emptyText}>No Content Found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flatListContentContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  cardContainer: {
    borderRadius: 5,
    alignSelf: "center",
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
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent strip like UnifiedContentCard
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

export default AllMediaCard;
