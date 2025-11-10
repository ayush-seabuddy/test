import React, { useState } from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import Colors from "../colors/Colors";

const SearchTabs = () => {
  const [activeTab, setActiveTab] = useState("Top"); // Default active tab

  const tabs = [
    { title: "Top" },
    { title: "Resources" },
    { title: "Crew" },
    { title: "Events" },
    { title: "BuddyUp" },
    { title: "Videos" },
  ];

  return (
    <View style={styles.component3Parent}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => (
          <View key={tab.title} style={styles.tabContainer}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab.title && styles.activeTabText,
              ]}
              onPress={() => setActiveTab(tab.title)}
            >
              {tab.title}
            </Text>
            {/* Use border styles for the active tab */}
            <View style={[
              styles.activeBorder,
              activeTab === tab.title ? styles.activeBorderStyle : styles.inactiveBorderStyle
            ]} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  component3Parent: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#fafafa",
 
    width: "100%",
  },
  tabContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16, // Keep some horizontal padding for spacing
    alignItems: "center",
  },
  tabText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#b7b7b7", // Inactive tab text color
    textAlign: "center", // Center the text
  },
  activeTabText: {
    color: "#161616", // Active tab text color
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  activeBorder: {
    height: 1, // Height for the border
    width: "100%",
  },
  activeBorderStyle: {
    backgroundColor: Colors.secondary, // Active border color
  },
  inactiveBorderStyle: {
    backgroundColor: "transparent", // No border for inactive tabs
  },
});

export default SearchTabs;
