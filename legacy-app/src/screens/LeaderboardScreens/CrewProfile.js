import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";

import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import CrewProfileHeader from "../../component/headers/LeaderboardHeaders/CrewProfileHeader";
import BestEmployDeatilsCard from "../../component/Cards/LeaderboardCards/BestEmployDeatilsCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiServerUrl } from "../../Api";
import { useFocusEffect } from "@react-navigation/native";
import MediaPreviewModal from "../../component/Modals/MediaPreviewModal";
import FastImage from "react-native-fast-image";

const { height } = Dimensions.get("window");

const CrewProfile = ({ navigation, route }) => {
  const { item, id, source } = route.params || {};
  const userIdToFetch = id || item?.id;

  const [crew, setCrew] = useState({});
  const [selectedMedia, setSelectedMedia] = useState({});
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleMediaPress = (uri) => {
    setSelectedMedia({ uri, isVideo: false });
    setMediaModalVisible(true);
  };

  useEffect(() => {
    if (selectedMedia) {
      console.log("Selected Media URI:", selectedMedia.uri);
    }
  }, [selectedMedia]);
  const GetDetails = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);

      const response = await axios({
        method: "GET",
        url: `${apiServerUrl}/user/viewUserProfile`,
        headers: {
          authToken: userDetails.authToken,
        },
        params: {
          userId: userIdToFetch,
        },
      });

      if (response.data.responseCode === 200) {
        setCrew(response.data.result);
      } else {
        console.warn("Failed to fetch user data:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const GetDetailsRank = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);

      const response = await axios({
        method: "GET",
        url: `${apiServerUrl}/user/viewUserProfileRank`,
        headers: {
          authToken: userDetails.authToken,
        },
        params: {
          userId: userIdToFetch,
        },
      });

      if (response.data.responseCode === 200) {
        setCrew((prev) => {
          return {
            ...prev,
            userLeaderBoardPosition: response.data.result.userLeaderBoardPosition,
            rewardPoints: response.data.result.rewardPoints

          }
        });
      } else {
        console.warn("Failed to fetch user data:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userIdToFetch) GetDetails();
    }, [userIdToFetch])
  );

  return (
    <View style={styles.container}>
      {/* View Profile Picture */}
      <TouchableOpacity
        onPress={() => handleMediaPress(crew?.profileUrl)}
        style={styles.viewIconContainer}
      >
        <Image
          style={styles.viewIcon}
          source={ImagesAssets.ViewIcon}
        />
      </TouchableOpacity>

      {/* Header */}
      <CrewProfileHeader navigation={navigation} source={source} />

      {/* StatusBar */}
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      {/* Profile Image Background */}
      <FastImage
        source={{
          uri:
            crew?.profileUrl ||
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <BestEmployDeatilsCard crew={crew} />
        </View>
      </ScrollView>

      {/* Media Preview */}
      {selectedMedia && (
        <MediaPreviewModal
          visible={mediaModalVisible}
          onClose={() => setMediaModalVisible(false)}
          uri={selectedMedia?.uri || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"}
          type="image"
        />

      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D9D9D9",
  },
  backgroundImage: {
    width: "100%",
    height: height * 0.42,
    position: "absolute",
    top: "7%",
    left: 0,
    right: 0,
    zIndex: -1,
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
  },
  scrollViewContent: {
    paddingTop: "55%",
    paddingBottom: "10%",
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  cardContainer: {
    marginTop: 105,
    gap: 16,

    // backgroundColor: "black",
  },
  viewIconContainer: {
    borderRadius: 5,
    backgroundColor: "#D9D9D9",
    position: "absolute",
    right: 15,
    top: 80,
    zIndex: 30,
    padding: 10,
    opacity: 0.7,
  },
  viewIcon: {
    height: 15,
    width: 15,
  },
});

export default CrewProfile;
