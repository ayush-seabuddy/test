import React from 'react';
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type ExitAppModalProps = {
  exitModalVisible: boolean;
  setExitModalVisible: (visible: boolean) => void;
  onExit?: () => void;
};

const ExitAppModal: React.FC<ExitAppModalProps> = ({
  exitModalVisible,
  setExitModalVisible,
  onExit,
}) => {
  const handleClose = () => setExitModalVisible(false);
  const handleExit = () => {
    handleClose();
    onExit?.();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={exitModalVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <StatusBar backgroundColor="rgba(0, 0, 0, 0.6)" barStyle="light-content" />
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Exit App</Text>
          <Text style={styles.modalMessage}>Do you want to exit the app?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};



const styles = StyleSheet.create(
 {
     modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
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
        fontSize: 20,
        fontFamily: "Poppins-SemiBold",
        lineHeight: 24,
        color: "#333333",
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        color: "#666666",
        textAlign: "center",
        marginBottom: 20,
        fontFamily: "Poppins-Regular",
        lineHeight: 24,
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
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        lineHeight: 24,
        color: "#333333",
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
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        lineHeight: 24,
        color: "#ffffff",
    },
 }
);
export default ExitAppModal;