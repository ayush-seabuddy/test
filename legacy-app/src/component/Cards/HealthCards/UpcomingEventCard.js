// UpcomingEventCard.js
import * as React from "react";
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
import { ImagesAssets } from "../../../assets/ImagesAssets";
import AntDesign from "react-native-vector-icons/AntDesign";

const { height, width } = Dimensions.get("window");

const UpcomingEventCard = ({ navigation, data, fetchUserList }) => {
  const [Data, setData] = React.useState(data);
  const [currentPage, setCurrentPage] = React.useState(1);

  const handleCardPress = (item) => {
    if (item.contentType === "VIDEO") {
      navigation.navigate("VideosDetails", { dataItem: item });
    } else if (item.contentType === "ARTICLE") {
      navigation.navigate("ArticlesDetails", { dataItem: item });
    } else if (item.contentType === "MUSIC") {
      navigation.navigate("MusicPlayer", { dataItem: item });
    } else {
      navigation.navigate("AnouncementDetails", { item });
    }
  };

  const RenderData = ({ item }) => {
    return (
      <Pressable
        style={styles.cardContainer}
        onPress={() => handleCardPress(item)}
      >
        <View style={styles.cardContent}>
          <ImageBackground
            style={styles.imageBackground}
            resizeMode="cover"
            source={{
              uri: item?.thumbnail
                ? item?.thumbnail
                : ImagesAssets.health_card_image,
            }}
          >
            {/* Title overlay at bottom */}
            <View style={styles.textContainer}>
              <Text
                style={[styles.titleText, styles.textColorWhite]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item?.contentTitle.slice(0, 25)}
              </Text>
            </View>

            {/* Gradient overlay */}
            <View style={styles.gradientOverlay} />
          </ImageBackground>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <FlatList
        data={data.allContents || data}
        renderItem={RenderData}
        horizontal
        showsHorizontalScrollIndicator={false}
        onEndReached={() => {
          // You can add pagination logic here if needed
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 30,
              width: width,
            }}
          >
            <Image
              style={{ height: 80, width: 80 }}
              source={require("../../../assets/images/AnotherImage/no-content.png")}
            />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins-Regular",
                color: "#000",
                marginTop: 10,
              }}
            >
              No Article Found
            </Text>
          </View>
        }
      />
    </>
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
    height: width * 0.5 * (9 / 16), // Same aspect ratio as UnifiedContentCard
    width: width * 0.5,
    justifyContent: "flex-end",
  },
  textContainer: {
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
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
    // backgroundColor: "rgba(0, 0, 0, 0.3)", // Subtle fade
  },
  textColorWhite: {
    color: "#fff",
  },
});

export default UpcomingEventCard;
