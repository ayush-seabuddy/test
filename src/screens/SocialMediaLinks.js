import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { TextInput, Button, Card, Text } from "react-native-paper";
import ProfileSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiServerUrl } from "../Api";
import Loader from "../component/Loader";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomLottie from "../component/CustomLottie";
import api from "../CustomAxios";
import { useTranslation } from "react-i18next";
import { ImagesAssets } from "../assets/ImagesAssets";

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
  const [editingPlatform, setEditingPlatform] = useState(null); // Track which one is being edited
  const { t } = useTranslation();

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

        // Pre-fill form if editing one
        if (editingPlatform) {
          const editingLink = fetchedLinks.find(
            (item) => item.platform.toLowerCase() === editingPlatform
          );
          if (editingLink) {
            setLinks((prev) => ({
              ...prev,
              [editingPlatform]: editingLink.link,
            }));
          }
        } else {
          // Normal load: map saved links to input fields
          const mappedLinks = fetchedLinks.reduce((acc, { platform, link }) => {
            acc[platform.toLowerCase()] = link;
            return acc;
          }, {});
          setLinks((prev) => ({ ...prev, ...mappedLinks }));
        }
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

      // Replace or add new links
      const updatedLinks = savedLinks.filter(
        (item) => !validLinks.some((newLink) => newLink.platform === item.platform)
      );

      updatedLinks.push(...validLinks);

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
        setEditingPlatform(null);
        setLinks({ linkedin: "", instagram: "", facebook: "", telegram: "" });

        Toast.show({
          type: "success",
          text1: t('socialmediaaddedsuccessfully') || "Links saved successfully!",
        });
      }
    } catch (error) {
      console.error("Update Error:", error.message || error);
      Toast.show({
        type: "error",
        text1: "Failed to save links",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit
  const handleEdit = (platform, link) => {
    setEditingPlatform(platform.toLowerCase());
    setLinks((prev) => ({
      ...prev,
      [platform.toLowerCase()]: link,
    }));
    // Scroll to top or focus input if needed
  };

  // Handle Delete
  const handleDelete = (platformToDelete) => {
    Alert.alert(
      t('deletelink'),
      `${t('remove')} ${platformToDelete}?`,
      [
        { text: t('cancel'), style: "cancel" },
        {
          text: t('delete'),
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const dbResult = await AsyncStorage.getItem("userDetails");
              const userDetails = JSON.parse(dbResult);

              const updatedLinks = savedLinks.filter(
                (item) => item.platform.toLowerCase() !== platformToDelete.toLowerCase()
              );

              const response = await axios.put(
                `${apiServerUrl}/user/updateProfile`,
                {
                  userId: userDetails.id,
                  SocialMediaLinks: updatedLinks,
                },
                {
                  headers: {
                    authToken: userDetails.authToken,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (response.data.responseCode === 200) {
                setSavedLinks(updatedLinks);
                setLinks((prev) => ({ ...prev, [platformToDelete.toLowerCase()]: "" }));
                Toast.show({
                  type: "success",
                  text1: "Link deleted successfully",
                });
              }
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Failed to delete link",
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <ProfileSettingHeader navigation={navigation} title={t('social_media')} />
      {loading && <Loader />}

      <View style={{ flex: 1, padding: 14 }}>
        {/* Input Fields */}
        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>{t('linkedin')}</Text>
        <TextInput
          label={t('enterlinkedinlink')}
          value={links.linkedin}
          onChangeText={(text) => setLinks({ ...links, linkedin: text })}
          mode="outlined"
          keyboardType="url"
          autoCapitalize="none"
          style={{ marginBottom: 10 }}
        />

        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>{t('instagram')}</Text>
        <TextInput
          label={t('enterinstagramlink')}
          value={links.instagram}
          onChangeText={(text) => setLinks({ ...links, instagram: text })}
          mode="outlined"
          keyboardType="url"
          autoCapitalize="none"
          style={{ marginBottom: 10 }}
        />

        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>{t('facebook')}</Text>
        <TextInput
          label={t('enterfacebooklink')}
          value={links.facebook}
          onChangeText={(text) => setLinks({ ...links, facebook: text })}
          mode="outlined"
          keyboardType="url"
          autoCapitalize="none"
          style={{ marginBottom: 10 }}
        />

        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>{t('telegram')}</Text>
        <TextInput
          label={t('entertelegramlink')}
          value={links.telegram}
          onChangeText={(text) => setLinks({ ...links, telegram: text })}
          mode="outlined"
          keyboardType="url"
          autoCapitalize="none"
          style={{ marginBottom: 20 }}
        />

        <TouchableOpacity
          onPress={updateSocialMediaLinks}
          style={{
            borderRadius: 8,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "#fff", fontFamily: "WhyteInktrap-Medium", fontSize: 18 }}>
            {editingPlatform ? "Update Link" : t('savesocialmedialinks') || "Save Links"}
          </Text>
        </TouchableOpacity>

        {/* Saved Links List */}
        {savedLinks.length > 0 && (
          <FlatList
            data={savedLinks}
            keyExtractor={(item) => item.platform}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 10,
                  elevation: 2,
                }}
              >
                <View>
                  <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>
                    {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                  </Text>
                  <Text style={{ fontFamily: "Poppins-Regular", fontSize: 12, color: "#555" }}>
                    {item.link}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 16 }}>
                  {/* Edit Icon */}
                  <TouchableOpacity
                    onPress={() => handleEdit(item.platform, item.link)}
                  >
                    <Image
                      source={ImagesAssets.editIcon}
                      style={{ width: 20, height: 20 }}
                    />
                  </TouchableOpacity>

                  {/* Delete Icon */}
                  <TouchableOpacity
                    onPress={() => handleDelete(item.platform)}
                  >
                    <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Background Lottie */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          height: "50%",
          width: "100%",
          backgroundColor: "#c1c1c1",
          overflow: "hidden",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          zIndex: -1,
        }}
      >
        <CustomLottie />
      </View>
    </>
  );
};

export default SocialMediaLinks;