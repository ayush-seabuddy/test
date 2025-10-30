import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Modal,
} from "react-native";
const { height, width } = Dimensions.get("screen");
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import NotificationHeader from "../component/headers/ProfileHeader/NotificationHeader";
import { apiCallWithToken, apiServerUrl } from "../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from "react-native-gesture-handler";
import axios from "axios";
import Toast from "react-native-simple-toast";
import api from "../CustomAxios";

// Memoized ParsedText component - optimized with areEqual
const ParsedText = React.memo(
  ({ content, style }) => {
    const parts = useMemo(() => content.split(/(\*\*.*?\*\*|\*.*?\*)/g), [content]);

    return (
      <Text style={style}>
        {parts.map((part, index) =>
          /^\*\*(.*?)\*\*$/.test(part) ? (
            <Text key={index} style={[style, { fontWeight: "bold" }]}>
              {part.replace(/\*\*/g, "")}
            </Text>
          ) : /^\*(.*?)\*$/.test(part) ? (
            <Text key={index} style={[style, { fontWeight: "bold" }]}>
              {part.replace(/\*/g, "")}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          )
        )}
      </Text>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

// FIXED: Notification Item - use status for initial styling
const NotificationItem = React.memo(
  ({ item, onPress, onDelete, calculateTimeSince }) => {
    // FIXED: Use status string field for styling (initial fetch)
    const isRead = item.status === "READ";
    const truncatedTitle = useMemo(() => {
      const timeLabel = calculateTimeSince(item.updatedAt);
      const maxLength = timeLabel === "Just now" ? 25 : 30;
      return item.title.length > maxLength
        ? `${item.title.slice(0, maxLength)}...`
        : item.title;
    }, [item.title, item.updatedAt, calculateTimeSince]);

    const renderRightActions = useCallback(
      () => (
        <View style={styles.deleteView}>
          <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteAction}>
            <Ionicons name="trash-outline" size={30} color="white" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ),
      [onDelete, item.id]
    );

    const handlePress = useCallback(() => onPress(item), [onPress, item]);

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
          <View
            style={[styles.card, isRead ? styles.readCard : styles.unreadCard]}
          >
            <View style={styles.cardInner}>
              <View style={styles.contentContainer}>
                <Text numberOfLines={1} style={styles.title}>
                  {truncatedTitle}
                </Text>
                <ParsedText content={item.content} style={styles.content} />
              </View>
              <Text style={styles.time}>{calculateTimeSince(item.updatedAt)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  },
  (prev, next) =>
    prev.item.id === next.item.id && prev.item.status === next.item.status
);

// Memoized Empty State Component
const EmptyState = React.memo(() => (
  <View style={styles.emptyContainer}>
    <Image
      source={require("../assets/images/AnotherImage/no-content.png")}
      style={styles.emptyImage}
    />
    <Text style={styles.emptyText}>No notification found</Text>
  </View>
));

// Memoized Loader Footer
const LoaderFooter = React.memo(() => (
  <View style={styles.loaderFooter}>
    <ActivityIndicator size="large" color="#000" />
  </View>
));

// No More Items Footer
const NoMoreFooter = React.memo(() => (
  <View style={styles.noMoreFooter}>
    <Text style={styles.noMoreText}>No more notifications</Text>
  </View>
));

const Notifications = React.memo(
  ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);
    const [markAllAsReadModalVisible, setMarkAllAsReadModalVisible] = useState(false);
    const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [notificationDetailModalVisible, setNotificationDetailModalVisible] = useState(false);

    // Optimized time calculation with memoization
    const calculateTimeSince = useCallback((updatedAt) => {
      const diffInMinutes = Math.floor(
        (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60)
      );

      if (diffInMinutes === 0) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }, []);

    // Single toast function for simple messages using react-native-simple-toast
    const showToast = useCallback(
      (message, type = "success") => {
        const duration = 2000;
        const position = "top";

        if (type === "success") {
          Toast.show(message, Toast.LONG, position, () => { }, duration);
        } else if (type === "error") {
          Toast.showWithGravityAndOffset(message, Toast.LONG, position, 50, 50);
        }
      },
      []
    );

    // Ultra-fast single delete with optimistic update
    const handleDelete = useCallback(
      async (id) => {
        const currentNotifications = [...notifications];
        const notificationIndex = currentNotifications.findIndex(
          (item) => item.id === id
        );

        if (notificationIndex === -1) return;

        setNotifications((prev) => prev.filter((item) => item.id !== id));

        try {
          const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
          await axios.delete(`${apiServerUrl}/user/clearNotifications`, {
            headers: { authToken: userDetails.authToken },
            params: { notificationId: id },
            timeout: 3000,
          });

          showToast("Notification has been deleted successfully.", "success");
        } catch (error) {
          // Revert on error
          setNotifications(currentNotifications);
          showToast("Failed to delete", "error");
          GetAllNotification(false);
        }
      },
      [notifications, showToast, GetAllNotification]
    );

    // FIXED: Navigation handler - instant color change + API call
    const handleNavigation = useCallback(
      async (item) => {
        const pageType = item?.data?.page;

        // FIXED: Instant color change for unread notifications using status
        if (item.status !== "READ") {
          setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, status: "READ" } : n))
          );
        }

        // Handle UPDATE type notifications
        if (pageType === "UPDATE") {
          try {
            const url = Platform.OS === "ios" ? item.data.iosUrl : item.data.androidUrl;
            if (url) {
              await Linking.openURL(url);
            } else {
              showToast("No valid URL provided for this update", "error");
            }
          } catch (error) {
            console.log("Error opening URL:", error);
            showToast("Failed to open update URL", "error");
          }
          return;
        }

        // Existing logic for other page types
        if (pageType === "CONTENT") {
          try {
            const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
            const response = await apiCallWithToken(
              `${apiServerUrl}/content/viewContentDetails?contentId=${item.data.id}`,
              "GET",
              null,
              userDetails.authToken
            );

            if (response.responseCode === 200 && response.result.id) {
              const { contentType } = item.data;
              if (contentType === "VIDEO") {
                navigation.navigate("VideosDetails", { item: item.data });
              } else if (contentType === "ARTICLE") {
                navigation.navigate("ArticlesDetails", { dataItem: response.result });
              } else if (contentType === "MUSIC") {
                navigation.navigate("MusicPlayer", { item: item.data });
              } else {
                navigation.navigate("AnouncementDetails", { item: item.data });
              }
            } else {
              setSelectedNotification({
                title: "Post not found",
                content: "This post is not available anymore",
              });
              setNotificationDetailModalVisible(true);
            }
          } catch (error) {
            console.log("Navigation error:", error);
          }
        } else if (pageType === "HANGOUT") {
          try {
            const authToken = await AsyncStorage.getItem("authToken");
            if (!authToken) return;

            const response = await apiCallWithToken(
              `${apiServerUrl}/user/getAllHangoutPost?page=1&limit=1&postId=${item.data.id}`,
              "GET",
              null,
              authToken
            );

            const hangouts = response?.result?.hangoutsList || [];
            if (hangouts[0]?.id === item.data.id) {
              navigation.navigate("SinglePost", {
                screen: "SeaBuddy",
                params: { name: "hangout", postData: hangouts[0] },
              });
            } else {
              setSelectedNotification({
                title: "Post not found",
                content: "This post is not available anymore",
              });
              setNotificationDetailModalVisible(true);
            }
          } catch (error) {
            console.log("Hangout navigation error:", error);
          }
        } else if (pageType === "GROUP_ACTIVITY") {
          try {
            const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
            const response = await api.get(
              `${apiServerUrl}/activity/viewGroupActivityDetails`,
              {
                headers: { authToken: userDetails.authToken },
                params: { eventId: item.data.id },
              }
            );
            if (response?.data?.responseCode === 200) {
              navigation.push("WorkoutBuddies", { item: { id: item.data.id } });
            } else {
              setSelectedNotification({
                title: "BuddyUp Event not found.",
                content: "This BuddyUp Event is not available anymore",
              });
              setNotificationDetailModalVisible(true);
              return;
            }
          } catch (error) {
            setSelectedNotification({
              title: "BuddyUp Event not found.",
              content: "This BuddyUp Event is not available anymore",
            });
            setNotificationDetailModalVisible(true);
          }
        } else if (pageType === "ONBOARD") {
          navigation.navigate("CrewList");
        } else if (pageType === "HAPPINESS") {
          navigation.navigate("HappinessIndex");
        } else if (pageType === "POMS") {
          navigation.navigate("POMSTest");
        } else {
          setSelectedNotification(item);
          setNotificationDetailModalVisible(true);
        }
      },
      [navigation, showToast] // Add showToast to dependencies
    );

    // FIXED: Read single notification - update status field
    const readSingleNotification = useCallback(
      async (item) => {
        const id = item.id;

        try {
          const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
          await axios.put(
            `${apiServerUrl}/user/readSingelNotification`,
            null,
            {
              headers: { authToken: userDetails.authToken },
              params: { notificationId: id },
              timeout: 3000,
            }
          );

          // FIXED: Update status field for UI
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
          );
          handleNavigation(item);
        } catch (error) {
          console.log("Read error:", error);
          showToast("Failed to mark as read", "error");
          // Revert on error
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, status: item.status } : n))
          );
        }
      },
      [handleNavigation, showToast]
    );

    // FIXED: Read all - instant UI update using status
    const readAllNotification = useCallback(
      async () => {
        // FIXED: INSTANT UI UPDATE - all cards turn white immediately using status
        const unreadCount = notifications.filter((n) => n.status !== "READ").length;

        if (unreadCount === 0) {
          setMarkAllAsReadModalVisible(false);
          showToast("All notifications are already read", "success");
          return;
        }

        // INSTANT: Update all cards status to READ
        setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));

        try {
          const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
          await axios.put(
            `${apiServerUrl}/user/readAllNotification`,
            null,
            {
              headers: { authToken: userDetails.authToken },
              timeout: 3000,
            }
          );

          setMarkAllAsReadModalVisible(false);
          showToast("All notifications marked as read", "success");
        } catch (error) {
          console.log("Read all error:", error);
          showToast("Failed to mark all as read", "error");
          // Revert on error
          setNotifications((prev) =>
            prev.map((n) => ({
              ...n,
              status: n.status, // Restore original status
            }))
          );
        }
      },
      [notifications, showToast]
    );

    // Fast delete all - no loading overlay, only toast
    const handleDeleteAllNotification = useCallback(
      async () => {
        const currentNotifications = [...notifications];
        setNotifications([]);

        try {
          const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
          await axios.delete(`${apiServerUrl}/user/clearNotifications`, {
            headers: { authToken: userDetails.authToken },
            timeout: 3000,
          });
          setDeleteAllModalVisible(false);
          showToast("All notifications have been deleted successfully.", "success");
        } catch (error) {
          setNotifications(currentNotifications);
          showToast("Failed to delete all", "error");
          GetAllNotification(false);
        }
      },
      [notifications, showToast, GetAllNotification]
    );

    // FIXED: Data fetching - use status from API response for initial styling
    const GetAllNotification = useCallback(
      async (append = false) => {
        try {
          setDataLoading(true);
          const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));

          const response = await apiCallWithToken(
            `${apiServerUrl}/user/getAllNotifications?page=${page}&limit=10`,
            "GET",
            null,
            userDetails.authToken
          );

          // FIXED: Use status field directly from API for initial styling
          const newNotifications = (response.result.notificationsList || []).map(
            (item) => ({
              ...item,
              status: item.status || "ACTIVE", // Ensure status is set
            })
          );

          let updatedNotifications;

          if (append) {
            updatedNotifications = [...notifications, ...newNotifications]
              .filter(
                (item, idx, arr) => idx === arr.findIndex((t) => t.id === item.id)
              )
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          } else {
            updatedNotifications = [...newNotifications].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
          }

          setNotifications(updatedNotifications);
          setHasMore(response.result.currentPage < response.result.totalPages);
        } catch (error) {
          console.error("Fetch error:", error);
          showToast("Failed to load notifications", "error");
        } finally {
          setDataLoading(false);
        }
      },
      [page, notifications, showToast]
    );

    const handleLoadMore = useCallback(() => {
      if (hasMore && !dataLoading) {
        setPage((p) => {
          GetAllNotification(true);
          return p + 1;
        });
      }
    }, [hasMore, dataLoading, GetAllNotification]);

    // FIXED: renderItem - use status for read/unread logic
    const renderItem = useCallback(
      ({ item }) => {
        return (
          <NotificationItem
            item={item}
            onPress={item.status !== "READ" ? readSingleNotification : handleNavigation}
            onDelete={handleDelete}
            calculateTimeSince={calculateTimeSince}
          />
        );
      },
      [readSingleNotification, handleNavigation, handleDelete, calculateTimeSince]
    );

    const keyExtractor = useCallback(
      (item) => item.id?.toString() || Math.random().toString(),
      []
    );

    // Initial load effect
    useEffect(() => {
      GetAllNotification(false);
    }, []);

    const listData = useMemo(() => notifications, [notifications]);
    const isEmpty = useMemo(
      () => listData.length === 0 && !dataLoading,
      [listData.length, dataLoading]
    );
    const footerComponent = useMemo(() => {
      if (dataLoading) return <LoaderFooter />;
      if (!hasMore && listData.length > 0) return <NoMoreFooter />;
      return null;
    }, [dataLoading, hasMore, listData.length]);

    return (
      <>
        <FocusAwareStatusBar
          barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
          backgroundColor={Colors.white}
          hidden={false}
        />

        <NotificationHeader
          title="Notifications"
          navigation={navigation}
          modalVisible={deleteAllModalVisible}
          setModalVisible={setDeleteAllModalVisible}
          markAllAsReadModalVisible={markAllAsReadModalVisible}
          setMarkAllAsReadModalVisible={setMarkAllAsReadModalVisible}
          Notification={listData}
        />

        {isEmpty ? (
          <EmptyState />
        ) : (
          <FlatList
            data={listData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={15}
            removeClippedSubviews={true}
            onEndReachedThreshold={0.3}
            onEndReached={handleLoadMore}
            ListFooterComponent={footerComponent}
            getItemLayout={(data, index) => ({
              length: 120,
              offset: 120 * index,
              index,
            })}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Delete All Modal - Optimized */}
        <Modal
          visible={deleteAllModalVisible}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete All Notifications?</Text>
              <Text style={styles.modalSubText}>This action cannot be undone.</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setDeleteAllModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteAllNotification}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteText}>Delete All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Detail Modal - Optimized */}
        <Modal
          visible={notificationDetailModalVisible}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailModal}>
              <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
              <ParsedText
                content={selectedNotification?.content || ""}
                style={styles.detailContent}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setNotificationDetailModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Mark All Read Modal - Optimized */}
        <Modal
          visible={markAllAsReadModalVisible && !dataLoading}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Mark All as Read?</Text>
               <Text style={styles.modalSubText}>This will mark all your notifications as read.</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setMarkAllAsReadModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelText,{fontSize: 13}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.readButton, dataLoading && styles.disabledButton]}
                  onPress={readAllNotification}
                  disabled={dataLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.readText}>
                    {dataLoading ? "Processing..." : "Mark All Read"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  },
  (prev, next) => prev.navigation === next.navigation
);

const styles = StyleSheet.create({
  card: {
    width: width - 30,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#cbcaca",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "white",
  },
  unreadCard: { backgroundColor: "rgba(243, 250, 217, 0.7)" },
  readCard: { backgroundColor: "white" },
  cardInner: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  contentContainer: { flex: 1, marginRight: 12 },
  title: {
    color: "#161616",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    fontWeight: "500",
    marginBottom: 4,
  },
  content: {
    color: "#636363",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    fontWeight: "400",
    lineHeight: 14,
  },
  time: {
    color: "#161616",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    fontWeight: "500",
    textAlign: "right",
    minWidth: 40,
  },
  deleteView: {
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    width: 100,
    marginVertical: 10,
    marginRight: 15,
    borderRadius: 10,
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.1,
    width: 100,
  },
  deleteText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyImage: { height: 100, width: 100, marginBottom: 16 },
  emptyText: {
    fontSize: 24,
    fontWeight: "500",
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  noMoreFooter: {
    paddingVertical: 16,
    alignItems: "center",
  },
  noMoreText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width * 0.8,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent:'center',
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  modalSubText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 16,
    color: "#666",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical:10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent:'center',
    borderColor: "#e9ecef",
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    marginLeft:10,
    paddingVertical:10,
    backgroundColor: "#ff3b30",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent:'center',
    borderColor: "#e9ecef",
    alignItems: "center",
  },
  readButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    justifyContent:'center',
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
  cancelText: {
    color: "#333",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
  },
  deleteText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    fontWeight: "600",
  },
  readText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    fontWeight: "600",
  },
  detailModal: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
    maxHeight: height * 0.6,
  },
  detailContent: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    width:'100%'
  },
  closeText: {
    fontFamily: "Poppins-SemiBold",
    color: "white",
    textAlign:'center',
    fontWeight: "600",
    fontSize: 12,
  },
});

export default Notifications;