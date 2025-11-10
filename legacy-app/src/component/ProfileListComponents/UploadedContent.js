// UpcomingEventCard.js
import * as React from "react";
import {
  Text,
  StyleSheet,
  View,
  ImageBackground,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import placeholderseabuddy from "../../assets/PostImage/placeholderseabuddy.svg";
import { Image, SvgXml } from "react-native-svg";
import { ActivityIndicator } from "react-native-paper";
import { Colors } from "react-native/Libraries/NewAppScreen";
import MediaPreviewModal from "../Modals/MediaPreviewModal";



const UploadedContent = ({ navigation, activity , uri}) => {
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
  return (
     <TouchableOpacity onPress={() => handleMediaPress(imageUrl)}>
      <View style={styles.cardContent}>



        {imageLoading && <ActivityIndicator
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -15 }, { translateY: -15 }],
          }}
          color={Colors.green}
        />}
        <ImageBackground
          style={styles.imageBackground}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          source={
            activity.categoryImage||uri
              ? { uri: activity.categoryImage||uri }
              : require("../../assets/PostImage/placeholderseabuddy.png")
          }
        />
        <View style={styles.textContainer}>
          <Text
            style={[styles.titleText]}
           
          >
            {activity?.categoryName || ""}
          </Text>

        </View>
        {selectedMedia && <MediaPreviewModal
                visible={mediaModalVisible}
                onClose={() => setMediaModalVisible(false)}
                uri={selectedMedia.uri}
                type={selectedMedia.isVideo ? 'video' : 'image'} // or "video"
              />}
      </View>
    </TouchableOpacity>
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
    // borderTopRightRadius: 25,
    overflow: "hidden",
  },
  imageBackground: {
    borderRadius:5,
    height: 95,
    justifyContent: "flex-end",
    padding: 8,
    width: 170,
  },
  textContainer: {
    paddingVertical: 10,
    display: "flex",
    justifyContent:"center",
    alignItems:"center",
    width:"100%",
  },
  titleText: {
    fontSize: 12,
    color: "#161616",
    fontFamily: "Poppins-SemiBold",
    width:"auto"
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

export default UploadedContent;
