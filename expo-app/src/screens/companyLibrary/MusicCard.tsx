import Colors from "@/src/utils/Colors";
import { router } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  Image,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MusicItem {
  id: string;
  thumbnail?: string;
  contentTitle?: string;
}

interface MusicCardProps {
  data: { allContents?: MusicItem[] } | MusicItem[];
}

const MusicCard: React.FC<MusicCardProps> = ({ data }) => {
  const listData: MusicItem[] = Array.isArray(data)
    ? data
    : (data?.allContents ?? []);

  const slicedData = listData.slice(0, 3);

  const handlePress = (item: MusicItem) => {
    router.push({
      pathname: "/contentDetails/[contentId]",
      params: {
        contentId: item.id,
        item: JSON.stringify(item),
      },
    });
  };

  const renderItem: ListRenderItem<MusicItem> = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => handlePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.imageBackground}
          resizeMode="cover"
        />

        <View style={styles.centerRow}>
          <Text
            style={[styles.titleText, styles.textColor]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.contentTitle || "Untitled"}
          </Text>

          <View style={styles.iconWrapper}>
            <ArrowUpRight size={20} color={Colors.black} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={slicedData}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.id || index.toString()}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.2)",
    borderRadius: 10,
    width: "95%",
    alignSelf: "center",
    padding: 8,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageBackground: {
    height: 64,
    width: 64,
    borderRadius: 10,
  },
  centerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  titleText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    maxWidth: "75%",
  },
  iconWrapper: {
    height: 28,
    width: 28,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  textColor: {
    color: "#161616",
  },
});

export default MusicCard;
