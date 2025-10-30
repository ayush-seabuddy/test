import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";

const CrewListHeader = ({ navigation, activeTab, setActiveTab }) => {
  const tabs = ["All", "Deck", "Engine", "Catering"];

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.headerButton}
          >
            <View style={styles.iconBackground}>
              <Image
                source={ImagesAssets.backArrow}
                style={styles.headerIcon}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.health}>Crew List</Text>
        </View>

        <View style={styles.headerButtonsContainer}>
          {/* <TouchableOpacity
            onPress={() => navigation.replace("Search")}
            style={styles.headerButton}
          >
            <View style={[styles.iconBackground, styles.searchIconBackground]}>
              <Image
                source={ImagesAssets.info_icon}
                style={styles.headerIcon}
              />
            </View>
          </TouchableOpacity> */}
        </View>
      </View>
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 74,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
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
  tabsContainer: {
    flexDirection: "row",
    marginTop: 3,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "rgba(176, 219, 2, 1)",
  },
  tabText: {
    fontSize: 12,
    color: "rgba(183, 183, 183, 1)",
    fontFamily: "Poppins-Regular",
    lineHeight: 18,
  },
  activeTabText: {
    color: "rgba(176, 219, 2, 1)",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 18,
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

export default CrewListHeader;
