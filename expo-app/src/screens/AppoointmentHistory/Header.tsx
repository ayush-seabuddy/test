import GlobalHeader from "@/src/components/GlobalHeader";
import EmergencyModal from "@/src/components/Modals/EmergencyModal";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { Image } from "expo-image";
import { t } from "i18next";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

const Header = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const toggleModal = () => setModalVisible((prev) => !prev);

  return (
    <View style={styles.main}>
      <GlobalHeader
        title={t('yourbookedappointment')}
        rightIcon={
          <Image
            source={ImagesAssets.sosimage}
            style={styles.headerIcon2}
          />
        }
        onRightPress={toggleModal}
      />
      <EmergencyModal
        onClose={() => setModalVisible(false)}
        visible={modalVisible}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerIcon2: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

export default Header;