import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Content } from "./type";

const { width } = Dimensions.get("window");

const RelatedVideosCard = ({ data, onArticleClick }: { data: Content[], onArticleClick?: () => void }) => {
  const RenderData = ({ item }: { item: Content }) => {
    return (
      <Pressable
        style={styles.cardContainer}
        onPress={() => {
          if (onArticleClick) {
            onArticleClick();
          }
          router.push({
            pathname: "/contentDetails/[contentId]",
            params: { item: JSON.stringify(item), contentId: item?.id },
          })
        }}
      >
        <View style={styles.cardContent}>
          <ImageBackground
            style={styles.imageBackground}
            resizeMode="cover"
            source={{ uri: item?.thumbnail }}
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.gradientOverlay}
            />

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
        keyExtractor={(item) => item.id.toString()}
        renderItem={RenderData}
        showsHorizontalScrollIndicator={false}
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
