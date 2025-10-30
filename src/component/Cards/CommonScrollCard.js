import React from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";

const { height, width } = Dimensions.get("window");

const UnifiedContentCard = ({ navigation, data, keyId, headerName }) => {
  const getContentTypeConfig = (contentType) => {
    switch (contentType) {
      case "ARTICLE":
        return {
          navigationScreen: "ArticlesDetails",
          emptyMessage: "No Article Found",
          imageComponent: FastImage,
          imageStyle: styles.imageBackground,
          cardStyle: styles.cardContainer,
          cardContentStyle: styles.cardContent,
          textContainerStyle: styles.textContainer,
          showPlayIcon: false,
        };
      case "VIDEO":
        return {
          navigationScreen: "VideosDetails",
          emptyMessage: "No Video Found",
          imageComponent: FastImage,
          imageStyle: styles.imageBackground,
          cardStyle: styles.cardContainer,
          cardContentStyle: styles.cardContent,
          textContainerStyle: styles.textContainer,
          showPlayIcon: false,
        };
      case "MUSIC":
        return {
          navigationScreen: "MusicPlayer",
          emptyMessage: "No Audio Found",
          imageComponent: FastImage,
          imageStyle: styles.imageBackground,
          cardStyle: styles.cardContainer,
          cardContentStyle: styles.cardContent,
          textContainerStyle: styles.textContainer,
          showPlayIcon: false,
        };
      default:
        return null;
    }
  };

  const RenderData = ({ item }) => {
    // Check if the item is the "View All" placeholder
    if (item.isViewAll) {
      return (
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={() =>
            navigation.navigate("ShowAllContent", {
              data: data.allContents || data,
              headerName: headerName,
              contentSubCategory:
                displayData?.length > 0
                  ? displayData?.contentSubCategory
                  : "",
            })
          }
        >
          <FastImage
            style={{ width: 20, height: 20 }}
            resizeMode={FastImage.resizeMode.cover}
            source={ImagesAssets.seeMore}
            defaultSource={ImagesAssets.health_card_image} // Fallback image while loading
          />
        </TouchableOpacity>
      );
    }

    const config = getContentTypeConfig(item.contentType);
    if (!config) return null;

    // Video-specific filtering logic
    if (item.contentType === "VIDEO") {
      if (keyId === "Home" && item.contentCategory !== "VIDEO") return null;
      if (keyId !== "Home" && item.contentCategory === "TRAINING") return null;
    }

    const ImageComponent = config.imageComponent;

    return (
      <TouchableOpacity
        style={config.cardStyle}
        onPress={() =>
          navigation.navigate(config.navigationScreen, { dataItem: item })
        }
      >
        <View style={config.cardContentStyle}>
          <ImageComponent
            style={config.imageStyle}
            resizeMode={FastImage.resizeMode.cover}
            source={{
              uri: item?.thumbnail || ImagesAssets.health_card_image,
              priority: FastImage.priority.normal,
            }}
            defaultSource={ImagesAssets.health_card_image} // Fallback image while loading
          >
            {/* Title at the top */}
            <View style={styles.textContainer}>
              <Text
                style={[styles.titleText, styles.textColorWhite]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item?.contentTitle.slice(0, 25)}
              </Text>
            </View>
            {/* Bottom gradient shadow */}
            <LinearGradient
              colors={["transparent", "rgba(255, 255, 255, 0.5)"]}
              style={styles.gradientOverlay}
            />
          </ImageComponent>
        </View>
      </TouchableOpacity>
    );
  };

  const contentType =
    data.contentType || (data.allContents && data.allContents[0]?.contentType);
  const config = getContentTypeConfig(contentType);

  if (!config) {
    return (
      <View style={styles.emptyContainer}>
        <FastImage
          style={{ height: 80, width: 80 }}
          resizeMode={FastImage.resizeMode.contain}
          source={require("../../assets/images/AnotherImage/no-content.png")}
          defaultSource={ImagesAssets.health_card_image} // Fallback image while loading
        />
        <Text style={styles.emptyText}>No Data Found</Text>
      </View>
    );
  }

  const [displayData, setDisplayData] = React.useState(
    data.allContents || data
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={displayData}
        renderItem={RenderData}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FastImage
              style={{ height: 80, width: 80 }}
              resizeMode={FastImage.resizeMode.contain}
              source={require("../../assets/images/AnotherImage/no-content.png")}
              defaultSource={ImagesAssets.health_card_image} // Fallback image while loading
            />
            <Text style={styles.emptyText}>{config.emptyMessage}</Text>
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
    height: width * 0.5 * (9 / 16),
    width: width * 0.5,
    justifyContent: "space-between",
  },
  textContainer: {
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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

export default UnifiedContentCard;