import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Platform,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import ArticlesHeader from "../component/headers/ArticlesHeader";
import ArticlesCard from "../component/Cards/ArticlesCards/ArticlesCard";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import { ImagesAssets } from "../assets/ImagesAssets";
import LottieView from "lottie-react-native";
import CustomLottie from "../component/CustomLottie";
const { width, height } = Dimensions.get("window");
const Articles = ({ navigation, route }) => {
  const { data } = route.params || {};
  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      <ArticlesHeader navigation={navigation} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* <View style={styles.headerContainer}>
          <Text style={styles.headerText}></Text>
        </View> */}
        {/* <View style={styles.cardsContainer}>
          {[...new Array(4)].map((_, index) => (
            <View style={styles.cardWrapper} key={index}>
              <ArticlesCard navigation={navigation} />
            </View>
          ))}
        </View> */}

        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>All Articles</Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: 8,
              padding: 7,
            }}
          >
            <Image
              style={{ width: 20, height: 20 }}
              resizeMode="cover"
              source={ImagesAssets.filter_icon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardsContainer}>
          {/* {[...new Array(4)].map((_, index) => ( */}
          <View style={styles.cardWrapper} key={index}>
            <ArticlesCard navigation={navigation} />
          </View>
          {/* ))} */}
        </View>
      </ScrollView>
      <View style={styles.bottomCard}>
        <CustomLottie />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    color: "black",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "WhyteInktrap-Medium",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10, // Space at the bottom of the cards
  },
  cardWrapper: {
    width: "48%", // Make each card take up about half the available width
    marginBottom: 10, // Space between rows
  },
  imageBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 400, // Adjust as needed
    zIndex: -1, // Make sure the background is behind the content
  },
  bottomCard: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: "center",
    position: "absolute",
    height: "50%",
    bottom: 0,
    overflow: "hidden",
    paddingHorizontal: 16,
    elevation: -5,
    zIndex: -1,
  },
  lottieBackground: {
    position: "absolute",
    width: width, // Full screen width
    height: height * 0.5, // Adjusted for the bottom card's height
    bottom: 0,
    elevation: -5,
  },
});

export default Articles;
