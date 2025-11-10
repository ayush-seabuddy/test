// CustomHeader.js
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  BackHandler,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Colors from "../../colors/Colors";

const ArticalDetailsHeader = ({ navigation, data , fromHome }) => {

   useEffect(() => {
      const backAction = () => {
        // Perform the same navigation as the back button
        navigation.navigate("Home");
        return true; // Prevent default behavior (exit app)
      };
  
      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
  
      return () => backHandler.remove(); // Clean up listener on unmount
    }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center",backgroundColor:'#ededed',padding:5,borderRadius:20}}>
        <TouchableOpacity
          onPress={() => {
            if (fromHome) {
              navigation.navigate("PublicScreen");
            } else if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.replace("Home", { name: "hangout" }); // ✅ replace instead of navigate
            }
          }}
        >
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => {
            navigation.navigate("Home", { screen: "Health" });
          }}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity> */}
        {/* <Text style={styles.health}>
          {data?.contentTitle?.length > 25
            ? `${data.contentTitle.slice(0, 25)} ...`
            : data?.contentTitle}
        </Text> */}
      </View>
      <View style={styles.headerButtonsContainer}>
        {/* <TouchableOpacity
          onPress={() => {
            navigation.replace("Search");
          }}
          style={styles.headerButton}
        >
          <View style={[styles.iconBackground, styles.searchIconBackground]}>
            <Image
              tintColor="black"
              source={ImagesAssets.dots}
              style={styles.headerIcon}
            />
          </View>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  health: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    marginRight: 10,
    padding: 5,
  },
  headerIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  iconBackground: {
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  searchIconBackground: {
    backgroundColor: "#B0DB0266",
    borderRadius: 8,
  },
});

export default ArticalDetailsHeader;
