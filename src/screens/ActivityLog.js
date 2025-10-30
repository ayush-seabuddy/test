import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import Colors from "../colors/Colors";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import ActivityLogHeader from "../component/headers/ActivityLogHeader";
import Summary from "../component/ActivityLogComponents/Summary";
import Completed from "../component/ActivityLogComponents/Completed";
import Achievements from "../component/ActivityLogComponents/Achievements";
const ActivityLog = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Summary");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Summary":
        return <Summary navigation={navigation} />;
      case "Completed":
        return <Completed navigation={navigation} />;
      case "Achievements":
        return <Achievements navigation={navigation} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ActivityLogHeader
        navigation={navigation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentText: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
  },
});

export default ActivityLog;
