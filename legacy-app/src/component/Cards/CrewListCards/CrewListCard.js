import React, { useCallback, useState } from "react";
import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiServerUrl } from "../../../Api";

const CrewListCard = ({ item, fetchUserList, department , allUser}) => {
 
  if (!item) return null;

  const [data, setData] = useState({});
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false); // New state for options modal

  const navigation = useNavigation();

  const getUserDetails = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (dbResult !== null) {
        const userDetails = JSON.parse(dbResult);
        setData(userDetails);
      } else {
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUserDetails();
    }, [])
  );

  const handleOnBoardUser = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      const response = await axios({
        method: "PUT",
        url: `${apiServerUrl}/user/updateShipBoardingStatus`,
        headers: {
          authToken: userDetails.authToken,
        },
        data: {
          shipId: data.shipId,
          boardedStatus: [
            {
              userId: item.id,
              isBoarded: item.isBoarded ? false : true,
            },
          ],
        },
      });

      if (response.data.responseCode === 200) {
        fetchUserList(department);
      } else {
        console.log("API response error", response.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error during API call:", error.response?.data || error.message);
    } finally {
      closeExitModal();
    }
  };

  const handleRemoveFromShip = async ( ) => {
    try {
      let newUserLists = allUser.filter(
        (user) => user.id !== item.id
      ).map((user) => {
        return { userId: user.id }
      })

      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      newUserLists.push({
        userId: userDetails.id})
      const response = await axios({
        method: "POST",
        url: `${apiServerUrl}/company/addUpdateShip`,
        headers: {
          authToken: userDetails.authToken,
        },
        data: {
          shipId: data.shipId,
          crewMembers: newUserLists,
          employerId: data.employerId
        },
      });

      if (response.data.responseCode === 200) {
        fetchUserList(department);
      } else {
        console.log("API response error", response.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error removing user:", error.response?.data || error.message);
    } finally {
      closeRemoveModal();
    }
  };

  const closeExitModal = () => setExitModalVisible(false);
  const closeRemoveModal = () => setRemoveModalVisible(false);
  const closeOptionsModal = () => setOptionsModalVisible(false);

  const handleCardPress = () => {
    navigation.navigate("CrewProfile", { item });
  };

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        onPress={handleCardPress}
        style={styles.cardContainer}
        activeOpacity={1}
      >
        <View style={styles.cardContent}>
          <Image
            style={styles.profileImage}
            resizeMode="cover"
            source={{
              uri:
                item?.profileUrl ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
            }}
          />
          {item.isBoarded && <View style={styles.boardedIndicator} />}
          <View>
            <Text style={styles.fullName}>{item.fullName || ""}</Text>
            <Text style={styles.designation}>{item.designation || ""}</Text>
            <View style={styles.tagsContainer}>
              {Array.isArray(item.favoriteActivity) &&
                item.favoriteActivity.slice(0, 1).map((activity, index) => (
                  <Text key={index} style={styles.tag}>
                    {activity}
                  </Text>
                ))}
              {Array.isArray(item.hobbies) &&
                item.hobbies.slice(0, 1).map((hobby, index) => (
                  <Text key={index} style={styles.tag}>
                    {hobby}
                  </Text>
                ))}
            </View>
          </View>
        </View>

        {data?.designation === "Captain" && (
          <TouchableOpacity
            onPress={() =>{ 
              if(item.isBoarded) setExitModalVisible(true);
              else setOptionsModalVisible(true);
            }}
            style={styles.dotsButton}
          >
            <Image
              style={styles.dotsIcon}
              tintColor={"rgba(148, 148, 148, 1)"}
              source={ImagesAssets.dots}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={closeOptionsModal}
      >
        <TouchableWithoutFeedback onPress={closeOptionsModal}>
          <View style={styles.modalOverlay}>
            <StatusBar backgroundColor={"rgba(0, 0, 0, 0.6)"} />
            <View style={styles.optionsModalContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setExitModalVisible(true);
                  closeOptionsModal();
                }}
              >
                <Text style={styles.menuText}>
                  {item.isBoarded ? "Offboard" : "Onboard"} User
                </Text>
              </TouchableOpacity>
              {!item.isBoarded && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setRemoveModalVisible(true);
                    closeOptionsModal();
                  }}
                >
                  <Text style={styles.menuText}>Remove from Ship</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Onboard/Offboard Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={exitModalVisible}
        onRequestClose={closeExitModal}
      >
        <TouchableWithoutFeedback onPress={closeExitModal}>
          <View style={styles.modalOverlay}>
            <StatusBar backgroundColor={"rgba(0, 0, 0, 0.6)"} />
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {item.isBoarded ? "Offboard" : "Onboard"} Crew
              </Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to {item.isBoarded ? "offboard" : "onboard"} this crew?
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeExitModal}>
                  <Text style={styles.cancelButtonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exitButton} onPress={handleOnBoardUser}>
                  <Text style={styles.exitButtonText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Remove from Ship Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={removeModalVisible}
        onRequestClose={closeRemoveModal}
      >
        <TouchableWithoutFeedback onPress={closeRemoveModal}>
          <View style={styles.modalOverlay}>
            <StatusBar backgroundColor={"rgba(0, 0, 0, 0.6)"} />
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Remove from Ship</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to remove this user from the ship?
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeRemoveModal}>
                  <Text style={styles.cancelButtonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exitButton} onPress={handleRemoveFromShip}>
                  <Text style={styles.exitButtonText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: "relative",
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    width: "100%",
    padding: 16,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderColor: "rgba(232, 232, 232, 1)",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  profileImage: {
    height: 40,
    width: 40,
    borderRadius: 16,
  },
  boardedIndicator: {
    height: 12,
    width: 12,
    borderRadius: 24,
    backgroundColor: "#8DAF02",
    position: "absolute",
    top: 0,
    left: 0,
  },
  fullName: {
    fontSize: 14,
    color: "rgba(99, 99, 99, 1)",
    fontFamily: "Poppins-Medium",
    fontWeight: "500",
    lineHeight: 21,
  },
  designation: {
    fontSize: 10,
    color: "#636363",
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
    lineHeight: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tag: {
    fontSize: 8,
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
    lineHeight: 11.2,
    backgroundColor: "rgba(243, 250, 217, 1)",
    borderRadius: 32,
    paddingVertical: 4,
    paddingHorizontal: 6,
    textAlign: "center",
    marginRight: 4,
  },
  dotsButton: {
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  dotsIcon: {
    width: 16,
    height: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsModalContainer: {
    width: "60%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  menuItem: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(232, 232, 232, 1)",
    alignItems: "center",
  },
  menuText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#333333",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 26,
    color: "#333333",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666666",
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
    textAlign: "center",
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#cccccc",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333333",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
    fontSize: 16,
    fontWeight: "600",
  },
  exitButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#042013",
    alignItems: "center",
  },
  exitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
  },
});

export default CrewListCard;