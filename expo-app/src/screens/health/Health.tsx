import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import AssessmentList from "./AssessmentList";
import CategorySection from "./CategorySection";
import HealthHeader from "./HealthHeader";
import WellnessCard from "./WellnessCard";

const Health = ({ }) => {
  return (
    <View style={styles.container}>
      <HealthHeader />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >

        <WellnessCard />
        <AssessmentList />
        <CategorySection onCategoryPress={(data) => {
          router.push({
            pathname: "/contentList",
            params: { item: JSON.stringify(data) }  
          });
        }
        } />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ededed",
  },
  contentContainerStyle: {
    paddingBottom: 100,
    paddingTop: 20,
  },

});

export default Health;
