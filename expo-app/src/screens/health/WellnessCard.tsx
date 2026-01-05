// CustomHeader.js
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChartNoAxesCombined, Smile } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height } = Dimensions.get("window");
const isProMax = height >= 926;

const WellnessCard = () => {
  const { t } = useTranslation();

  const healthTrackerArray = [
    {
      title: t("moodTracker"),
      image: <Smile size={20} color={Colors.white} />,
      page: "moodTracker",
    },
    {
      title: t("analytics"),
      image: <ChartNoAxesCombined size={20} color={Colors.white} />,
      page: "Analytics",
    },
  ];

  return (
    <View style={styles.main}>
      <TouchableOpacity style={styles.container} onPress={() => { router.push("/wellnessOfficerList") }}>
        <View style={styles.leftColumn}>
          <Text style={styles.title}>{t("speaktowellnessofficer")}</Text>
          <Text style={styles.description}>
            {t("speaktowellnesssofficer_description")}
          </Text>
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={ImagesAssets.helpline_img}
            style={styles.image}
            contentFit="contain"
          />
        </View>
      </TouchableOpacity>

      {/* Health Tracker Cards */}
      <View style={styles.healthRow}>
        {healthTrackerArray.map((item, index) => (
          <TouchableOpacity key={index} style={styles.healthCard} onPress={() => router.push(item.page)}>
            {item.image}
            <Text style={styles.healthCardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: Colors.darkGreen,
    marginHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
  },

  leftColumn: {
    flex: 1,
    height: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingLeft: 20,
    paddingVertical: 20,
  },

  title: {
    color: "#fff",
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    lineHeight: 30,
    fontSize: isProMax ? 20 : 15,
  },

  description: {
    fontSize: isProMax ? 12 : 10,
    lineHeight: 18,
    fontFamily: "Poppins-Regular",
    color: "#fff",
    marginTop: -4,
    width: "90%",
  },

  imageWrapper: {
    width: 100,
    height: "100%",
    marginRight: 10,
  },

  image: {
    width: 100,
    height: "100%",
    borderRadius: 10,
  },

  healthRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 10,
    marginTop: 10,
  },

  healthCard: {
    paddingVertical: 10,
    gap: 6,
    flex: 1,
    maxWidth: "50%",
    backgroundColor: Colors.darkGreen,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  healthCardText: {
    textAlign: "center",
    alignSelf: "stretch",
    color: "#fff",
    fontFamily: "WhyteInktrap-Medium",
    lineHeight: 16,
    marginTop: 5,
    fontSize: 12,
  },
});

export default WellnessCard;
