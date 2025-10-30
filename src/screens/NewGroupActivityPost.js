import React, { useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TextInput,
  Platform,
  TouchableOpacity,
} from "react-native";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import ToggleSwitch from "toggle-switch-react-native";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import { apiServerUrl } from "../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import Spinner from "react-native-loading-spinner-overlay";
import SimpleToast from "react-native-simple-toast";
import Icon from "react-native-vector-icons/FontAwesome5";
const { height, width } = Dimensions.get("screen");

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong: {this.state.error?.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const NewGroupActivityPost = ({ navigation, route }) => {
  const peopleDetails = route?.params?.peopleDetails1;

  const [isOn, setIsOn] = React.useState(false);
  const [isTwo, setIsTwo] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState(
    Array.isArray(peopleDetails?.enrichedJoinedPeople) ? peopleDetails.enrichedJoinedPeople : []
  );
  const [caption, setCaption] = React.useState(peopleDetails?.description || "");
  const [location, setLocation] = React.useState(peopleDetails?.location || "");
  const [selectedPhoto, setSelectedPhoto] = React.useState(
    peopleDetails?.imageUrls?.[0]
      ? {
          uri: peopleDetails.imageUrls[0],
          type: "photo",
          mime: "image/jpeg",
          size: 0,
          id: `${peopleDetails.imageUrls[0]}-0`,
        }
      : null
  );
  const [uploadedImage, setUploadedImage] = React.useState(peopleDetails?.imageUrls?.[0] || "");
  const [hashtags, setHashtags] = React.useState(peopleDetails?.hashtags || []);
  const [isLoading, setIsLoading] = React.useState(false);

  // Toast function
  const showToast = useCallback((message, type = "success") => {
    const duration = type === "success" ? SimpleToast.LONG : SimpleToast.SHORT;
    SimpleToast.show(message, duration, SimpleToast.TOP);
  }, []);

  // Create post
  const CreateNewPost = useCallback(async () => {
    if (!selectedPhoto) {
      showToast("No photo available to share.", "error");
      return;
    }
    if (!caption.trim()) {
      showToast("No caption provided for the post.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication token is missing");
      }

      const _userList = selectedItems.map((item) => item.id);
      const payload = {
        hangouts: [{
          imageUrls: [uploadedImage],
          caption: caption.trim(),
          hashtags,
          ...(_userList.length > 0 ? { tags: _userList } : {}),
          location: location.trim(),
          groupActivityId: peopleDetails.id,
          createdAt: new Date().toISOString(),
        }],
      };

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("authToken", authToken);

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(payload),
        redirect: "follow",
      };

      const response = await fetch(`${apiServerUrl}/user/createHangoutPost`, requestOptions);
      const result = await response.json();

      if (result.responseCode === 200) {
        showToast("Your post has been shared successfully.", "success");
        setTimeout(() => {
          navigation.navigate("Home");
        }, 1500);
      } else {
        throw new Error(result.message || "Post creation failed");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      showToast(`Failed to create post: ${error.message}`, "error");
      await firestore().collection("offlinePosts").add({
        imageUrls: [uploadedImage],
        caption,
        hashtags,
        location,
        groupActivityId: peopleDetails.id,
        createdAt: new Date().toISOString(),
        type: "create",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedPhoto, caption, hashtags, location, selectedItems, uploadedImage, navigation, showToast, peopleDetails]);

  // Sync offline data
  const syncOfflineData = useCallback(async () => {
    const connectivity = await NetInfo.fetch();
    if (connectivity.isConnected) {
      const offlinePosts = await firestore().collection("offlinePosts").get();
      for (const doc of offlinePosts.docs) {
        const data = doc.data();
        try {
          if (data.type === "create") {
            await CreateNewPost(data);
            await firestore().collection("offlinePosts").doc(doc.id).delete();
          }
        } catch (syncError) {
          console.error("Error syncing offline post:", syncError);
        }
      }
    }
  }, [CreateNewPost]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncOfflineData();
      }
    });
    return () => unsubscribe();
  }, [syncOfflineData]);

  // Memoized render functions
  const renderHashtag = useCallback(
    ({ item: tag, index }) => (
      <View
        key={index}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FBCF21",
          paddingVertical: 4,
          paddingHorizontal: 12,
          marginRight: 5,
          borderRadius: 5,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: "black", fontSize: 12, fontFamily: "Poppins-Regular" }}>{tag}</Text>
      </View>
    ),
    []
  );

  const renderTaggedUser = useCallback(
    ({ item, index }) => (
      <View key={index} style={styles.taggedUser}>
        <Image
          source={item.profileUrl ? { uri: item.profileUrl } : require("../assets/images/NewPostImage/allprofile.png")}
          style={styles.taggedUserAvatar}
        />
        <Text style={styles.taggedUserName} numberOfLines={1}>
          {item.fullName || "Unknown"}
        </Text>
      </View>
    ),
    []
  );

  const emptyData = useMemo(() => [], []);

  return (
    <ErrorBoundary>
      <View style={styles.mainContainer}>
        <FocusAwareStatusBar
          barStyle="light-content"
          backgroundColor={"#DADADA99"}
          hidden={false}
        />
        <ProfleSettingHeader navigation={navigation} title="Share Group Activity" />

        <FlatList
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.container}
          data={emptyData}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              <View style={styles.spinnerOverlay}>
                <Spinner visible={isLoading} size="large" color="#000" />
              </View>

              <View style={styles.contentContainer}>
                {/* Media Display */}
                {selectedPhoto ? (
                  <View style={styles.mediaContainer}>
                    <Image source={{ uri: selectedPhoto.uri }} style={styles.selectedPhoto} resizeMode="cover" />
                  </View>
                ) : (
                  <View style={styles.emptyMediaContainer}>
                    <Text style={styles.attachText}>No photo available</Text>
                  </View>
                )}

                {/* Caption and Options */}
                <View style={styles.captionContainer}>
                  <View style={[styles.inputSection, { marginHorizontal: 10 }]}>
                    <Text style={styles.sectionTitle}>Caption</Text>
                    <TextInput
                      style={[styles.captionInput]}
                      maxLength={400}
                      multiline
                      value={caption}
                      editable={false}
                    />
                  </View>

                  <View style={styles.postOptions}>
                    {/* Location */}
                    <View style={styles.inputSection}>
                      <Text style={styles.sectionTitle}>Location</Text>
                      <View style={styles.postOption5}>
                        <Icon name="map-marker-alt" size={20} color="#b0db02" />
                        <TextInput
                          style={styles.postOptionLeft}
                          value={location}
                          editable={false}
                        />
                      </View>
                    </View>

                    {/* Tagged Users */}
                    <View style={styles.inputSection}>
                      <Text style={styles.sectionTitle}>Joined People</Text>
                      <View style={styles.postOption5}>
                        <Icon name="user-friends" size={20} color="#b0db02" />
                        <Text style={[styles.tagPeopleText, { paddingLeft: 10 }]}>
                          {selectedItems.length > 0 ? `${selectedItems.length} people joined` : "No people joined"}
                        </Text>
                      </View>
                      {selectedItems.length > 0 && (
                        <View style={styles.taggedUserRow}>
                          {selectedItems.slice(0, 3).map((item, index) => renderTaggedUser({ item, index }))}
                          {selectedItems.length > 3 && (
                            <View style={styles.taggedUser}>
                              <Text style={styles.taggedUserName}>+{selectedItems.length - 3}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Hashtags */}
                    <View style={styles.inputSection}>
                      <Text style={styles.sectionTitle}>Hashtags</Text>
                      <View style={styles.hashtagRow}>
                        {hashtags.length > 0 ? (
                          hashtags.map((tag, index) => renderHashtag({ item: tag, index }))
                        ) : (
                          <Text style={styles.tagPeopleText}>No hashtags</Text>
                        )}
                      </View>
                    </View>

                    {/* Share Button */}
                    <TouchableOpacity
                      style={[styles.shareButton, isLoading]}
                      onPress={CreateNewPost}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.shareButtonText, isLoading]}>
                        Share
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          }
        />
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  spinnerOverlay: {
    position: "absolute",
    top: "50%",
    right: 0,
    left: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  emptyMediaContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#ededed",
    marginHorizontal: 10,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
    padding: 20,
  },
  mediaContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  selectedPhoto: {
    height: height * 0.25,
    borderRadius: 10,
    marginHorizontal:10,
  },
  captionContainer: {
    flex: 1,
  },
  inputSection: {
    backgroundColor: "#ededed",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    marginVertical: 2,
    fontFamily: "Poppins-SemiBold",
    color: "black",
    fontSize: 13,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: "#e6e8e6",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 12,
    color: "#000",
    fontFamily: "Poppins-Regular",
    height: 100,
    textAlignVertical: "top",
    marginTop: 10,
  },
  postOptions: {
    paddingHorizontal: 10,
    flexDirection: "column",
  },
  postOption5: {
    flexDirection: "row",
    width: "100%",
    height: height * 0.055,
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  tagPeopleText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#949494",
  },
  taggedUserRow: {
    marginTop: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  taggedUser: {
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    paddingRight: 10,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 25,
  },
  taggedUserAvatar: {
    width: 30,
    height: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  taggedUserName: {
    marginLeft: 10,
    fontSize: 10,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  postOptionLeft: {
    flexDirection: "row",
    flex: 1,
    marginLeft: 10,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#949494",
  },
  hashtagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop:5,
  },
  shareButton: {
    backgroundColor: "#02130B",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 20,
    marginHorizontal: 10,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 20,
  },
  attachText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
    color: "#949494",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#949494",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
  },
  retryButton: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
});

export default NewGroupActivityPost;