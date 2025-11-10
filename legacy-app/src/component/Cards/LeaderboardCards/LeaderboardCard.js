import React from "react";
import { Image, Text, View } from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import FastImage from "react-native-fast-image";
import { useTranslation } from "react-i18next";

const LeaderboardCard = ({ isSelected, item, index, userDetails }) => {
  const { t } = useTranslation();
  const rank = index + 1;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: userDetails.id === item.id ? "#B0DB02" : "white",
        width: "100%",
        padding: 8,
        borderRadius: 8,
      }}
    >
      <View
        style={{
          borderRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
        }}
      >
        <View
          style={{
            backgroundColor: userDetails.id === item.id ? "white" : "#B0DB02",
            alignItems: "center",
            justifyContent: "center",
            height: 28,
            width: 28,
            borderRadius: 100,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Poppins-Regular",
              lineHeight: 18,
            }}
          >
            {item?.rank}
          </Text>
        </View>
        <FastImage
          style={{ height: 40, width: 40, borderRadius: 50 }}
          resizeMode="cover"
          source={{
            uri:
              item?.profileUrl ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
          }}
        // source={ImagesAssets.cardimg}
        />

        <View>
          <Text
            style={{
              fontSize: 14,
              color: userDetails.id === item.id ? "#FFFFFF" : "#636363",
              fontFamily: "Poppins-Medium",
              fontWeight: "500",
              lineHeight: 18,
            }}
          >
            {(item?.fullName?.length || 0) > 20
              ? item.fullName.slice(0, 20) + "..."
              : item.fullName || ""}
          </Text>

          <Text
            style={{
              fontSize: 10,
              color: userDetails.id === item.id ? "#FFFFFF" : "#949494",
              fontFamily: "Poppins-Regular",
              fontWeight: "400",
              lineHeight: 12,
            }}
          >
            {item?.designation || ""}
          </Text>
        </View>
      </View>

      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          // backgroundColor: "red",
          backgroundColor:
            userDetails.id === item.id ? "#FFFFFF99" : "#D0D0D066",
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 6,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "#06361F",
            fontFamily: "Poppins-Medium",
            fontWeight: "600",
            lineHeight: 18,
          }}
        >
          {item?.rewardPoints || "0"}
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: "#B7B7B7",
            fontFamily: "Poppins-Regular",
            fontWeight: "400",
            lineHeight: 12,
            textAlign: "center",
          }}
        >
          {t('miles')}
        </Text>
      </View>
    </View>
  );
};

export default LeaderboardCard;
