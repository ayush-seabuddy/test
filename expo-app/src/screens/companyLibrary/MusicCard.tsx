// MusicCard.tsx
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { ArrowUpRight } from "lucide-react-native";
import React from "react";
import {
    Dimensions,
    FlatList,
    Image,
    ListRenderItem,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// Define the shape of your data item
interface MusicItem {
  id?: string | number; // optional, useful for FlatList key
  thumbnail?: string;
  contentTitle?: string;
  // Add other properties as needed
}

interface MusicCardProps {
  data: {
    allContents?: MusicItem[];
  } | MusicItem[];
}

const MusicCard: React.FC<MusicCardProps> = ({  data }) => {
  const allData: MusicItem[] = Array.isArray(data) ? data : data.allContents || [];
  const slicedData = allData.length > 3 ? allData.slice(0, 3) : allData;

  const renderItem: ListRenderItem<MusicItem> = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
    //   onPress={() => {
    //     navigation.navigate("MusicPlayer", { dataItem: item });
    //   }}
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
            {item?.contentTitle || "Untitled"}
          </Text>

          {/* White arrow/icon container */}
          <View style={styles.iconWrapper}>
           <ArrowUpRight size={20} color={Colors.black} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const keyExtractor = (item: MusicItem, index: number) =>
    item.id?.toString() || index.toString();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={slicedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
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
              source={ImagesAssets.NoContent}
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
    alignItems: "center",
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