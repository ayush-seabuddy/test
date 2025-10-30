import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  Modal,
  StatusBar,
  Platform,
} from "react-native";
import FastImage from "react-native-fast-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import axios from "axios";
import { apiCallWithToken, apiServerUrl } from "../../Api"; // Adjust path if needed

const DeleteConfirmationModal = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <StatusBar backgroundColor={"rgba(0, 0, 0, 0.7)"} />
        <View style={styles.modalContainer}>
          <Text style={styles.titleText}>Delete Activity</Text>
          <Text style={styles.descriptionText}>
            Are you sure you want to delete this activity? This action cannot be undone.
          </Text>
          <View style={[styles.buttonContainer, { justifyContent: "space-between" }]}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const GroupActivity = ({ navigation, activity, screenName, onDelete }) => {
  const [isCreatedByMe, setIsCreatedByMe] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); // Local menu state

  useEffect(() => {
    const checkIfCreatedByMe = async () => {
      try {
        const dbResult = await AsyncStorage.getItem("userDetails");
        if (!dbResult) return;

        const userDetails = JSON.parse(dbResult);

        if (String(userDetails?.id) === String(activity?.activityUser?.id)) {
          setIsCreatedByMe(true);
        }
      } catch (error) {
        console.error("Error fetching userDetails from AsyncStorage:", error);
      }
    };

    checkIfCreatedByMe();
  }, [activity]);

  // Toggle menu visibility
  const handleMenuToggle = useCallback(
    (event) => {
      event.stopPropagation(); // Prevent parent Pressable's onPress
      setMenuVisible(!menuVisible); // Toggle local menu state
    },
    [menuVisible]
  );

  // Handle Edit action
  const handleEdit = useCallback(
    (event) => {
      event.stopPropagation();
      setMenuVisible(false); // Close menu

      const params = {
        eventId: activity.id,
        imageUrls: activity.imageUrls || [],
        taggedUsers: activity.invitedPeoples || [],
        hashtags: activity.hashtags || [],
        categoryName: activity?.groupActivityCategory?.categoryName || "",
        description: activity.description || "",
        location: activity.location || "",
        startDateTime: activity.startDateTime || "",
        endDateTime: activity.endDateTime || "",
        isPublic: activity.isPublic !== undefined ? activity.isPublic : true,
        categoryId: activity.categoryId || activity.groupActivityCategory?.id || "",
      };

      console.log("Data sent to CreateGroupActivity:", params);

      navigation.navigate("CreateGroupActivity", params);
    },
    [navigation, activity]
  );

  // Handle Delete action
  const handleDelete = useCallback(
    (event) => {
      event.stopPropagation();
      setMenuVisible(false); // Close menu
      setDeleteModalVisible(true); // Show confirmation modal
    },
    []
  );

  // Handle Delete confirmation
  const confirmDelete = useCallback(async () => {
    setDeleteModalVisible(false);
    try {
      const userDetailsString = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(userDetailsString);
      if (!userDetails || !userDetails.authToken) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "User authentication failed. Please log in again.",
        });
        return;
      }

      const body = JSON.stringify({
        groupActivities: [
          {
            eventId: activity.id,
            status: "DELETE",
          },
        ],
      });

      console.log("📤 Deleting group activity:", body);

      let response;
      if (typeof apiCallWithToken === "function") {
        response = await apiCallWithToken(
          `${apiServerUrl}/activity/addUpdateGroupActivity`,
          "POST",
          body,
          userDetails.authToken
        );
      } else {
        console.warn("apiCallWithToken is not a function, falling back to axios");
        response = await axios({
          method: "POST",
          url: `${apiServerUrl}/activity/addUpdateGroupActivity`,
          data: JSON.parse(body),
          headers: {
            authToken: userDetails.authToken,
            "Content-Type": "application/json",
          },
        });
        response = response.data;
      }

      console.log("📥 API Response:", JSON.stringify(response, null, 2));

      if (response.responseCode === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Activity deleted successfully!",
        });
        onDelete(activity.id);
      } else {
        throw new Error(response.responseMessage || "Failed to delete activity.");
      }
    } catch (error) {
      console.error("❌ Error in handleDelete:", error.message, error.stack);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to delete activity.",
      });
    }
  }, [activity, navigation, onDelete]);

  // Handle Delete cancellation
  const cancelDelete = useCallback(() => {
    setDeleteModalVisible(false);
  }, []);

  // Handle outside press to close menu and navigate
  const handleOutsidePress = useCallback(
    (event) => {
      if (menuVisible) {
        setMenuVisible(false); // Close menu
      } else {
        navigation.push("WorkoutBuddies", { activity: { id: activity.id } });
      }
    },
    [menuVisible, navigation, activity]
  );

  return (
    <>
      <Pressable style={styles.cardContainer} onPress={handleOutsidePress}>
        <View style={styles.imageWrapper}>
          <FastImage
            style={styles.imageBackground}
            resizeMode="contain"
            source={
              activity?.imageUrls?.length > 0
                ? { uri: activity.imageUrls[0] }
                : ImagesAssets.health_card_image
            }
          />

          {isCreatedByMe && moment().isBefore(moment(activity?.startDateTime)) && (
            <View style={styles.menuWrapper}>
              <TouchableOpacity onPress={handleMenuToggle} style={styles.menuIcon}>
                <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
              </TouchableOpacity>

              {menuVisible && (
                <View
                  style={[
                    screenName === "huddle" || screenName === "ShowAllActivity"
                      ? {
                          position: "absolute",
                          top: screenName === 'huddle' ? 30 : 45,
                          right: screenName === 'huddle' ? 40 : 5,
                          backgroundColor: "#fff",
                          borderRadius: 8,
                          shadowColor: "#000",
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 5,
                          width: 130,
                          padding: 8,
                        }
             
                      : {
                          position: "absolute",
                          top: 45,
                          right: 4,
                          backgroundColor: "#fff",
                          borderRadius: 8,
                          shadowColor: "#000",
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 5,
                          width: 130,
                          padding: 8,
                        },
                  ]}
                >
                  <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                    <Ionicons name="create-outline" size={20} color="black" />
                    <Text style={styles.menuItemText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                    <Text style={[styles.menuItemText, { color: "red" }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>
            {activity?.eventName?.length > 20
              ? activity.eventName.substring(0, 20) + "..."
              : activity?.eventName || ""}
          </Text>

          {screenName === "huddle" && (
            <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
              Organized by{" "}
              {isCreatedByMe ? "You" : activity?.activityUser?.fullName || "Unknown"}
            </Text>
          )}

          <Text
            style={[styles.nameText, { flexWrap: "wrap" }]}
            ellipsizeMode="tail"
          >
            Start Date —{" "}
            {activity?.startDateTime
              ? moment(activity.startDateTime).format("D MMM YYYY, h:mm A")
              : "TBD"}
          </Text>
        </View>
      </Pressable>

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};
const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#F9F9F8",
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    borderColor: 'grey',
    borderWidth: Platform.OS === 'ios' ? 0.2 : null,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    overflow: "hidden",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 160,
  },
  imageBackground: {
    width: "100%",
    height: "100%",
  },
  menuWrapper: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  menuIcon: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    height: 35,
  },
  menuItemText: {
    fontSize: 14,
    marginLeft: 8,
    color: "black",
    fontFamily: "Poppins-Regular",
  },
  textContainer: {
    padding: 12,
  },
  titleText: {
    fontSize: 16,
    color: "#222",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 12,
    color: "grey",
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
    fontFamily: "Poppins-Regular",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Poppins-SemiBold",
  },
  deleteButton: {
    backgroundColor: "#ff0000",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
});

export default GroupActivity;