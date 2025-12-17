import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
// import wellnessOfficerListHeader from "../../component/headers/HelpLineScreensHeader/wellnessOfficerListHeader";
// import wellnessOfficerListCard from "../../component/Cards/HelpLineScreensCards/wellnessOfficerListCard";
// import { FontFamily } from "../../GlobalStyle";
import { getAllDoctors } from "@/src/apis/apiService";
import CustomLottie from "@/src/components/CustomLottie";
import WellnessOfficerCard from "@/src/screens/WellnessOfficerList/WellnessOfficerCard";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import Header from "./Header";
// import { apiCallWithToken, apiServerUrl } from "../../Api";

const { width, height } = Dimensions.get("window");

const WellnessOfficerList = ({  }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const allDoctorsList = async () => {
    try {
      setLoading(true);

      const response = await getAllDoctors({
        page: 1,
        limit: 50
      })
      if (response.data) {
        console.log("response.data: ", response.data);
        setData(response.data.doctorsList);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allDoctorsList();
  }, []);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>


          {loading && <ActivityIndicator size="large" color={"#06361F"} />}
          {data?.length > 0 ? (
            <View style={styles.cardsContainer}>
              {data?.length > 0 &&
                data.map((item, index) => (
                  <View key={index} style={styles.cardWrapper}>
                    <WellnessOfficerCard data={item} />
                    {/* <wellnessOfficerListCard navigation={navigation} data={item} /> */}
                  </View>
                ))}
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                width: width - 32,
                // height: height * 0.35,
                justifyContent: "center",
                alignItems: "center",
                // backgroundColor: "red",
              }}
            >
              <Image
                style={{ height: 130, width: 130 }}
                source={ImagesAssets.NoContent}
              />
              <Text
                style={{
                  fontSize: 20,
                  color: "#000",
                  fontFamily: "Poppins-SemiBold",
                }}
              >
                No Wellness Officer found!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Card with Lottie Animation */}
      <View style={styles.bottomCard}>
        {/* <LottieView
          source={require("../../assets/Background.json")}
          autoPlay
          loop
          style={styles.lottieBackground}
          resizeMode="cover"
        /> */}
        <CustomLottie isBlurView={false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 100
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 16,
    // fontFamily: FontFamily.bodyB14SemiBold,
  },
  filterButton: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 5,
    borderRadius: 8,
  },
  filterIcon: {
    height: 20,
    width: 20,
  },
  cardsContainer: {
    marginTop: "1%",
  },
  cardWrapper: {
    marginTop: 7,
  },
  bottomCard: {
    position: "absolute",
    width: "100%",
    height: "100%", // Cover entire screen height for background effect
    top: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: -1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  lottieBackground: {
    width: width,
    height: height,
    position: "absolute",
    top: 0,
  },
});

export default WellnessOfficerList;
