import React from "react";
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";

const { width } = Dimensions.get("window");

const MembershipExpiredModal = ({ visible , navigation}) => {
// Inside your component
// const navigation = useNavigation();

const onDelete = () => {
  // CommonActions.reset({
  //   index: 0,
  //   routes: [{ name: 'LoginData' }],
  // })
  navigation.replace("AuthNav");
};
  return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <StatusBar backgroundColor={"rgba(0, 0, 0, 0.7)"} />
  
          <View style={styles.modalContainer}>
            <Text style={styles.titleText}>Membership Expired</Text>
            <Text style={styles.descriptionText}>
            Your membership has ended. Please contact to your company.
            </Text>
            <View style={styles.buttonContainer}>
              {/* <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={handleNo}
              >
                <Text style={styles.noButtonText}>NO</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={onDelete}
              >
                <Text style={styles.yesButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
}

export default MembershipExpiredModal

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
    marginBottom:15,
    marginTop:10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    height: 45,
    marginVertical:10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,
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