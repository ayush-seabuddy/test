import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import DoctorProfileHeader from "../component/headers/HelpLineScreensHeader/DoctorProfileHeader";
import WorkoutBuddiesCrds from "../component/Cards/WorkoutBuddiesCrds";
import WorkoutBuddiesHeader from "../component/headers/WorkoutBuddiesHeader";
import { useFocusEffect } from "@react-navigation/native";
import { apiServerUrl } from "../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Loader from "../component/Loader";
import Toast from "react-native-toast-message";
import { Modal } from "react-native-paper";
import api from "../CustomAxios";
import { useTranslation } from "react-i18next";
const { width, height } = Dimensions.get("window");

const WorkoutBuddies = ({ navigation, route }) => {
  let { activity, item } = route.params;
  if (!activity && item) {
    activity = item;
  }
  const [isJoined, setIsJoined] = useState(false);
  const [joinedPeople, setJoinedPeople] = useState([]);
  const [userDetails, setUserdetails] = useState({});
  const [isAnotherUserJoined, setIsAnotherUserJoined] = useState(null);
  const [isEventEnded, setIsEventEnded] = useState(false);
  const [isEventStarted, setIsEventStarted] = useState(false);
  const [eventDetail, setEventDetail] = useState({});
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [peopleDetails, setPeopleDetails] = useState();
  const [notificationDetailModalVisible, setNotificationDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { t } = useTranslation();
  const handleApporve = async () => {
    navigation.navigate("AppNav", {
      screen: "ApprovalFromCaptain",
      params: { eventId: activity.id, isCaptain: false },
    });
  };

  const handleApporveFromCaptain = async () => {
    navigation.navigate("AppNav", {
      screen: "ApprovalFromCaptain",
      params: { eventId: activity.id, isCaptain: true },
    });
  };

  const handleApporvalGivenByUser = async (status) => {
    const authToken = await AsyncStorage.getItem("authToken");
    setLoading(true);
    try {
      const response = await axios({
        method: "POST",
        url: `${apiServerUrl}/activity/addUpdateGroupActivity`,
        headers: {
          authToken: authToken,
        },
        data: {
          groupActivities: [
            {
              eventId: activity.id,
              status: status,
            },
          ],
        },
      });

      if (response.data.responseCode === 200) {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error creating post:", error?.response?.data);
      if (error?.response?.data) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            error.response.data.responseMessage ||
            "No offline data found. Please connect to the internet.",
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinButtonPress = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      if (!dbResult) {
        return;
      }
      setUserdetails(userDetails);

      let item;
      try {
        item =
          typeof activity === "string"
            ? JSON.parse(decodeURIComponent(activity))
            : activity;
      } catch (error) {
        console.error("❌ Error parsing activity:", error);
        return;
      }

      if (!item?.id) {
        console.error("❌ No valid activity ID found, aborting request.");
        return;
      }

      const joinPeople = [...joinedPeople, userDetails.id];

      const response = await axios({
        method: "POST",
        url: `${apiServerUrl}/activity/addUpdateGroupActivity`,
        headers: {
          authToken: userDetails.authToken,
        },
        data: {
          groupActivities: [
            {
              eventId: item.id,
              joinedPeople: joinPeople,
            },
          ],
        },
      });

      if (response.data.responseCode === 200) {
        setReload(true);
        GetDetails();
      }
    } catch (error) {
      console.log("API Error:", error.response?.data || error.message);
    }
  };

  const GetDetails = async () => {
    setLoading(true);
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) {
        return;
      }

      const userDetails = JSON.parse(dbResult);
      setUserdetails(userDetails);

      let item;
      try {
        item =
          typeof activity === "string"
            ? JSON.parse(decodeURIComponent(activity))
            : activity;
      } catch (error) {
        console.error("❌ Error parsing activity:", error);
        return;
      }

      if (!item?.id) {
        return;
      }

      const response = await api.get(
        `${apiServerUrl}/activity/viewGroupActivityDetails`,
        {
          headers: { authToken: userDetails.authToken },
          params: { eventId: item.id },
        }
      );

      if (response?.data?.responseCode === 200) {
        const eventData = response.data.result;
        if (!eventData.id) {
          let newData = { title: "Post not found", content: "This post is not available anymore" };
          setSelectedNotification(newData);
          setNotificationDetailModalVisible(true);
          return;
        }

        const joinedPeopleList = Array.isArray(eventData.joinedPeople)
          ? eventData.joinedPeople
          : [];
        const currentTime = new Date();
        const startTime = new Date(eventData.startDateTime);
        const endTime = new Date(eventData.endDateTime);

        setJoinedPeople(joinedPeopleList);
        setIsAnotherUserJoined(joinedPeopleList.includes(userDetails.id));
        setIsJoined(userDetails.id === eventData.userId);
        setPeopleDetails(eventData);
        setIsEventEnded(eventData.isEnded);
        setIsEventStarted(eventData.isStarted);
        setEventDetail(eventData);
      }
    } catch (error) {
      console.error(
        "Error fetching details:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetDetails();
  }, []);

  return (
    <View style={styles.uploadPhoto}>
      {loading && <Loader isLoading={loading} />}
      <WorkoutBuddiesHeader
        navigation={navigation}
        headername={t('activityDetails')}
      />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      <View style={styles.bottomCard}>
        <Image
          style={{ width: width, height: "100%" }}
          resizeMode="cover"
          source={
            eventDetail?.imageUrls
              ? { uri: eventDetail?.imageUrls[0] }
              : ""
          }
        />
      </View>
      {/* Join Button */}
      <View style={{ paddingHorizontal: 16, paddingBottom: "7%", position: "absolute", bottom: 0, width: "100%" }}>
        {(userDetails && (userDetails.designation === "Captain" || userDetails.designation === "Chief engineer")) ? (
          isJoined ? (
            isEventEnded ? (
              joinedPeople.length === 0 ? (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() =>
                    navigation.navigate("CreateGroupActivity", {
                      eventId: eventDetail.id,
                      eventName: eventDetail.eventName,
                      description: eventDetail.description,
                      location: eventDetail.location,
                      hashtags: eventDetail.hashtags || [],
                      isPublic: eventDetail.isPublic,
                      startDateTime: eventDetail.startDateTime,
                      endDateTime: eventDetail.endDateTime,
                      imageUrls: eventDetail.imageUrls || [],
                      taggedUsers: eventDetail.invitedPeoples || [],
                      categoryId: eventDetail.categoryId,
                    })
                  }
                >
                  <Text style={styles.submitButtonText}>{t('pendingreschedule')}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleApporveFromCaptain}
                  disabled={eventDetail.status === "COMPLETED"}
                >
                  <Text style={styles.submitButtonText}>
                    {eventDetail.status === "COMPLETED" ? t('completed') : t('markascomplete')}
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: "#E6EBE9",
                    borderWidth: 1,
                    borderColor: "#676E7629",
                  },
                ]}
                disabled={true}
              >
                <Text style={styles.submitButtonText}>{t('joined')}</Text>
              </TouchableOpacity>
            )
          ) : isEventEnded ? (
            eventDetail.status === "REQUESTED" ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={{
                    width: "48%",
                    paddingVertical: 13,
                    borderRadius: 10,
                    backgroundColor: "red",
                    alignItems: "center",
                    marginTop: "75%",
                  }}
                  onPress={() => handleApporvalGivenByUser("REJECTED")}
                >
                  <Text style={styles.submitButtonText}>{t('reject')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: "48%",
                    paddingVertical: 13,
                    borderRadius: 10,
                    backgroundColor: "#02130b",
                    alignItems: "center",
                    marginTop: "75%",
                  }}
                  onPress={() => handleApporvalGivenByUser("COMPLETED")}
                >
                  <Text style={styles.submitButtonText}>{t('approve')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: "#E6EBE9",
                    borderWidth: 1,
                    borderColor: "#676E7629",
                  },
                ]}
                disabled={true}
              >
                <Text style={styles.submitButtonText}>
                  {eventDetail.isJoined ? t('joined') : t('join')}
                </Text>
              </TouchableOpacity>
            )
          ) : isEventStarted ? (
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: "#E6EBE9",
                  borderWidth: 1,
                  borderColor: "#676E7629",
                },
              ]}
              disabled={true}
            >
              <Text style={styles.submitButtonText}>
                {eventDetail.isJoined ? t('joined') : t('join')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                eventDetail.isJoined && {
                  backgroundColor: "#E6EBE9",
                  borderWidth: 1,
                  borderColor: "#676E7629",
                },
              ]}
              onPress={handleJoinButtonPress}
              disabled={eventDetail.isJoined}
            >
              <Text style={styles.submitButtonText}>
                {eventDetail.isJoined ? t('joined') : t('join')}
              </Text>
            </TouchableOpacity>
          )
        ) : isJoined ? (
          isEventEnded ? (
            <TouchableOpacity
              style={[
                styles.submitButton,
                eventDetail.status === "REQUESTED" && {
                  backgroundColor: "#E6EBE9",
                  borderWidth: 1,
                  borderColor: "#676E7629",
                },
              ]}
              disabled={eventDetail.status === "REQUESTED" || eventDetail.status === "COMPLETED"}
              onPress={handleApporve}
            >
              <Text style={styles.submitButtonText}>
                {eventDetail.status === "COMPLETED"
                  ? "Completed"
                  : eventDetail.status === "REQUESTED"
                    ? "Requested For Approval"
                    : "Request For Approval"}
              </Text>
            </TouchableOpacity>
          ) : isEventStarted ? (
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: "#E6EBE9",
                  borderWidth: 1,
                  borderColor: "#676E7629",
                },
              ]}
              disabled={true}
            >
              <Text style={styles.submitButtonText}>
                {eventDetail.isJoined ? t('joined') : t('join')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                isJoined && {
                  backgroundColor: "#E6EBE9",
                  borderWidth: 1,
                  borderColor: "#676E7629",
                },
              ]}
              onPress={handleJoinButtonPress}
              disabled={isJoined}
            >
              <Text style={styles.submitButtonText}>
                {isJoined ? t('joined') : t('join')}
              </Text>
            </TouchableOpacity>
          )
        ) : isEventStarted ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: "#E6EBE9",
                borderWidth: 1,
                borderColor: "#676E7629",
              },
            ]}
            disabled={true}
          >
            <Text style={styles.submitButtonText}>
              {eventDetail.isJoined ? t('joined') : t('join')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.submitButton,
              isAnotherUserJoined && {
                backgroundColor: "#E6EBE9",
                borderWidth: 1,
                borderColor: "#676E7629",
              },
            ]}
            onPress={handleJoinButtonPress}
            disabled={isAnotherUserJoined}
          >
            <Text
              style={[
                styles.submitButtonText,
                isAnotherUserJoined && { color: "white" },
              ]}
            >
              {isAnotherUserJoined ? t('joined') : t('join')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          flex: 1,
          position: "absolute",
          zIndex: -1,
          width: "100%",
        }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={{ width: "100%", height: "100%" }}>
            {eventDetail && Object.keys(eventDetail).length > 0 && (
              <WorkoutBuddiesCrds
                setJoinedPeople={setJoinedPeople}
                setIsAnotherUserJoined={setIsAnotherUserJoined}
                setIsJoined={setIsJoined}
                setPeopleDetails={setPeopleDetails}
                setIsEventEnded={setIsEventEnded}
                setIsEventStarted={setIsEventStarted}
                setEventDetail={setEventDetail}
                activity={eventDetail}
                completionImages={eventDetail.completionImages}
                reload={reload}
                setReload={setReload}
              />
            )}
          </View>
        </ScrollView>
        <Modal
          visible={notificationDetailModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setNotificationDetailModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.notificationDetailModal}>
              <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
              <Text style={styles.modalContent}>{selectedNotification?.content}</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  uploadPhoto: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bottomCard: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
    height: "46%",
    overflow: "hidden",
    paddingHorizontal: 16,
    elevation: -5,
    zIndex: -1,
  },
  submitButton: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#02130b",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
  imageContainer: {
    borderRadius: 10,
    overflow: "hidden",
    width: width - 28,
  },
  imageStyle: {
    width: width - 28,
    height: 400,
  },
  notificationDetailModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
    height: "60%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default WorkoutBuddies;