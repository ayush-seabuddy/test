import { ImagesAssets } from "@/src/utils/ImageAssets";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface WellnessOfficer {
  id?: string;
  doctorName?: string;
  country?: string;
  language?: string[];
  profileUrl?: string;
  [key: string]: any;
}

interface Props {
  data: WellnessOfficer;
  onPress?: () => void;
}

const WellnessOfficerCard: React.FC<Props> = ({ data, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.push({
      pathname: "/wellnessOfficerProfile",
      params: { item: JSON.stringify(data) },
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={styles.container}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.profileImage}
            source={{ uri: data?.profileUrl || ImagesAssets.userIcon }}
            contentFit="contain"
            placeholder={ImagesAssets.userIcon}
            transition={300}
            cachePolicy={"memory-disk"}
          />
        </View>

        {/* Details */}
        <View style={styles.details}>
          {!!data?.doctorName && (
            <Text style={styles.doctorName} numberOfLines={1}>
              {data.doctorName}
            </Text>
          )}

          {!!data?.country && (
            <Text style={styles.country} numberOfLines={1}>
              {data.country}
            </Text>
          )}

          {!!data?.language?.length && (
            <Text style={styles.languages} numberOfLines={1}>
              {data.language.join(", ")}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  details: {
    flex: 1,
    justifyContent: "center",
  },

  doctorName: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#262626",
  },

  country: {
    fontFamily: "Poppins-Medium",
    fontSize: 13,
    color: "#555",
    textTransform: "capitalize",
    marginBottom: 2,
  },

  languages: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#777",
    textTransform: "capitalize",
  },
});

export default React.memo(WellnessOfficerCard);
