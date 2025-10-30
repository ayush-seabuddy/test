import React from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Pressable,
  Platform,

} from "react-native";

const PersonalityResultInfoPopup = ({ visible, setModalVisible, text, content, position = { x: 0, y: 0 }, screenName }) => {
  const onClose = () => setModalVisible(false);

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose} backdropColor='black'>
      <View style={styles.modalContainer}>
        <Pressable style={styles.modalBackground} onPress={onClose} />
        <View
          style={[
            styles.modalPopup,
            { top: position?.y || 0 },
            screenName === "Huddle" && { marginTop: 55, marginRight: -10 },
            screenName === "Leaderboard" && { marginTop: 380, marginRight: 20 },
            screenName === "JollyAI" && { marginRight: -18 },
            screenName === "Sailors" && { marginTop: 60, marginRight: 45 }

          ]}
        >
          <View style={styles.tooltipArrow} />
          {content ? content : <Text style={styles.modalText}>{text}</Text>}
        </View>
      </View>
    </Modal>
  );
};



const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: Platform.OS == "ios" ? 100 : 60,      // Adjust to match icon's vertical position
    paddingRight: 20,    // Adjust to align with right-side icon
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalPopup: {
    maxWidth: 260,
    borderRadius: 10,
    backgroundColor: "#ededed",
    padding: 12,
    paddingTop: 20,
    alignItems: "flex-start",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
  },
  tooltipArrow: {
    position: "absolute",
    top: -8,
    right: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#c4c4c4",
  },
  modalText: {
    textAlign: "left",
    color: "#454545",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins-Regular",
  },
});

export default PersonalityResultInfoPopup;
