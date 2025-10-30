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

const ResultModal = ({ visible, setModalVisible, navigation }) => {
  const onClose = () => {
    // setModalVisible(false);
  };
  const navigateToHelperLanding = () => {
    navigation.replace("PersonaResult", { from: "Mbti_Test_2" });
    // navigation.replace("PersonaResult");
    // onClose();
    setModalVisible(false);
  };

  const navigateToHome = () => {
    navigation.navigate("Home", {
      screen: "SeaBuddy", params: {
        name: "hangout",
      }
    });
    // navigation.replace("PersonaResult");
    // onClose();
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Modal Background Layer */}
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <View style={styles.modalBackground} />
        <View style={styles.modalPopup}>
          <View style={styles.congratulationsParent}>
            <Text style={[styles.congratulations, styles.itsAGreatFlexBox]}>
              Congratulations
            </Text>
            <Text style={[styles.itsAGreat, styles.itsAGreatFlexBox]}>
              It's a great step towards understanding yourself better and gaining
              insights that can help you grow. Well done!
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.buttonFlexBox]}
            onPress={navigateToHelperLanding}
          >
            <View style={[styles.stateLayer, styles.buttonFlexBox]}>
              <Text style={[styles.button1, styles.button1Typo]}>
                Open Result
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonFlexBox, { marginTop: 6 }]}
            onPress={navigateToHome}
          >
            <View style={[styles.stateLayer, styles.buttonFlexBox]}>
              <Text style={[styles.button1, styles.button1Typo]}>
                Home
              </Text>
            </View>
          </TouchableOpacity>
          {/* <View style={styles.mingcutecloseFillIcon}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Image
                style={{ width: 24, height: 24 }}
                resizeMode="cover"
                source={ImagesAssets.closeicon}
              />
            </TouchableOpacity>
          </View> */}
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
    backgroundColor: "#d9d9d9",
    width: "100%",
    height: 370,
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
    color: "#06361f",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
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

export default ResultModal;
