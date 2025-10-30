// CustomHeader.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";

const CrewProfileHeader = ({ navigation, source = "" }) => {
  // let parems = navigation
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <TouchableOpacity
          onPress={() => {
            // try {
            //   const state = navigation.getState();
            //   console.log(state, "state");

            //   // Get the index of the current route
            //   const currentRouteIndex = state.index;
            //   // Get the previous route (second-to-last route in the stack)
            //   const previousRoute = state.routes[currentRouteIndex - 1];
            //   const previousScreenName = previousRoute?.name || 'Unknown';

            //   console.log('Previous screen:', previousScreenName);
            //   if (previousScreenName == 'Home') {
            //     navigation.navigate("Home", {
            //       screen: "SeaBuddy",
            //       params: { name: "hangout" },
            //     });
            //   } else {
            //     navigation.goBack()
            //   }
            // } catch (error) {
            //   navigation.goBack()
            // }
            if (source == 'hangout') {
              navigation.navigate("Home", {
                screen: "SeaBuddy",
                params: { name: "hangout" },
              });
            } else {
              navigation.goBack()
            }





          }}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
        <Text style={styles.health}>Crew Profile</Text>
      </View>
      <View style={styles.headerButtonsContainer}>
        {/* <TouchableOpacity onPress={() => { navigation.replace('Search') }} style={styles.headerButton}>
          <View style={[styles.iconBackground, styles.searchIconBackground]}>
            <Image source={ImagesAssets.info_icon} style={styles.headerIcon} />
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
  headerButton: {
    marginLeft: 10,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  iconBackground: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  searchIconBackground: {
    backgroundColor: "#B0DB0266",
    borderRadius: 8,
  },
});

export default CrewProfileHeader;
