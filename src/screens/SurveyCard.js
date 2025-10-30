import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React from "react";
import Colors from "../colors/Colors";
import { useNavigation } from "@react-navigation/native";

const SurveyCard = ({ surveyData }) => {
  const navigation = useNavigation();

  // ✅ Skip rendering if surveyData is null, undefined, or empty array
  if (!surveyData || (Array.isArray(surveyData) && surveyData.length === 0)) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {surveyData.image ? (
          <Image
            source={{ uri: surveyData.image }}
            style={styles.icon}
            resizeMode="contain"
          />
        ) : null}

        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {surveyData.title || "Seafarers' Well-Being Survey"}
        </Text>
      </View>

      <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
        {surveyData.description || "Help us understand the mental and emotional well-being of seafarers. Your responses will contribute to creating a happier and healthier life at sea."}
      </Text>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("CustomSurvey", { surveyId: surveyData.id })
        }
      >
        <Text style={styles.buttonText}>Start Survey</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SurveyCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    width: 45,
    height: 45,
    marginRight: 10,
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    color: "#000",
    flex: 1,
    fontFamily: "Poppins-SemiBold",
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 14,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },
  button: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
  },
});
