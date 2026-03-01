import Colors from "@/src/utils/Colors";
import { Logger } from "@/src/utils/logger";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Linking,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface VersionCheckModalProps {
  visible: boolean;
  versionInfo: {
    isRequired?: boolean;
    responseMessage?: string;
    url?: string;
  } | null;
  onUpdate: () => void;
  onClose: () => void;
}

const VersionCheckModal: React.FC<VersionCheckModalProps> = ({
  visible,
  versionInfo,
  onUpdate,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!versionInfo) return null;

  const handleUpdate = () => {
    if (versionInfo.url) {
      Linking.openURL(versionInfo.url).catch((err) =>
        Logger.error("Failed to open store URL:", err)
      );
    }
    onUpdate();
  };

  const handleClose = () => {
    if (!versionInfo.isRequired) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <StatusBar backgroundColor="rgba(0,0,0,0.7)" />
        <View style={styles.modalContainer}>
          <Text style={styles.titleText}>
            {versionInfo.isRequired ? t("updaterequired") : t("updateavailable")}
          </Text>
          <Text style={styles.descriptionText}>
            {versionInfo.responseMessage || "A new version is available!"}
          </Text>
          <View
            style={[
              styles.buttonContainer,
              {
                justifyContent: versionInfo.isRequired
                  ? "center"
                  : "space-between",
              },
            ]}
          >
            {!versionInfo.isRequired && (
              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={handleClose}
              >
                <Text style={styles.noButtonText}>{t("later")}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.yesButton]}
              onPress={handleUpdate}
            >
              <Text style={styles.yesButtonText}>{t("update")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  titleText: {
    fontSize: 16,
    color: "#333333",
    fontFamily: "Poppins-SemiBold",
  },
  descriptionText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
    color: "#666666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
  },
  button: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  noButton: {
    backgroundColor: "#f0f0f0",
  },
  noButtonText: {
    color: "#333333",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  yesButton: {
    backgroundColor: Colors.lightGreen,
  },
  yesButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
});

export default VersionCheckModal;