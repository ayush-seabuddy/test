import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../utils/Colors";

const NotificationPermissionModal: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  // ✅ Check notification permissions
  const checkNotificationPermission = async () => {
    try {
      const settings = await Notifications.getPermissionsAsync();

      if (settings.status === "undetermined") {
        const request = await Notifications.requestPermissionsAsync();
        if (request.status === "denied") {
          setIsVisible(true);
        }
      } else if (settings.status === "denied") {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error("Error checking notification permission:", error);
      setIsVisible(true);
    }
  };

  // ✅ Open app settings
  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
      setIsVisible(false);
    } catch (error) {
      console.error("Error opening settings:", error);
    }
  };

  // ✅ Run check when screen gains focus
  useFocusEffect(
    useCallback(() => {
      checkNotificationPermission();
    }, [])
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.overlay}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.6)" />
        <View style={styles.container}>
          <Text style={styles.title}>{t("enable_notifications")}</Text>
          <Text style={styles.message}>{t("enable_notifications_description")}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.cancelText}>{t("skip")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleOpenSettings}
            >
              <Text style={styles.settingsText}>{t("gotosettings")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationPermissionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
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
  title: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
    color: "#333333",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton:{
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#cccccc",
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  settingsButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
     backgroundColor: Colors.lightGreen,
  },
  settingsText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
});
