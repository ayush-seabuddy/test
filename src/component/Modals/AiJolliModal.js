import React from "react";
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";

const AiJolliModal = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <View style={styles.modalBackground} />
        <View style={styles.modalPopup}>
          <View style={styles.congratulationsParent}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                fontFamily: "Poppins-Regular",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Good Morning
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "black" }}>
                Kai!
              </Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "black" }}>
              How’re you doing today?
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 15,
              }}
            >
              <Image
                style={{ width: 30, height: 30 }}
                resizeMode="cover"
                source={ImagesAssets.emoji_1}
              />
              <Image
                style={{ width: 30, height: 30 }}
                resizeMode="cover"
                source={ImagesAssets.emoji_2}
              />
              <Image
                style={{ width: 30, height: 30 }}
                resizeMode="cover"
                source={ImagesAssets.emoji_3}
              />
              <Image
                style={{ width: 30, height: 30 }}
                resizeMode="cover"
                source={ImagesAssets.emoji_4}
              />
              <Image
                style={{ width: 30, height: 30 }}
                resizeMode="cover"
                source={ImagesAssets.emoji_5}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 15,
              }}
            >
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: "black" }}>Statistic</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: "black" }}>AI Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mingcutecloseFillIcon}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Image
                style={{ width: 24, height: 24 }}
                resizeMode="cover"
                source={ImagesAssets.closeicon}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[styles.default3dRenderedCartoonOf, styles.cartoonPosition]}
          />
          <Image
            style={[
              styles.default4dCartoonPixarManWIcon,
              styles.default4dIconPosition,
            ]}
            resizeMode="cover"
            source={ImagesAssets.resultmodal_img}
          />
          <Image
            style={[
              styles.default4dCartoonPixarHeIsIcon,
              styles.cartoonPosition,
            ]}
            resizeMode="cover"
            source={ImagesAssets.resultmodal_img}
          />
          <Image
            style={[
              styles.default4dCartoonPixarManWIcon1,
              styles.default4dIconPosition,
            ]}
            resizeMode="cover"
            source={ImagesAssets.resultmodal_img}
          />
          <Image
            style={styles.default4dCartoonPixarManWIcon2}
            resizeMode="cover"
            source={ImagesAssets.resultmodal_img}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalPopup: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: "#fff",
    width: "100%",
    height: 330,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 120,
    paddingBottom: 32,
    alignItems: "center",
  },
  itsAGreatFlexBox: {
    textAlign: "left",
    alignSelf: "stretch",
  },
  buttonFlexBox: {
    justifyContent: "center",
    alignSelf: "stretch",
  },
  button1Typo: {
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  cartoonPosition: {
    display: "none",
    position: "absolute",
  },
  default4dIconPosition: {
    left: 24,
    display: "none",
    position: "absolute",
  },
  congratulations: {
    fontSize: 22,
    lineHeight: 26,
    color: "#262626",
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  itsAGreat: {
    lineHeight: 17,
    fontFamily: "Poppins-Regular",
    color: "#454545",
    fontSize: 14,
  },
  congratulationsParent: {
    gap: 8,
    zIndex: 0,
    alignSelf: "stretch",
  },
  button1: {
    lineHeight: 21,
    color: "#06361f",
    textAlign: "center",
    fontSize: 14,
  },
  stateLayer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    shadowColor: "rgba(103, 110, 118, 0.08)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 5,
    elevation: 5,
    shadowOpacity: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 1,
    overflow: "hidden",
  },
  mingcutecloseFillIcon: {
    top: 30,
    right: 20,
    zIndex: 3,
    position: "absolute",
  },
  closeButton: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  default3dRenderedCartoonOf: {
    top: -203,
    left: 74,
    width: 252,
    height: 336,
    zIndex: 3,
  },
  default4dCartoonPixarManWIcon: {
    top: -215,
    width: 359,
    height: 359,
    zIndex: 4,
  },
  default4dCartoonPixarHeIsIcon: {
    top: -219,
    left: 21,
    width: 351,
    height: 351,
    zIndex: 5,
  },
  default4dCartoonPixarManWIcon1: {
    top: -221,
    width: 355,
    height: 355,
    zIndex: 6,
  },
  default4dCartoonPixarManWIcon2: {
    top: -249,
    left: 2,
    width: 403,
    height: 403,
    zIndex: 7,
    position: "absolute",
  },
});

export default AiJolliModal;
