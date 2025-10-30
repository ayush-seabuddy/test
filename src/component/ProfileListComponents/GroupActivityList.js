// UpcomingEventCard.js
import * as React from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Pressable,
  Dimensions,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FastImage from "react-native-fast-image";


const { width } = Dimensions.get("window");
const GroupActivityList = ({ navigation, activity, twoItem }) => {

  return (
    <Pressable
      style={styles.cardContainer}
      onPress={() => {
        navigation.push("WorkoutBuddies", {
          activity: { id: activity.id },
        });
      }}
    >
      <View style={styles.cardContent}>
        <FastImage
          style={[styles.imageBackground, { width: "100%" }]}
          resizeMode="cover"
          // source={ImagesAssets.health_card_image}
          source={
            activity?.imageUrls && activity?.imageUrls?.length > 0
              ? { uri: activity?.imageUrls[0] }
              : ImagesAssets.health_card_image
          }
        />

        <View style={styles.textContainer}>
                <Text
                  style={[styles.titleText, styles.textColor]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {activity?.groupActivityCategory?.categoryName || ""}
                </Text>
                <View style={styles.tagContainer}>
                    {/* <View
                      style={[styles.tagWrapper, styles.centerContent]}
                    >
                      <Text style={[styles.tagText, styles.textColorWhite]}>
                        {activity?.groupActivityCategory?.categoryName||""}
                      </Text>
                    </View> */}
                  {/* ))} */}
                  {/* <View style={[styles.tagWrapper, styles.centerContent]}>
                    <Text style={[styles.tagText, styles.textColorWhite]}>Articals</Text>
                  </View>
                  <View style={[styles.tagWrapper, styles.centerContent]}>
                    <Text style={[styles.tagText, styles.textColorWhite]}>Food</Text>
                  </View> */}
                </View>
              </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    // backgroundColor: "red",
    borderRadius: 15,
    width: width * 0.45,
    alignSelf: "center",
    padding: 8,
    marginVertical: 8,
  },
  cardContent: {
    borderRadius: 5,
    // borderTopRightRadius: 25,
    overflow: "hidden",
  },
  imageBackground: {
    borderRadius: 5,
    height: 95,
    justifyContent: "flex-end",
    padding: 8,
    width: 170,
  },
  textContainer: {
    paddingVertical: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  titleText: {
    fontSize: 12,
    color: "#161616",
    fontFamily: "Poppins-SemiBold",
    width: "auto"
  },
  tagContainer: {
    flexDirection: "row",
    gap: 4,
    width: "100%",

  },
  tagWrapper: {
    backgroundColor: "#e8e8e8",
    borderRadius: 16,
    paddingHorizontal: 5,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",

  },
  textColor: {

  },
  textColorWhite: {
    color: "#383838",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GroupActivityList;
