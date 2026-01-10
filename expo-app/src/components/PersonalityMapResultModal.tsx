import React from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { ImagesAssets } from "../utils/ImageAssets";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Modal, Portal } from "react-native-paper";

interface PersonalityMapResultModalProps {
  visible: boolean;
  setModalVisible: (visible: boolean) => void;
}

const { height } = Dimensions.get("window");

const PersonalityMapResultModal: React.FC<PersonalityMapResultModalProps> = ({
  visible,
  setModalVisible,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleClose = () => {
    setModalVisible(false);
    router.push("/home");
  };

  const goToResult = () => {
    router.push({
      pathname: "/personalitymap/PersonalityMapResultScreen",
      params: {
        newuser: "true",
      },
    });
    setModalVisible(false);
  };

  const goToHome = () => {
    router.push("/home");
    setModalVisible(false);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        dismissable={true}
        contentContainerStyle={{ flex: 1 }}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <View style={styles.popupContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.popup}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{t("congratulations")}</Text>
                <Text style={styles.message}>{t("resultpopup_description")}</Text>
              </View>

              <TouchableOpacity style={styles.button} onPress={goToResult}>
                <Text style={styles.buttonText}>{t("openresult")}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={goToHome}>
                <Text style={styles.buttonText}>{t("home")}</Text>
              </TouchableOpacity>

              <Image
                style={styles.decorativeImage}
                resizeMode="contain"
                source={ImagesAssets.personalitymapresultpopupjollie}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  popupContainer: {
    marginBottom: -20,
  },
  popup: {
    width: "100%",
    height: 380,
    backgroundColor: "#d9d9d9",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 110,
    paddingBottom: Platform.OS === "android" ? 30 : 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    alignSelf: "stretch",
    gap: 8,
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    color: "#262626",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 17,
    fontFamily: "Poppins-Regular",
    color: "#454545",
    textAlign: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "rgba(103, 110, 118, 0.2)",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 5,
    alignItems: "center",
    marginVertical: 6,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
    color: "#06361f",
  },
  decorativeImage: {
    width: 359,
    height: 359,
    position: "absolute",
    top: -215,
    left: 10,
    zIndex: 4,
  },
});

export default PersonalityMapResultModal;