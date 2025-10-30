// UpcomingEventCard.js
import * as React from "react";
import { Text, StyleSheet, View, ImageBackground, Pressable } from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";

const WeeklyCard = () => {
  return (
    <Pressable style={styles.cardContainer} onPress={() => {}}>
      <View style={styles.cardContent}>
        <ImageBackground
          style={styles.imageBackground}
          resizeMode="cover"
          source={ImagesAssets.cardimg}
        >
          <View style={[styles.pointsWrapper, styles.centerContent]}>
            <Text style={[styles.pointsText, styles.textColor]}>2 Points</Text>
            
          </View>
        </ImageBackground>
        <View style={styles.textContainer}>
         <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
         <Text style={[styles.titleText, styles.textColor]}>Workout Buddies</Text>
         <Text style={{color:"black",fontSize:12}}>24 Nov</Text>
         </View>
          <View style={styles.tagContainer}>
            <View style={[styles.tagWrapper, styles.centerContent]}>
              <Text style={[styles.tagText, styles.textColorWhite]}>Group Act</Text>
            </View>
            <View style={[styles.tagWrapper, styles.centerContent]}>
              <Text style={[styles.tagText, styles.textColorWhite]}>Workout</Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFFCC",
    borderRadius: 35,
    width: "100%",
    alignSelf: "center",
   
    marginVertical: 4,
   
  },
  cardContent: {
    borderRadius: 16,
    overflow: "hidden",
  },
  imageBackground: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 203,
    justifyContent: "flex-end",
    padding: 8,
  },
  pointsWrapper: {
    backgroundColor: "rgba(251, 207, 33, 0.8)",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end", // Aligns to the right
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  pointsText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
  textContainer: {
    paddingHorizontal: 12,
    paddingVertical:15,
    backgroundColor:"tr",
    marginBottom:10
  },
  titleText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 3,
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

export default WeeklyCard;
