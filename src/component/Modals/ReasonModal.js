import { t } from "i18next";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  TextInput,
} from "react-native";

const { width } = Dimensions.get("window");

const ReportModal = ({ visible, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const { t } = useTranslation();
  const handleCancel = () => {
    setReason(""); // Clear input field on cancel
    onClose();
  };

  const handleSubmit = () => {
    if (reason.trim().length === 0) {
      alert(t('pleaseprovideReason'));
      return;
    }
    onSubmit(reason);
    setReason(""); // Clear input field after submission
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <StatusBar backgroundColor={"rgba(0, 0, 0, 0.7)"} />

        <View style={styles.modalContainer}>
          <Text style={styles.titleText}>{t('reportpost')}</Text>
          <Text style={styles.descriptionText}>
            {t('reportpost_description')}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t('enteryourreason')}
            placeholderTextColor="#888"
            multiline
            value={reason}
            onChangeText={setReason}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>{t('submit')}</Text>
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
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
    color: "#333333",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666666",
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
    textAlign: "center",
    marginVertical: 15,
  },
  input: {
    width: "100%",
    minHeight: 80,
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
    textAlignVertical: "top",
    marginBottom: 15,
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
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#333333",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#06361F",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
  },
});

export default ReportModal;
