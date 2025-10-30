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
const All = ({ userLists, fetchUserList , allUser}) => {
  const [showAll, setShowAll] = React.useState(false);
  const [showAllCatering, setShowAllCatering] = React.useState(false);
  const [showAlldeck, setShowAllDeck] = React.useState(false);
  const handleViewAll = () => {
    setShowAll(!showAll);
  };
  const handleViewAllCatering = () => {
    setShowAllCatering(!showAllCatering);
  };
  const handleViewAllDeck = () => {
    setShowAllDeck(!showAlldeck);
  };

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
              Deck
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                backgroundColor: "rgba(183, 183, 183, 1)",
                borderRadius: 8,
                paddingHorizontal: 9,
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
                {userLists?.Deck?.length || "0"}
              </Text>
            </View>
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
        {userLists?.Deck?.length > 0 ? (
          <>
            <FlatList
              data={
                showAlldeck
                  ? userLists?.Deck
                  : userLists?.Deck?.slice(0, 5) || []
              }
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) =>
                item ? (
                  <CrewListCard
                    item={item}
                    fetchUserList={fetchUserList}
                    department={"Deck"}
                    allUser={allUser}
                  />
                ) : null
              }
            />
            {userLists?.Deck?.length > 5 ? (
              <TouchableOpacity
                onPress={handleViewAllDeck}
                style={{
                  backgroundColor: "rgba(247, 251, 230, 1)",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    fontFamily: "Poppins-Regular",
                    lineHeight: 9.6,
                    color: "rgba(148, 148, 148, 1)",
                  }}
                >
                  {showAlldeck ? "Show Less" : "View All"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <View
            style={{
              width: width,
              height: height * 0.05,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                lineHeight: 24,
                fontSize: 16,
                // marginLeft: 10,
                color: "#262626",
                fontFamily: "WhyteInkTrap-Regular",
              }}
            >
              No user in deck.
            </Text>
          </View>
        )}
      </View>

      <View style={{ marginTop: 10 }}>
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
              Engine
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
                {userLists?.Engine?.length || "0"}
              </Text>
            </View>
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
        {userLists?.Engine?.length > 0 ? (
          <>
            <FlatList
              data={
                showAll
                  ? userLists?.Engine
                  : userLists?.Engine?.slice(0, 5) || []
              }
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) =>
                item ? (
                  <CrewListCard
                    item={item}
                    fetchUserList={fetchUserList}
                    department={"Engine"}
                    allUser={allUser}
                  />
                ) : null
              }
            />
            {userLists?.Engine?.length > 5 ? (
              <TouchableOpacity
                onPress={handleViewAll}
                style={{
                  backgroundColor: "rgba(247, 251, 230, 1)",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    fontFamily: "Poppins-Regular",
                    lineHeight: 9.6,
                    color: "rgba(148, 148, 148, 1)",
                  }}
                >
                  {showAll ? "Show Less" : "View All"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <View
            style={{
              width: width,
              height: height * 0.05,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                lineHeight: 24,
                fontSize: 16,
                // marginLeft: 10,
                color: "#262626",
                fontFamily: "WhyteInkTrap-Regular",
              }}
            >
              No user in engine.
            </Text>
          </View>
        )}
      </View>

      <View style={{ marginTop: 10 }}>
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
                {userLists?.Catering?.length || "0"}
              </Text>
            </View>
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
        {/* <FlatList
          data={userLists?.Catering || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) =>
            item ? <CrewListCard item={item} /> : null
          }
        /> */}
        {userLists?.Catering?.length > 0 ? (
          <>
            <FlatList
              data={
                showAllCatering
                  ? userLists?.Catering
                  : userLists?.Catering?.slice(0, 5) || []
              }
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) =>
                item ? (
                  <CrewListCard
                    item={item}
                    fetchUserList={fetchUserList}
                    department={"Catering"}
                    allUser={allUser}
                  />
                ) : null
              }
            />
            {userLists?.Catering?.length > 5 ? (
              <TouchableOpacity
                onPress={handleViewAllCatering}
                style={{
                  backgroundColor: "rgba(247, 251, 230, 1)",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    fontFamily: "Poppins-Regular",
                    lineHeight: 9.6,
                    color: "rgba(148, 148, 148, 1)",
                  }}
                >
                  {showAllCatering ? "Show Less" : "View All"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <View
            style={{
              width: width,
              height: height * 0.05,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                lineHeight: 24,
                fontSize: 16,
                // marginLeft: 10,
                color: "#262626",
                fontFamily: "WhyteInkTrap-Regular",
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

export default All;
