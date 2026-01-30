import * as React from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowUpRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { ImagesAssets } from "@/src/utils/ImageAssets";

const { height } = Dimensions.get("window");
const isProMax = height >= 926;

interface PersonalityTestCardProps {
  data: any;
  ApiData: any;
  testArray: any;
  screenName: string;
}

const PersonalityTestCard = ({
  data,
  ApiData,
  testArray,
  screenName,
}: PersonalityTestCardProps) => {
  const { t } = useTranslation();

  const handlePress = () => {
    if (testArray?.[2]?.open) {
      router.push({
        pathname: "/personalitymap/PersonalityMapTestScreen",
        params: { screenName },
      });
    } else {
      router.push({
        pathname: "/personalitymap/PersonalityMapResultScreen",
        params: { screenName },
      });
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.container}>
        <Image
          source={ImagesAssets.personality}
          resizeMode="cover"
          style={styles.image}
        />

        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: data === false ? "#06361f" : "grey" },
            ]}
          >
            {t("personalitymap")}
          </Text>

          <Text style={styles.description}>
            {t("personalitymap_description")}
          </Text>

          {ApiData?.insights?.maritime_title && (
            <View style={styles.badgeWrapper}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {ApiData.insights.maritime_title}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.iconWrapper}>
          <ArrowUpRight size={18} color="black" />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "white",
  },

  content: {
    flex: 1,
    flexDirection: "column",
  },

  title: {
    fontSize: isProMax ? 14 : 12,
    lineHeight: 18,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "500",
  },

  description: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: "Poppins-Regular",
    color: "#444444",
  },

  badgeWrapper: {
    marginTop: 5,
    width: "55%",
  },

  badge: {
    backgroundColor: "#D1AF90",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },

  iconWrapper: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
  },
});

export default PersonalityTestCard;
