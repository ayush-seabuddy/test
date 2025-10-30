import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { TextInput, Button, Card, Text } from "react-native-paper";
import ProfileSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiServerUrl } from "../Api";
import Loader from "../component/Loader";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import CustomLottie from "../component/CustomLottie";
import api from "../CustomAxios";
const { height, width } = Dimensions.get("screen");

const SocialMediaLinks = ({ navigation }) => {
  const [links, setLinks] = useState({
    linkedin: "",
    instagram: "",
    facebook: "",
    telegram: "",
  });
  const [savedLinks, setSavedLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfileDetails();
  }, []);

  const getProfileDetails = async () => {
    try {
      setLoading(true);
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) throw new Error("No user details found");

      const userDetails = JSON.parse(dbResult);

      const response = await api.get(`${apiServerUrl}/user/viewUserProfile`, {
        headers: { authToken: userDetails.authToken },
        params: { userId: userDetails.id },
      });

      if (response.data.responseCode === 200) {
        const fetchedLinks = response.data.result.SocialMediaLinks || [];
        setSavedLinks(fetchedLinks);

        // Convert array to an object to pre-fill input fields
        const mappedLinks = fetchedLinks.reduce((acc, { platform, link }) => {
          acc[platform.toLowerCase()] = link;
          return acc;
        }, {});

        setLinks((prev) => ({
          ...prev,
          ...mappedLinks,
        }));
      } else {
        console.error("Error fetching profile data:", response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSocialMediaLinks = async () => {
    const validLinks = Object.entries(links)
      .filter(([_, value]) => value.trim() !== "")
      .map(([platform, link]) => ({ platform, link }));

    if (validLinks.length === 0) {
      Toast.show({
        type: "error",
        text1: "Enter at least one valid link",
      });
      return;
    }

    try {
      setLoading(true);
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) throw new Error("No user details found");

      const userDetails = JSON.parse(dbResult);

      // Merge new links while replacing existing ones
      const updatedLinks = [...savedLinks];

      validLinks.forEach((newLink) => {
        const index = updatedLinks.findIndex(
          (item) =>
            item.platform.toLowerCase() === newLink.platform.toLowerCase()
        );

        if (index !== -1) {
          updatedLinks[index] = newLink; // Replace existing link
        } else {
          updatedLinks.push(newLink); // Add new link
        }
      });

      const body = {
        userId: userDetails.id,
        SocialMediaLinks: updatedLinks,
      };

      const response = await axios.put(
        `${apiServerUrl}/user/updateProfile`,
        body,
        {
          headers: {
            authToken: userDetails.authToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.responseCode === 200) {
        setSavedLinks(updatedLinks);
        setLinks({ linkedin: "", instagram: "", facebook: "", telegram: "" });

        Toast.show({
          type: "success",
          text1: "Social Media Links updated successfully",
        });
      } else {
        console.error("Error updating profile:", response.data);
      }
    } catch (error) {
      console.error("Update Profile Error:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProfileSettingHeader navigation={navigation} title="Social Media" />
      {loading && <Loader />}
      <View style={{ flex: 1, padding: 14 }}>
        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>
          LinkedIn
        </Text>
        <TextInput
          label="Enter LinkedIn Link"
          value={links.linkedin}
          onChangeText={(text) => setLinks({ ...links, linkedin: text })}
          mode="outlined"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          style={{
            marginBottom: 10,
            fontFamily: "Poppins-Regular",
            fontSize: 16,
          }}
        />
        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>
          Instagram
        </Text>
        <TextInput
          label="Enter Instagram Link"
          value={links.instagram}
          onChangeText={(text) => setLinks({ ...links, instagram: text })}
          mode="outlined"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          style={{
            marginBottom: 10,
            fontFamily: "Poppins-Regular",
            fontSize: 16,
          }}
        />
        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>
          Facebook
        </Text>
        <TextInput
          label="Enter Facebook Link"
          value={links.facebook}
          onChangeText={(text) => setLinks({ ...links, facebook: text })}
          mode="outlined"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          style={{
            marginBottom: 10,
            fontFamily: "Poppins-Regular",
            fontSize: 16,
          }}
        />
        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>
          Telegram
        </Text>
        <TextInput
          label="Enter Telegram Link"
          value={links.telegram}
          onChangeText={(text) => setLinks({ ...links, telegram: text })}
          mode="outlined"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          style={{
            marginBottom: 10,
            fontFamily: "Poppins-Regular",
            fontSize: 16,
          }}
        />

        <TouchableOpacity
          onPress={updateSocialMediaLinks}
          style={{
            borderRadius: 8,
            marginVertical: 20,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
          }}
        >
          <Text
            style={{
              color: "#fff",
              lineHeight: 27,
              fontFamily: "WhyteInktrap-Medium",
              fontWeight: "500",
              fontSize: 18,
            }}
          >
            Save Social Media Links
          </Text>
        </TouchableOpacity>

        {savedLinks.length > 0 && (
          <FlatList
            data={savedLinks}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: 8,
                  marginBottom: 10,
                  padding: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
                <View>
                  <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 12 }}>
                    {item.platform.charAt(0).toUpperCase() +
                      item.platform.slice(1)}
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Regular", fontSize: 10 }}>
                    {item.link}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                </View>
              </View>





            )}
          />
        )}
      </View>
      <View
        style={{
          // flex: 1,
          backgroundColor: "#c1c1c1",
          overflow: "hidden",
          height: "50%",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          zIndex: -1,
          // flexBasis: 200,
          position: "absolute",
          bottom: 0,
        }}
      >
        {/* <LottieView
          source={require("../assets/Background.json")}
          autoPlay
          loop
          resizeMode="cover"
          style={styles.lottieBackground}
        /> */}
        <CustomLottie />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  lottieBackground: {
    width: width * 1,
    height: height * 0.68,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    // position: "absolute",
    // bottom: 0,
  },
});
export default SocialMediaLinks;
