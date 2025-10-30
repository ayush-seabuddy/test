import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import AnouncementDetailsHeader from "../component/headers/AnouncementDetailsHeader";
import CustomLottie from "../component/CustomLottie";
import Colors from "../colors/Colors";
import GroupActivity from "../component/ProfileListComponents/GroupActivity";

const { width } = Dimensions.get("window");

const ShowAllActivities = ({ navigation, route }) => {
  const Data = route.params;

  // Callback to handle activity deletion
  const handleDeleteActivity = (deletedActivityId) => {
    // Optionally, update the UI by filtering out the deleted activity
    // This assumes you want to remove the activity from the UI after deletion
    route.params.data = Data.data.filter(
      (activity) => activity.id !== deletedActivityId
    );
    // Force a re-render by updating the state or navigating
    navigation.setParams({ data: route.params.data });
  };

  return (
    <>
      <View style={styles.container}>
        <AnouncementDetailsHeader navigation={navigation} title={"Activities"} />

        <FocusAwareStatusBar
          barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
          backgroundColor={Colors.white}
          hidden={false}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          style={{ marginBottom: 20 }}
        >
          <View style={styles.cardsWrapper}>
            {Data?.data?.length > 0 &&
              Data.data.map((activity, index) => (
                <View key={activity.id || index} style={styles.card}>
                  <GroupActivity
                    navigation={navigation}
                    activity={activity}
                    screenName="ShowAllActivity"
                    onDelete={handleDeleteActivity} // Pass the delete callback
                  />
                </View>
              ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.lottieBackground}>
        <CustomLottie />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  card: {
    width: "49%", // two per row
    marginBottom: 12,
  },
  lottieBackground: {
    backgroundColor: "#c1c1c1",
    overflow: "hidden",
    height: "50%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: -1,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});

export default ShowAllActivities;