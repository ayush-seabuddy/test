import React, { useEffect, useState } from "react";
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
import { showMessage } from "react-native-flash-message";
import axios from "axios";
import LottieView from "lottie-react-native";
import { BlurView } from "@react-native-community/blur";
import Toast from "react-native-toast-message";
import Loader from "../component/Loader";

const ContentNotFoundModal = ({ navigation , notificationDetailModalVisible,setNotificationDetailModalVisible,selectedNotification,setSelectedNotification}) => {












  return (

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
              onPress={() => setNotificationDetailModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 30, // Subtract horizontal margin (20 + 20)
    height: height * 0.1,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#cbcaca",
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: 'red',
    overflow: "hidden",
  },

  unreadCard: {
    backgroundColor: "rgba(243, 250, 217, 0.7)", // Light greenish for unread
  },
  readCard: {
    backgroundColor: "white", // Grayish for read
  },
  cardImage: {
    height: width * 0.15,
    width: width * 0.15,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImagedot: {
    height: width * 0.06,
    width: width * 0.06,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  cardInner: {
    // flexDirection: "column",
    display: "flex",
    paddingHorizontal: 20,
    // alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    flexDirection: "row"
    // backgroundColor:"red"


  },
  Inner: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width - 50 - width * 0.15,
  },
  InnerText: {
    color: "#161616",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    fontWeight: "500",
  },
  InnerTextTime: {
    color: "#161616",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    fontWeight: "500",
  },
  InnerPara: {
    color: "#636363",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    fontWeight: "500",
  },
  modalContainer: {
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
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 10,
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  lottieBackground: {
    width: width * 1,
    height: height * 0.68,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    // position: "absolute",
    // bottom: 0,
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
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  // modalContent: {
  //   fontSize: 16,
  //   marginBottom: 20,
  //   textAlign: "center",
  // },
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

export default ContentNotFoundModal;
