import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";

import CrewListCard from "../Cards/CrewListCards/CrewListCard";
const { height, width } = Dimensions.get("window");
const Catering = ({ userLists, fetchUserList }) => {
  return (
    <View>
      <View>
        <View
          style={{
            backgroundColor: "rgba(232, 232, 232, 1)",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins-SemiBold",
                lineHeight: 24,
              }}
            >
              Catering
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {userLists?.Catering?.length > 0 && (
              <View
                style={{
                  backgroundColor: "rgba(183, 183, 183, 1)",
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Poppins-SemiBold",
                    lineHeight: 14,
                  }}
                >
                  {userLists?.Catering?.length || ""}
                </Text>
              </View>
            )}

            {/* <TouchableOpacity
              style={{
                backgroundColor: "rgba(176, 219, 2, 1)",
                borderRadius: 8,
                padding: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                style={{ height: 10, width: 10 }}
                tintColor="rgba(22, 22, 22, 1)"
                source={ImagesAssets.plus_icon}
              />
            </TouchableOpacity>
            <Image
              style={{ height: 16, width: 16 }}
              tintColor="rgba(148, 148, 148, 1)"
              source={ImagesAssets.dots}
            /> */}
          </View>
        </View>
        {userLists?.Catering?.length > 0 ? (
          <FlatList
            data={userLists?.Catering || []}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) =>
              item ? (
                <CrewListCard
                  item={item}
                  department={"Catering"}
                  fetchUserList={fetchUserList}
                />
              ) : null
            }
          />
        ) : (
          <View
            style={{
              width: width,
              height: height * 0.7,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                lineHeight: 24,
                fontSize: 20,
                // marginLeft: 10,
                color: "#262626",
                fontFamily: "WhyteInktrap-Bold",
              }}
            >
              No user in catering.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Catering;
