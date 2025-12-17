import { getAllHelplines } from "@/src/apis/apiService";
import { UserDetails } from "@/src/types/userTypes";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { CircleX, PhoneCall } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Linking,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";


const EmergencyModal = ({ visible, onClose }:{visible: boolean, onClose: () => void}) => {
  const [data, setData] = useState(null);
  const [userDetails, setUserDetails] = useState<UserDetails>({} as UserDetails);

  const fetchUserList = async () => {
    try {
      const storedData = await AsyncStorage.getItem("emergencyNumbers");
      if (storedData) setData(JSON.parse(storedData));

      const dbResult: string = await AsyncStorage.getItem("userDetails")||"";
      const userDetails:UserDetails = JSON.parse(dbResult);
      setUserDetails(userDetails);

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) return;

      if (!userDetails?.authToken) return;

      const result = await getAllHelplines({ helplineType: "EMERGENCY_NUMBER" });
      console.log("result: ", result);
      

      if (result.status === 200) {
        setData(result.data);
        await AsyncStorage.setItem("emergencyNumbers", JSON.stringify(result.data));
      }
    } catch (error) {
        console.log("error: ", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserList();
      return () => console.log("Screen unfocused");
    }, [])
  );

  const makePhoneCall = async (item:{emergencyNumber: string, emergencyWhatsappNumber: string}) => {
    const url = `tel:${item?.emergencyNumber}`;
    if (url !== "") {
      await Linking.openURL(url);
    } else {
      Alert.alert(`This URL (${url}) is wrong!`);
    }
  };

  const openWhatsApp = (item : {emergencyNumber: string, emergencyWhatsappNumber: string}) => {
    let phone = item?.emergencyWhatsappNumber;
    if (!phone) return
    const alternativeUrl = phone;
    Linking.openURL(alternativeUrl).catch(() => {
      Alert.alert(
        "WhatsApp not installed",
        "Please install WhatsApp or check the phone number."
      );
    });
  };

  useEffect(() => {
    Linking.canOpenURL("whatsapp://send").then((supported) => {
      console.log("Can open WhatsApp:", supported);
    });
  }, []);




  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <View style={styles.modalBackground} />
        <View style={styles.modalPopup}>
          <View style={styles.mingcutecloseFillIcon}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CircleX size={30} color={"black"} />
            </TouchableOpacity>
          </View>

          <View>
            <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontFamily: "Poppins-Regular" }}>Hey</Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "black",
                  fontFamily: "Poppins-Regular",
                  textTransform: "capitalize",
                }}
              >
                {userDetails?.fullName}!
              </Text>
            </View>
            <Text style={{ fontSize: 22, color: "black", fontFamily: "Poppins-SemiBold" }}>
              Here’s the emergency lines
            </Text>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between", // 👈 key change
                  marginTop: 7,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1, // 👈 takes remaining space
                  }}
                  onPress={() => makePhoneCall(item)}
                >
                  <View
                    style={{
                      backgroundColor: "#FFBF00",
                      padding: 8,
                      borderRadius: 8,
                      marginRight: 10, // spacing from text
                    }}
                  >
                    <PhoneCall size={20} color="#000" />
                  </View>

                  <View style={{ flexShrink: 1 }}>
                    <Text
                      style={{
                        marginBottom: 5,
                        fontSize: 14,
                        color: "black",
                        fontFamily: "WhyteInktrap-Medium",
                        paddingTop: 10,
                      }}
                    >
                      {item?.helplineName || ""}
                    </Text>
                    <Text style={{ fontSize: 10, fontFamily: "Poppins-Regular", marginBottom: 5, }}>
                      {(item?.helplineDescription || "").replace(/\s*--?\s*/, " -\n")}
                    </Text>
                    <Text style={{ fontSize: 10, fontFamily: "Poppins-Regular" }}>
                      {item?.emergencyNumber || ""}
                    </Text>
                  </View>
                </TouchableOpacity>
                {index !== 0 && item?.emergencyWhatsappNumber ? (
                  <TouchableOpacity
                    onPress={() => {
                      console.log("WhatsApp item:", item); // optional logging
                      openWhatsApp(item);
                    }}
                  >
                    <Image
                      source={ImagesAssets.whatsapp_icon}
                      style={{ width: 24, height: 24, tintColor: "#25D366" }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ) : null}

              </View>
            )}
          />
        </View>
        <Image
          style={{
            height: "35%",
            width: "60%",
            position: "absolute",
            zIndex: 1,
            top: "14%",
          }}
          source={ImagesAssets.emargncy_image}
        />
      </Pressable>
    </Modal>
  );
}

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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalPopup: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: "#d9d9d9",
    width: "100%",
    height: SCREEN_HEIGHT * 0.65,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    zIndex: 5,
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
});

export default EmergencyModal;