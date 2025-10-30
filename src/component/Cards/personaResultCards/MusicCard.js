// UpcomingEventCard.js (Updated MusicCard)
import React from "react";
import {
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
const { width } = Dimensions.get("window");

const MusicCard = ({ navigation, data }) => {
  const allData = data.allContents || data;
  let slicedData = allData;
  if (allData.length > 3) {
    slicedData = allData.slice(0, 3);
  }

  const RenderData = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => {
          navigation.navigate("MusicPlayer", { dataItem: item });
        }}
      >
        <View style={styles.cardContent}>
          {/* Thumbnail */}
          <Image
            style={styles.imageBackground}
            resizeMode="cover"
            source={{ uri: item?.thumbnail }}
          />

          {/* Centered title & arrow */}
          <View style={styles.centerRow}>
            <Text
              style={[styles.titleText, styles.textColor]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.contentTitle}
            </Text>

            {/* White arrow/icon container */}
            <View style={styles.iconWrapper}>
              <Image
                style={styles.frameItem}
                resizeMode="cover"
                source={ImagesAssets.baseicon2}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={slicedData}
        renderItem={RenderData}
        ListEmptyComponent={
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 30,
              width: width,
            }}
          >
            <Image
              style={{ height: 80, width: 80 }}
              source={require("../../../assets/images/AnotherImage/no-content.png")}
            />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins-Regular",
                color: "#000",
                marginTop: 10,
              }}
            >
              No Audio Found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 10,
    width: "100%",
    alignSelf: "center",
    padding: 8,
    marginVertical: 8,
  },
  frameItem: {
    width: 14,
    height: 14,
  },
  cardContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center", // ✅ keeps items vertically centered
  },
  imageBackground: {
    borderRadius: 10,
    height: 64,
    width: 64,
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    paddingHorizontal: 12,
  },
  titleText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    maxWidth: "75%",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
    height: 28,
    width: 28,
  },
  textColor: {
    color: "#161616",
  },
});

export default MusicCard;
