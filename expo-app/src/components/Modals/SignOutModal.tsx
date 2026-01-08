import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const SignOutModal = ({ visible, onClose, onLogout }:{visible:boolean,onClose:()=>void,onLogout:()=>void}) => {
  const { t } = useTranslation();
  const handleNo = () => {
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <StatusBar backgroundColor={"rgba(0, 0, 0, 0.7)"} />

        <View style={styles.modalContainer}>
          <Text style={styles.titleText}>{t('log_out')}</Text>
          <Text style={styles.descriptionText}>
            {t('areyousurewanttologout')}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.noButton]}
              onPress={handleNo}
            >
              <Text style={styles.noButtonText}>{t('no')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.yesButton]}
              onPress={onLogout}
            >
              <Text style={styles.yesButtonText}>{t('yes')}</Text>
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
    fontSize: 22,
    color: "#333333",
    marginBottom: 10,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 28,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
    color: "#666666",
    textAlign: "center",
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    // fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
  },
  yesButton: {
    backgroundColor: "red",
  },
  yesButtonText: {
    color: "#ffffff",
    fontSize: 16,
    // fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
  },
});

export default SignOutModal;
