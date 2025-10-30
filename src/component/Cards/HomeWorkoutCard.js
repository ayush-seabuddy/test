import * as React from "react";
import { ScrollView, Image, StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ImagesAssets } from "../../assets/ImagesAssets";
const { width } = Dimensions.get('window'); // Get the screen width
const HomeWorkoutCard = ({ item }) => {
  console.log(item, "tests")
  return (
    <View>
      <View style={styles.content}>
        <ScrollView
          horizontal
          contentContainerStyle={styles.scrollViewContent}
          showsHorizontalScrollIndicator={false}
        >
          <Image style={styles.frameLayout} resizeMode="cover" source={ImagesAssets.main_img} />
          <Image style={styles.frameLayout} resizeMode="cover" source={ImagesAssets.main_img} />
          <Image style={styles.frameLayout} resizeMode="cover" source={ImagesAssets.main_img} />
          <Image style={styles.frameLayout} resizeMode="cover" source={ImagesAssets.main_img} />
          <Image style={styles.frameLayout} resizeMode="cover" source={ImagesAssets.main_img} />
        </ScrollView>
        <LinearGradient
          style={[styles.frameParent, styles.textPosition]}
          locations={[0, 1]}
          colors={['rgba(27, 27, 27, 0)', '#000']}
          useAngle={true}
          angle={144}

        >
          <View style={[styles.frameGroup, styles.frameFlexBox]}>
            <View style={styles.frameContainer}>
              <View style={styles.workoutDay1Parent}>
                <Text style={[styles.workoutDay1, styles.textFlexBox]}>Workout Day 1</Text>
                <View style={[styles.frameView, styles.ellipseGroupFlexBox]}>
                  <View style={[styles.groupActWrapper, styles.ellipseGroupFlexBox]}>
                    <Text style={[styles.groupAct, styles.groupActTypo]}>Group Act</Text>
                  </View>
                  <View style={[styles.groupActWrapper, styles.ellipseGroupFlexBox]}>
                    <Text style={[styles.groupAct, styles.groupActTypo]}>Workout</Text>
                  </View>
                  <Text style={[styles.hoursAgo, styles.groupActTypo]}>2 hours ago</Text>
                </View>
              </View>
              <View style={styles.ellipseGroupFlexBox}>
                <Image style={styles.frameChildLayout} resizeMode="cover" source={ImagesAssets.ellipsimage} />
                <Image style={[styles.frameChild2, styles.frameChildLayout]} resizeMode="cover" source={ImagesAssets.ellipsimage} />
                <Image style={[styles.frameChild2, styles.frameChildLayout]} resizeMode="cover" source={ImagesAssets.ellipsimage} />
                <View style={[styles.ellipseGroup, styles.ellipseGroupFlexBox]}>
                  <Image style={[styles.frameChild4, styles.frameChildLayout]} resizeMode="cover" source={ImagesAssets.ellipsimage} />
                  <Text style={[styles.text, styles.textTypo]}>+5</Text>
                </View>
              </View>
            </View>
            {/* <TouchableOpacity style={styles.akarIconsdotGridWrapper}>

            <Image style={styles.akarIconsdotGrid} resizeMode="cover" source={ImagesAssets.dots} />
	
          </TouchableOpacity> */}
          </View>
          <View style={styles.frameParent1}>
            <View style={[styles.frameParent2, styles.frameFlexBox]}>
              <View style={[styles.iconLikeParent, styles.ellipseGroupFlexBox]}>
                <TouchableOpacity>
                  <Image style={styles.iconLike} resizeMode="cover" source={ImagesAssets.likeicon} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image style={styles.iconLike} resizeMode="cover" source={ImagesAssets.comenticon} />
                </TouchableOpacity>
              </View>
              <View style={[styles.rectangleGroup, styles.ellipseGroupFlexBox]}>
                <View style={[styles.rectangleView, styles.frameChild5Layout]} />
                <View style={[styles.frameChild5, styles.frameChild5Layout]} />
                <View style={[styles.frameChild5, styles.frameChild5Layout]} />
                <View style={[styles.frameChild5, styles.frameChild5Layout]} />
              </View>
            </View>
            <View style={[styles.deaAmaliaParent, styles.ellipseGroupFlexBox]}>
              <Text style={[styles.deaAmalia, styles.deaAmaliaTypo]}>John Mayer</Text>
              <Text style={[styles.briefingWithRoomies, styles.deaAmaliaTypo]}>Buuurnn!!!</Text>
            </View>
            <Text style={[styles.viewAllComments, styles.textFlexBox]}>View all comments</Text>
            <View style={[styles.deaAmaliaParent, styles.ellipseGroupFlexBox]}>
              <Text style={[styles.deaAmalia, styles.deaAmaliaTypo]}>Kaisar Matari</Text>
              <Text style={[styles.briefingWithRoomies, styles.deaAmaliaTypo]}>Beast!</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Your existing styles remain unchanged
  ellipseGroupFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  textPosition: {
    zIndex: 1,
    position: "absolute",
  },
  frameFlexBox: {
    flexDirection: "row",
    // alignSelf: "stretch",
    justifyContent: "space-between",
  },
  textFlexBox: {
    textAlign: "left",
    lineHeight: 14,
  },
  groupActTypo: {
    lineHeight: 10,
    fontSize: 8,
    fontFamily: "Poppins-Regular",
    textAlign: "left",
  },
  frameChildLayout: {
    height: 32,
    width: 32,
  },
  textTypo: {
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  frameChild5Layout: {
    height: 6,
    width: 6,
    borderRadius: 50,
  },
  deaAmaliaTypo: {
    lineHeight: 18,
    textAlign: "left",
    color: "#fff",
    fontSize: 12,
  },
  frameLayout: {
    width: 378,
    height: 358,
  },
  rectangleParent: {
    zIndex: 0,
    borderRadius: 16,
    left: 0,
    top: 0,
    position: "absolute",
    alignItems: "center",
    width: "100%",
  },
  workoutDay1: {
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#fff",
    fontSize: 12,
    lineHeight: 14,
  },
  groupAct: {
    color: "#06361f",
    fontFamily: "Poppins-Regular",
  },
  groupActWrapper: {
    borderRadius: 32,
    backgroundColor: "#fbcf21",
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
  },
  hoursAgo: {
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },
  frameView: {
    gap: 4,
    alignSelf: "stretch",
  },
  workoutDay1Parent: {
    gap: 4,
  },
  frameChild2: {
    marginLeft: -12,
  },
  frameChild4: {
    zIndex: 0,
  },
  text: {
    top: 10,
    left: 9,
    color: "#e8e8e8",
    textAlign: "left",
    lineHeight: 14,
    fontSize: 12,
    zIndex: 1,
    position: "absolute",
  },
  ellipseGroup: {
    marginLeft: -12,
  },
  frameContainer: {
    gap: 8,
    justifyContent: "center",
  },
  akarIconsdotGrid: {
    width: 20,
    height: 20,
    overflow: "hidden",
  },
  akarIconsdotGridWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: 40,
    height: 40,
    padding: 6,
    borderRadius: 50,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center"
  },
  frameGroup: {
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  iconLike: {
    width: 24,
    height: 24,
    overflow: "hidden",
  },
  iconLikeParent: {
    gap: 16,
  },
  rectangleView: {
    backgroundColor: "#b0db02",
  },
  frameChild5: {
    backgroundColor: "rgba(217, 217, 217, 0.3)",
  },
  rectangleGroup: {
    gap: 4,
  },
  frameParent2: {
    alignItems: "flex-end",
    // alignSelf: "stretch",
    justifyContent: "space-between",
  },
  deaAmalia: {
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  briefingWithRoomies: {
    fontFamily: "Poppins-Regular",
  },
  deaAmaliaParent: {
    gap: 8,
  },
  viewAllComments: {
    fontFamily: "Poppins-Regular",
    color: "rgba(231, 244, 177, 1)",
    fontSize: 10,
  },
  frameParent1: {
    gap: 12,
    // alignSelf: "stretch",
  },
  frameParent: {
    padding: 16,
    backgroundColor: "transparent",
    justifyContent: "space-between",
    width: "100%",
    height: 358,
    borderRadius: 16,
    left: 0,
    top: 0
  },
  content: {
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    width: "100%",
  },
});

export default HomeWorkoutCard;
