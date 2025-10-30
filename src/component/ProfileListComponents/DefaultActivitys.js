// UpcomingEventCard.js
import * as React from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Pressable,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import placeholderseabuddy from "../../assets/PostImage/placeholderseabuddy.svg";
import { Image, SvgXml } from "react-native-svg";
import { ActivityIndicator } from "react-native-paper";
import { Colors } from "react-native/Libraries/NewAppScreen";
import MediaPreviewModal from "../Modals/MediaPreviewModal";
import Video from "react-native-video";
import FastImage from "react-native-fast-image";



const DefaultActivits = ({ navigation, activity, uri, index = 1 }) => {
  const [imageLoading, setImageLoading] = React.useState(false);
  const isVideo = (url) => {
    return url.match(/\.(mp4|mov|avi)$/i);
  };
  const [mediaModalVisible, setMediaModalVisible] = React.useState(false);
  const [selectedMedia, setSelectedMedia] = React.useState(null); // { uri: string, isVideo: boolean }
  const handleMediaPress = (uri) => {
    setSelectedMedia({ uri, isVideo: isVideo(uri) });
    setMediaModalVisible(true);
  };

  const bgColors = [
    "#FFA754",
    "#72BEFF",
    "#7153FE",
    "#FF7942",
    "#4F71FF",
    "#FE5F5E",
  ]
  return (
    <Pressable
      style={[styles.cardContainer, { backgroundColor: !uri ? bgColors[index % 6] : null }]}
      onPress={() => {
        uri ? handleMediaPress(uri) : navigation.navigate("CreateGroupActivity", { activity: activity });
      }}
    >
      <View style={styles.cardContent}>



        {imageLoading && uri && <ActivityIndicator
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -15 }, { translateY: -15 }],
          }}
          color={Colors.green}
        />}
        {uri ? isVideo(uri) ? (
          <Video
            source={{ uri: uri || defaultImage }}
            style={[styles.imageBackground, { height: uri ? 150 : 95 }]}
            resizeMode="contain"
            muted
            repeat
          />
        ) : (<FastImage
          source={{ uri: uri || defaultImage }}
          style={[styles.imageBackground, { height: uri ? 150 : 95 }]}
          resizeMode="contain"
          muted
          repeat
        />) : (<View style={styles.textContainer}>

          <FastImage
            style={{ height: 50, width: 50, marginBottom: 5 }}
            resizeMode="cover"
            source={{
              uri: activity?.categoryImage,
            }}
          // source={ImagesAssets.cardimg}
          />
          <Text
            style={[styles.titleText]}

          >
            {activity?.categoryName || ""}
          </Text>


        </View>)}

        {selectedMedia && <MediaPreviewModal
          visible={mediaModalVisible}
          onClose={() => setMediaModalVisible(false)}
          uri={selectedMedia.uri}
          type={selectedMedia.isVideo ? 'video' : 'image'} // or "video"
        />}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    // backgroundColor: "red",
    borderRadius: 15,
    width: "100%",
    alignSelf: "center",
    padding: 8,
    marginVertical: 8,
  },
  cardContent: {
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    // borderTopRightRadius: 25,
    overflow: "hidden",
  },
  imageBackground: {
    borderRadius: 5,
    height: 95,
    justifyContent: "flex-end",
    padding: 8,
    width: 170,
  },
  textContainer: {
    paddingVertical: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 120,
    width: 120,

  },
  titleText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    width: "auto"
  },
  tagContainer: {
    flexDirection: "row",
    gap: 4,
  },
  tagWrapper: {
    backgroundColor: "#b7b7b7",
    borderRadius: 16,
    paddingHorizontal: 5,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
  textColor: {

  },
  textColorWhite: {
    color: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DefaultActivits;
