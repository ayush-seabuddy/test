import EmergencyModal from "@/src/components/Modals/EmergencyModal";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Header = ({  }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.main}>
    <View style={styles.container}>
    
      <EmergencyModal onClose={() => setModalVisible(false)}  visible={modalVisible} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <ChevronLeft size={20} />
          </View>
        </TouchableOpacity>

        <Text style={styles.health}>Your Booked Appointment</Text>
      </View>
      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity
          onPress={() => setModalVisible((prev) => !prev)}
          style={styles.headerButton}
        >
          <View style={[styles.iconBackground]}>
            <Image
              source={ImagesAssets.sosimage}
              style={styles.headerIcon2}
            />
          </View>
        </TouchableOpacity>
      </View>
      
      </View>
     </View>
     
  );
};

const styles = StyleSheet.create({
  main:{
flex:1,
backgroundColor:"#fff"
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    zIndex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
      },
    }),
    
  },
  elevation:{
    backgroundColor:"gray",
    width: "100%",
    height:1,
    
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  health: {
    fontSize: 18,
    lineHeight: 29,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    padding: 5,
  },
  headerButton: {
    marginLeft: 10,
  },
  headerIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  headerIcon2: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  iconBackground: {
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  iconBackgroundHistory:{
    borderRadius: 8,
    padding: 7,
  },
  searchIconBackground: {
    backgroundColor: "#B0DB0266",
    borderRadius: 8,
    
  },
});

export default Header;
