import React from "react";
import { Image, Text, View } from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import FastImage from "react-native-fast-image";
const BestEmployeeCard = ({ item, index }) => {
  const rank = index + 1;
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "white",
        width: 125,
        height: 175,
        padding: 16,
        borderRadius: 16,
      }}
    >
      <View style={{ borderRadius: 16 }}>
        <FastImage
          style={{ height: 64, width: 64, borderRadius: 50 }}
          resizeMode="cover"
          source={{
            uri:
              item?.profileUrl ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
          }}
        // source={ImagesAssets.cardimg}
        />
        <View
          style={{
            backgroundColor: "#B0DB02",
            alignItems: "center",
            justifyContent: "center",
            height: 30,
            width: 30,
            borderRadius: 100,
            position: "absolute",
            top: 0,
            left: -8,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Poppins-Regular",
              lineHeight: 18,
            }}
          >
            {rank || "0"}
          </Text>
        </View>
      </View>
      <View>
        <Text
          style={{
            fontSize: 12,
            color: "#636363",
            fontFamily: "Poppins-Medium",
            textAlign: "center",
            fontWeight: "500",
            lineHeight: 18,
          }}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {item?.fullName || ""}
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: "#636363",
            fontFamily: "Poppins-Regular",
            fontWeight: "400",
            lineHeight: 12,
            textAlign: "center",
          }}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {item?.designation || ""}
        </Text>
      </View>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#B0DB021A",
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 6,
          marginTop: 10,
        }}
      >
        <Text
          style={{
            fontSize: 12,
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
          Miles
        </Text>
      </View>
    </View>
  );
};

export default BestEmployeeCard;
