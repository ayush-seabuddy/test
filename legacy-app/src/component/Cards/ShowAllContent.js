import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Platform,
  Dimensions,
  Text,
} from "react-native";
import { ImagesAssets } from "../assets/ImagesAssets";
// import AnouncementDetailsHeader from "../component/headers/AnouncementDetailsHeader";
// import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
// import AllMediaCard from "../component/Cards/AllMediaCard"; // Reusing AllMediaCard for rendering
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { apiCallWithToken, apiServerUrl } from "../Api";
// import CustomLottie from "../component/CustomLottie";
import AnouncementDetailsHeader from "../headers/AnouncementDetailsHeader";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import AllMediaCard from "./AllMediaCard";
import CustomLottie from "../CustomLottie";
import HeaderForAllMedia from "../headers/HeaderForAllMedia";
import { apiCallWithToken, apiServerUrl } from "../../Api";

const { width, height } = Dimensions.get("window");
// CustomLottie

const ShowAllContent = ({ navigation, route }) => {
  const [data, setData] = useState(route?.params?.data?.allContents || route?.params?.data || []);
  const headerName = route?.params?.headerName || "All Content";
  const contentSubCategory = route?.params?.contentSubCategory || "";
  console.log("contentSubCategory: ", route?.params);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(2);
  const [contentType, setContentType] = useState("");

const fetchContentList = async (type, newPage) => {
  // ✅ Rename the local variable to avoid shadowing
  const currentPage = newPage ?? page;
  console.log("📄 Fetching page:", currentPage, "of", totalPage);

  // Prevent fetching beyond total pages
  if (currentPage !== 1 && currentPage > totalPage) return;

  try {
    setLoading(true);
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);

    // ✅ Start forming the base URL cleanly
    let url = route?.params?.url
      ? `${route?.params?.url}&page=${currentPage}&subCategory=${contentSubCategory}`
      : `${apiServerUrl}/content/getAllContents?page=${currentPage}`;

    // ✅ Append conditional parameters safely
    if (type && contentType) {
      url = `${url}&contentType=${contentType}`;
    }
    if (contentSubCategory) {
      url = `${url}&subCategory=${contentSubCategory}`;
    }

    console.log("🌐 Final URL:", url);

    const result = await apiCallWithToken(url, "GET", null, userDetails.authToken);
    console.log("📦 API Result:", result);

    if (result.responseCode === 200) {
      if (currentPage === 1) {
        setData(result?.result?.allContents || []);
      } else {
        setData((prevData) => [
          ...prevData,
          ...(result?.result?.allContents || []),
        ]);
      }

      setTotalPage(result?.result?.totalPages || 1);
    } else {
      console.log("⚠️ API responded with non-200 code:", result.responseCode);
    }
  } catch (error) {
    console.log("❌ API Error:", error.response?.data || error.message);
  } finally {
    setLoading(false);
    // ✅ Increment using currentPage reference
    setPage(currentPage + 1);
  }
};

  // useEffect(() => {
  //   fetchContentList(contentType);
  // }, [page]);

  useEffect(() => {
    setPage(1)
    fetchContentList(contentType, 1);

  }, [contentType]);

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <HeaderForAllMedia navigation={navigation} title={headerName} setContentType={setContentType} />

        {/* StatusBar */}
        <FocusAwareStatusBar
          barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
          backgroundColor={"#fff"}
          hidden={false}
        />

        {console.log("data.length: ", data.length)}
        <View style={styles.scrollView}>
          {data.length > 0 ? (
            <AllMediaCard
              navigation={navigation}
              data={data}
              fetchUserList={fetchContentList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Image
                style={{ height: 80, width: 80 }}
                source={require("../../assets/images/AnotherImage/no-content.png")}
              />
              <Text style={styles.emptyText}>No Content Found</Text>
            </View>
          )}
        </View>
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
        <CustomLottie customSyle={{
          width: width * 1,
          height: height * 0.68,
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
        }} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    height: "90%",
  },
  lottieContainer: {
    backgroundColor: "#c1c1c1",
    height: "50%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    zIndex: -1,
    position: "absolute",
    bottom: 0,
    width: width,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    width,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#000",
    marginTop: 10,
  },
});

export default ShowAllContent;