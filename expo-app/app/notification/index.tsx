import {
  deleteandclearallnotification,
  getallnotifications,
  readallnotifications,
  readsinglenotification,
} from "@/src/apis/apiService";
import CommonLoader from "@/src/components/CommonLoader";
import EmptyComponent from "@/src/components/EmptyComponent";
import { showToast } from "@/src/components/GlobalToast";
import { useNetwork } from "@/src/hooks/useNetworkStatusHook";
import Colors from "@/src/utils/Colors";
import { router } from "expo-router";
import {
  ChevronLeft,
  CircleCheckBig,
  CircleX,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const { height } = Dimensions.get("screen");
interface Notification {
  id: string;
  title: string;
  content: string;
  status: string;
  data: {
    id: string;
    page: string;
    type: string;
    androidUrl: string;
    iosUrl: string;
  };
  createdAt: string;
}

const NotificationScreen = () => {
  const { t } = useTranslation();
  const isOnline = useNetwork();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [markAllModalVisible, setMarkAllModalVisible] = useState(false);
  const [deleteSingleModalVisible, setDeleteSingleModalVisible] =
    useState(false);
  const [clearAllModalVisible, setClearAllModalVisible] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [notificationDetailModalVisible, setNotificationDetailModalVisible] =
    useState(false);

  const formatTimeSince = useCallback((createdAt: string) => {
    const diffInMinutes = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60),
    );

    if (diffInMinutes === 0) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  }, []);

  const fetchNotifications = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!isOnline) return;
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const response = await getallnotifications({
          page: pageNum,
          limit: 10,
        });

        if (response.success && response.status === 200) {
          const newNotifications = response.data.notificationsList || [];

          console.log(newNotifications);

          setNotifications((prev) => {
            if (!isLoadMore) {
              return newNotifications;
            }

            const existingIds = new Set(prev.map((notif) => notif.id));
            const uniqueNew = newNotifications.filter(
              (notif: Notification) => !existingIds.has(notif.id),
            );

            return [...prev, ...uniqueNew];
          });

          setHasMore(newNotifications.length === 10);
          setPage(pageNum);
        } else {
          showToast.error(
            t("oops"),
            response.message || t("somethingwentwrong"),
          );
        }
      } catch (error) {
        console.error("Fetch notifications error:", error);
        showToast.error(t("oops"), t("somethingwentwrong"));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [t],
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await readsinglenotification({ notificationId });

      if (response.success && response.status === 200) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, status: "READ" } : notif,
          ),
        );
      }
    } catch (error) {
      console.error("Mark single read error:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setLoading(true);
    try {
      const response = await readallnotifications();

      if (response.success && response.status === 200) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, status: "READ" })),
        );
        showToast.success(t("success"), t("allnotificationmarkedasread"));
      } else {
        showToast.error(t("oops"), response.message);
      }
    } catch (error) {
      console.error("Mark all read error:", error);
      showToast.error(t("oops"), t("somethingwentwrong"));
    } finally {
      setLoading(false);
      setMarkAllModalVisible(false);
    }
  }, [t]);

  const deleteSingleNotification = useCallback(async () => {
    if (!selectedNotificationId) return;

    try {
      const response = await deleteandclearallnotification({
        notificationId: selectedNotificationId,
      });

      if (response.success && response.status === 200) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== selectedNotificationId),
        );
      } else {
        showToast.error(t("oops"), response.message);
      }
    } catch (error) {
      console.error("Delete notification error:", error);
      showToast.error(t("oops"), t("somethingwentwrong"));
    } finally {
      setDeleteSingleModalVisible(false);
      setSelectedNotificationId(null);
    }
  }, [selectedNotificationId, t]);

  const clearAllNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await deleteandclearallnotification();

      if (response.success && response.status === 200) {
        setNotifications([]);
        showToast.success(
          t("success"),
          t("allnotificationdeletedsuccessfully"),
        );
      } else {
        showToast.error(t("oops"), response.message);
      }
    } catch (error) {
      console.error("Clear all notifications error:", error);
      showToast.error(t("oops"), t("somethingwentwrong"));
    } finally {
      setLoading(false);
      setClearAllModalVisible(false);
    }
  }, [t]);

  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchNotifications(page + 1, true);
    }
  }, [loadingMore, hasMore, loading, page, fetchNotifications]);

  const handleLongPress = useCallback((notificationId: string) => {
    setSelectedNotificationId(notificationId);
    setDeleteSingleModalVisible(true);
  }, []);

  const renderFooter = useCallback(() => {
    return loadingMore ? (
      <View style={styles.footerLoader}>
        <CommonLoader />
      </View>
    ) : null;
  }, [loadingMore]);

  const handleNotificationPress = useCallback(
    async (item: Notification) => {
      if (item.status !== "READ") {
        await markAsRead(item.id);
      }

      if (!item.data?.id && !item.data?.page) {
        return;
      }

      const { id, page, type, androidUrl, iosUrl } = item.data;

      try {
        if (page === "GROUP_ACTIVITY") {
          router.push({
            pathname: "/buddyupeventdescription",
            params: {
              eventId: id,
            },
          });
        } else if (page === "CONTENT") {
          router.push({
            pathname: "/contentDetails/[contentId]",
            params: { contentId: id },
          });
        } else if (page === "UPDATE" && type === "UPDATE") {
          try {
            const url = Platform.OS === "ios" ? iosUrl : androidUrl;
            if (url) {
              await Linking.openURL(url);
            } else {
              showToast.error(t("oops"), t("somethingwentwrong"));
            }
          } catch (error) {
            console.log("Error opening URL:", error);
            showToast.error(t("oops"), t("somethingwentwrong"));
          }
          return;
        } else if (page === "HANGOUT") {
          router.push({
            pathname: "/singlepost",
            params: { postId: id },
          });
        } else if (page === "HAPPINESS") {
          router.push("/monthlyhappinessindex");
        } else if (page === "POMS") {
          router.push("/monthlywellbeingpulse");
        } else {
          setSelectedNotification(item);
          setNotificationDetailModalVisible(true);
        }
      } catch (error) {
        console.error("Navigation failed:", error);
        showToast.error(t("oops"), t("somethingwentwrong"));
      }
    },
    [markAsRead, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor:
              item.status === "READ" ? "white" : "rgba(243, 250, 217, 0.7)",
            borderColor: item.status === "READ" ? "#ededed" : "#fff",
          },
        ]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleLongPress(item.id)}
        delayLongPress={800}
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.time}>{formatTimeSince(item.createdAt)}</Text>
        </View>
        <Text style={styles.notificationDescription}>{item.content}</Text>
      </TouchableOpacity>
    ),
    [handleNotificationPress, formatTimeSince, handleLongPress],
  );

  const keyExtractor = useCallback((item: Notification, index: number) => {
    return item.id ? item.id : `fallback-${index}`;
  }, []);
  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("notifications")}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            disabled={notifications.length === 0}
            onPress={() => setClearAllModalVisible(true)}
            style={{ opacity: notifications.length === 0 ? 0.5 : 1 }}
          >
            {notifications.length > 0 && <CircleX size={24} color="#000" />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const hasUnread = notifications.some(
                (notif) => notif.status !== "READ",
              );
              if (hasUnread) {
                setMarkAllModalVisible(true);
              } else {
                showToast.success(
                  t("success"),
                  t("allnotificationsalreadyread"),
                );
              }
            }}
          >
            <CircleCheckBig size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {loading && notifications.length === 0 ? (
          <View style={styles.centerLoader}>
            <CommonLoader fullScreen />
          </View>
        ) : !isOnline ? (
          <EmptyComponent text={t("nointernetconnection")} />
        ) : notifications.length === 0 ? (
          <View style={styles.centerLoader}>
            <EmptyComponent text={t("nonotificationfound")} />
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
          />
        )}
      </View>

      <Modal visible={markAllModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("markallasread")}</Text>
            <Text style={styles.modalSubText}>
              {t("markallasread_description")}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setMarkAllModalVisible(false)}
              >
                <Text style={styles.cancelText}>{t("cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.readButton}
                onPress={markAllAsRead}
              >
                <Text style={styles.readText}>{t("markallread")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteSingleModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Trash2 size={40} color="#ff4444" style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>{t("deletenotification")}</Text>
            <Text style={styles.modalSubText}>
              {t("deletenotification_description")}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setDeleteSingleModalVisible(false);
                  setSelectedNotificationId(null);
                }}
              >
                <Text style={styles.cancelText}>{t("cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.readButton, { backgroundColor: "#ff4444" }]}
                onPress={deleteSingleNotification}
              >
                <Text style={styles.readText}>{t("delete")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={clearAllModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Trash2 size={40} color="#ff4444" style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>{t("deleteallNotification")}</Text>
            <Text style={styles.modalSubText}>{t("actioncannotundone")}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setClearAllModalVisible(false)}
              >
                <Text style={styles.cancelText}>{t("cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.readButton, { backgroundColor: "#ff4444" }]}
                onPress={clearAllNotifications}
              >
                <Text style={styles.readText}>{t("deleteAll")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal*/}
      <Modal
        visible={notificationDetailModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
            <Text style={styles.detailContent}>
              {selectedNotification?.content}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setNotificationDetailModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeText}>{t("close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 55,
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderColor: "#ededed",
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
    backgroundColor: Colors.lightGreen,
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
  },
  closeText: {
    fontFamily: "Poppins-SemiBold",
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
  },
  headerLeft: { flexDirection: "row", gap: 10, alignItems: "center" },
  headerRight: { flexDirection: "row", gap: 20 },
  headerTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary || "#000",
  },
  content: { flex: 1, backgroundColor: "#f5f5f5" },

  listContent: { paddingBottom: 50 },
  notificationItem: {
    padding: 20,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  notificationTitle: {
    color: "#161616",
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    flex: 1,
  },
  time: {
    color: "#161616",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    fontWeight: "500",
    minWidth: 40,
    textAlign: "right",
  },
  notificationDescription: {
    color: "#636363",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    lineHeight: 14,
  },

  footerLoader: { paddingVertical: 20, alignItems: "center" },
  centerLoader: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    fontSize: 16,
    color: "#888",
    fontFamily: "Poppins-Regular",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  modalSubText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 16,
    color: "#666",
  },
  modalActions: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    alignItems: "center",
  },
  readButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.lightGreen,
    borderRadius: 8,
    alignItems: "center",
  },
  nodatafoundImage: {
    height: 150,
    width: 150,
    marginBottom: 20,
  },
  cancelText: {
    color: "#333",
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  readText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    fontWeight: "600",
  },
});
