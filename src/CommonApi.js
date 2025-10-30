import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { apiCallWithToken, apiServerUrl } from "./Api";
import RealmService from "./Realm/Realm";
import ReactNativeFS from "react-native-fs";

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Keyboard } from "react-native";
import { Dropdown } from "react-native-element-dropdown"; // Ensure correct import
import axios from "axios";
import { Schema } from "yup";
import { Path } from "react-native-svg";

export const GetAssessment = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");

    // Check if the app is online
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;
    if (isConnected) {
      const result = await apiCallWithToken(
        `${apiServerUrl}/user/getAssessmentQuestions?questionType=PERSONALITY`,
        "GET",
        null,
        token
      );

      const allData = RealmService.getAllData(
        "assessmentData",
        "UserDatabase.realm"
      );
      console.log("API Response:", allData.length);

      if (allData.length > 120) {
        RealmService.deleteAllData("assessmentData", "UserDatabase.realm");
      }


      const allDatas = RealmService.getAllData(
        "assessmentData",
        "UserDatabase.realm"
      );
      console.log("API Response:", allDatas.length);

      if (result?.result) {
        RealmService.addOrUpdateData(
          "assessmentData",
          result.result,
          "UserDatabase.realm"
        );
        // Save the fetched data to AsyncStorage for offline use
        // await AsyncStorage.setItem(
        //   "assessmentData",
        //   JSON.stringify(result.result)
        // );
      }
    }
  } catch (err) {
    console.log("Error fetching assessment:", err);
  }
};

export const fetchPaginatedData = async (
  url,
  pageNumber = 1,
  limit = 50,
  setHandOut,
  setHasMore,
  options = {}
) => {
  const { isRefreshing = false, useOfflineData = true } = options;

  try {
    const authToken = await AsyncStorage.getItem("authToken");
    if (!authToken) {
      console.error("No auth token found");
      return;
    }

    const queryParams = new URLSearchParams({
      page: pageNumber,
      limit,
    }).toString();
    const fullUrl = `${apiServerUrl}/user/getAllHangoutPost?${queryParams}`;


    const response = await apiCallWithToken(fullUrl, "GET", null, authToken);
    const newData = response?.result?.hangoutsList || [];


    // Save offline if needed
    if (pageNumber === 1 && !isRefreshing) {
      try {
        const imagePaths = await downloadImages(newData);

        RealmService.addOrUpdateData(
          "hangOutData",
          imagePaths,
          "UserDatabase.realm"
        );
        // await AsyncStorage.setItem("hangOutData", JSON.stringify(newData));
      } catch (offlineError) {
        console.error("Failed to store offline data:", offlineError.message);
      }
    }
  } catch (error) {
    console.error("Error fetching paginated data:", error.response.message);
  }
};

export const getAnnouncementData = async () => {
  try {
    const authToken = await AsyncStorage.getItem("authToken");

    const response = await axios({
      method: "GET",
      url: `${apiServerUrl}/announcement/getAllAnnouncements`,
      headers: { authToken },
    });

    if (response.responseCode === 200) {
      // const announcementData = response?.data?.result?.allAnnouncements || [];
      const announcementData = response.result.allContents || [];
      const processedData = await downloadAnnouncements(announcementData);

      RealmService.addOrUpdateData(
        "AnnouncementGet",
        processedData,
        "UserDatabase.realm"
      );
    }
  } catch (error) {
    console.log("Error getting announcement data:", error);
  }
};

export const downloadAnnouncements = async (announcements) => {
  try {
    const updatedAnnouncements = await Promise.all(
      announcements.map(async (announcement) => {
        try {
          let localThumbnail = announcement.thumbnail;

          if (announcement.thumbnail) {
            const fileName = announcement.thumbnail.split("/").pop();
            const dir =
              Platform.OS === "android"
                ? ReactNativeFS.ExternalDirectoryPath
                : ReactNativeFS.DocumentDirectoryPath;
            const filePath = `${dir}/${fileName}`;

            // Check if file exists
            if (!(await ReactNativeFS.exists(filePath))) {
              const downloadResult = await ReactNativeFS.downloadFile({
                fromUrl: announcement.thumbnail,
                toFile: filePath,
              }).promise;

              if (downloadResult.statusCode === 200) {
                localThumbnail = `file://${filePath}`;
              }
            } else {
              localThumbnail = `file://${filePath}`;
            }
          }




          return { ...announcement, localThumbnail };
        } catch (err) {
          console.log("Error processing announcement:", err);
          return announcement;
        }
      })
    );

    // Store data in Realm

    // Store as a backup in AsyncStorage for offline access

    return updatedAnnouncements;
  } catch (error) {
    console.log("Error downloading announcements:", error);
    return [];
  }
};

export const downloadImages = async (newData) => {
  const itemsWithImages = [];

  // Ensure newData is always an array (if it's a single object, convert it to an array)
  const dataArray = Array.isArray(newData) ? newData : [newData];

  try {
    // Loop over each item in the new data
    for (let i = 0; i < dataArray.length; i++) {
      const itemData = {
        ...dataArray[i],
        downloadedImageUrls: [], // Separate array for images from imageUrls
        downloadedProfileUrl: null, // Separate parameter for profile image
      };

      // 1. Handle images from `imageUrls` (array of URLs)
      if (Array.isArray(itemData.imageUrls)) {
        for (let url of itemData.imageUrls) {
          const filename = url.split("/").pop(); // Extract file name from URL
          const downloadDest = `${ReactNativeFS.DocumentDirectoryPath}/${filename}`; // Local destination path for the image

          // Check if the URL is remote (starts with 'http' or 'https')
          if (url.startsWith("http") || url.startsWith("https")) {
            // Check if the file already exists
            const fileExists = await ReactNativeFS.exists(downloadDest);

            if (!fileExists) {
              // Download image to the file system if it doesn't exist already
              await ReactNativeFS.downloadFile({
                fromUrl: url,
                toFile: downloadDest,
              }).promise;
            }
          } else {
            // If it's a local file URL (file://), copy the file to the desired destination
            const fileExists = await ReactNativeFS.exists(downloadDest);

            if (!fileExists) {
              // Copy file from its current location to the local storage destination
              await ReactNativeFS.copyFile(url, downloadDest);
            }
          }

          // Push the downloaded or copied file path to the `downloadedImageUrls` array
          itemData.downloadedImageUrls.push(downloadDest);
        }
      }

      // 2. Handle image from `userDetails.profileUrl` (single image URL)
      if (itemData.userDetails && itemData.userDetails.profileUrl) {
        const profileUrl = itemData.userDetails.profileUrl;
        const filename = profileUrl.split("/").pop(); // Extract file name from URL
        const downloadDest = `${ReactNativeFS.DocumentDirectoryPath}/${filename}`; // Local destination path for the image

        // Check if the profile URL is remote (starts with 'http' or 'https')
        if (profileUrl.startsWith("http") || profileUrl.startsWith("https")) {
          // Check if the file already exists
          const fileExists = await ReactNativeFS.exists(downloadDest);

          if (!fileExists) {
            // Download image to the file system if it doesn't exist already
            await ReactNativeFS.downloadFile({
              fromUrl: profileUrl,
              toFile: downloadDest,
            }).promise;
          }
        } else {
          // If it's a local file URL (file://), copy the file to the desired destination
          const fileExists = await ReactNativeFS.exists(downloadDest);

          if (!fileExists) {
            // Copy file from its current location to the local storage destination
            await ReactNativeFS.copyFile(profileUrl, downloadDest);

          }
        }

        // Set the downloaded or copied profile image path
        itemData.downloadedProfileUrl = downloadDest;
      }

      // Add the item with its downloaded images to the array
      itemsWithImages.push(itemData);
    }

    return itemsWithImages; // Return the updated data with downloaded image paths
  } catch (error) {
    console.error("Error downloading images:", error);
    return []; // Return an empty array if there's an error
  }
};

export const downloadAnnouncementImages = async (Announcement) => {
  const dataAnouncement = Announcement;
  const itemsWithImages = [];

  // Ensure Announcement is always an array (if it's a single object, convert it to an array)
  const dataArray = Array.isArray(dataAnouncement)
    ? dataAnouncement
    : [dataAnouncement];

  try {
    // Loop over each item in the announcement data
    for (let i = 0; i < dataArray.length; i++) {
      const itemData = {
        ...dataArray[i],
        downloadedThumbnailUrl: null, // Separate parameter for thumbnail image
      };
      // 2. Handle thumbnail image from `thumbnail` (single image URL)
      if (itemData.thumbnail) {
        const thumbnailUrl = itemData.thumbnail;
        const filename = thumbnailUrl.split("/").pop(); // Extract file name from URL
        const downloadDest = `${ReactNativeFS.DocumentDirectoryPath}/${filename}`; // Local destination path for the thumbnail

        // Check if the thumbnail URL is remote (starts with 'http' or 'https')
        if (
          thumbnailUrl.startsWith("http") ||
          thumbnailUrl.startsWith("https")
        ) {
          // Check if the file already exists
          const fileExists = await ReactNativeFS.exists(downloadDest);

          if (!fileExists) {
            // Download thumbnail to the file system if it doesn't exist already
            await ReactNativeFS.downloadFile({
              fromUrl: thumbnailUrl,
              toFile: downloadDest,
            }).promise;
          }
        } else {
          // If it's a local file URL (file://), copy the file to the desired destination
          const fileExists = await ReactNativeFS.exists(downloadDest);

          if (!fileExists) {
            // Copy file from its current location to the local storage destination
            await ReactNativeFS.copyFile(thumbnailUrl, downloadDest);
          }
        }

        // Set the downloaded or copied thumbnail image path
        itemData.downloadedThumbnailUrl = downloadDest;
      }
      // Add the item with its downloaded images to the array
      itemsWithImages.push(itemData);
    }

    return itemsWithImages; // Return the updated data with downloaded image paths
  } catch (error) {
    console.error("Error downloading images:", error);
    return []; // Return an empty array if there's an error
  }
};

export const getFormattedDate = () => {
  const now = new Date();

  const datePart = now.toISOString().split("T")[0]; // Extracts the date part (YYYY-MM-DD)
  const timePart = now.toISOString().split("T")[1].split("Z")[0]; // Extracts the time part (HH:MM:SS.sss)
  const formattedTime = `${timePart}+00`; // Adds the UTC offset

  return `${datePart} ${formattedTime}`; // Combines the date and time
};

const CustomDropdown = ({
  data,
  placeholder = "Select an option",
  value,
  onChange,
  style,
  dropdownStyle,
  renderLeftIcon, // Support for left icon
}) => {
  const [isFocus, setIsFocus] = useState(false);
  useEffect(() => {
    if (isFocus) Keyboard.dismiss();
  }, [isFocus])

  return (
    <Dropdown
      style={[
        styles.dropdown,
        dropdownStyle,
        isFocus && { borderColor: "blue" },
      ]}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={[
        styles.selectedTextStyle,
        { color: value === "" ? "#c1c1c1" : "#000" },
      ]}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      value={value}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={(item) => {
        onChange(item.value);
        setIsFocus(false);
      }}
      renderLeftIcon={renderLeftIcon} // Pass left icon if provided
    />
  );
};
const styles = StyleSheet.create({
  dropdown: {
    height: 50,

    borderRadius: 8,
    width: "92%",
    paddingHorizontal: 8,
  },
  // icon: {
  //   marginRight: 5,
  // },
  // label: {
  //   position: "absolute",
  //   backgroundColor: "white",
  //   left: 22,
  //   top: 8,
  //   zIndex: 999,
  //   paddingHorizontal: 8,
  //   fontSize: 14,
  // },
  placeholderStyle: {
    fontSize: 15,
    color: "#c1c1c1",
    fontFamily: "Poppins-Regular",
  },
  selectedTextStyle: {
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default CustomDropdown;
