// UpcomingEventCard.js
import * as React from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Pressable,
  FlatList,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import GroupActivity from "../../ProfileListComponents/GroupActivity";
import GroupActivityList from "../../ProfileListComponents/GroupActivityList";

const ActivityCard = ({ navigation, data }) => {

  const RenderData = ({ item , index}) => {
    return (
         <View
      // style={styles.cardWrapper}
      style={[
        styles.horizontalCardWrapper,
      ]}
    >
      <GroupActivityList navigation={navigation} activity={item} twoItem={true}/>
    </View>
    );
  };
  return (
    <View style={{ flex: 1, padding: 14 ,}}>
      <FlatList
        data={data || data}
        renderItem={RenderData}
        // horizontal contentContainerStyle={styles.flatListContentContainer}
        columnWrapperStyle={styles.columnWrapper}
        numColumns={2}
        showsHorizontalScrollIndicator={false}
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
    padding: 3,
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
  pointsWrapper: {
    backgroundColor: "rgba(251, 207, 33, 0.8)",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end", // Aligns to the right
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  pointsText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
  textContainer: {
    paddingVertical: 12,
    backgroundColor: "tr",
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

export default ActivityCard;
