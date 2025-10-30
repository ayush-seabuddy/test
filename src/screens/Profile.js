import React, { useCallback, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import ProfileHomePageHeader from "../component/headers/ProfileHeader/ProfileHomePageHeader";
import SimpleToast from "react-native-simple-toast";
import { ImagesAssets } from "../assets/ImagesAssets";
import About from "../component/ProfileListComponents/About";
import Post from "../component/ProfileListComponents/Post";
import GroupAct from "../component/ProfileListComponents/GroupAct";
import Assessment from "../component/ProfileListComponents/Assessment";
import Task from "../component/ProfileListComponents/Task";
import Events from "../component/ProfileListComponents/Event";
import ProfleListHeader from "../component/headers/ProfileHeader/ProfleListHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiServerUrl } from "../Api";
import { useFocusEffect } from "@react-navigation/native";
import Loader from "../component/Loader";
import { useRoute } from "@react-navigation/native";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import FastImage from 'react-native-fast-image'
import Colors from "../colors/Colors";

const { width, height } = Dimensions.get("screen");
const Profile = ({ navigation }) => {
  const route = useRoute();

  React.useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params]);
  const [activeTab, setActiveTab] = useState("About");
  const [Name, setName] = useState("");
  const [profile, setProfile] = useState({});
  const [isloading, setIsLoading] = React.useState(false);

  const GetUserDetails = async () => {
    try {
      const UserData = await AsyncStorage.getItem("userDetails");
      var mydata = JSON.parse(UserData);
      setName(mydata.fullName);
      // setName(mydata.fullName);
    } catch (error) { }
  };
  React.useEffect(() => {
    GetUserDetails();
  }, []);

  const GetDetails = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    if (!dbResult) {
      SimpleToast.show("User not logged in. Please log in.");
      setIsLoading(false);
      return;
    }
    const userDetails = JSON.parse(dbResult);

    try {
      setIsLoading(true);
      const response = await axios({
        method: "GET",
        url: `${apiServerUrl}/user/viewUserProfile`,
        headers: {
          authToken: userDetails.authToken,
        },
        params: {
          userId: userDetails?.id,
        },
      });

      if (response.data.responseCode === 200) {
        // Cache the profile data in AsyncStorage
        await AsyncStorage.setItem("cachedProfile", JSON.stringify(response.data.result));
        setProfile(response.data.result);
      } else {
        // Fallback to cached data if API response is not successful
        const cachedProfile = await AsyncStorage.getItem("cachedProfile");
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
          SimpleToast.show("No internet connection.");
        } else {
          SimpleToast.show("Failed to fetch profile data.");
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      // Fallback to cached data on API failure
      const cachedProfile = await AsyncStorage.getItem("cachedProfile");
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
        SimpleToast.show("No internet connection.");
      } else {
        SimpleToast.show("Unable to connect to the server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      GetDetails();
      return () => {
      };
    }, [])
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "About":
        return <About navigation={navigation} profile={profile} setProfile={setProfile} />;
      case "Posts":
        return <Post navigation={navigation} />;
      case "BuddyUp":
        return <GroupAct navigation={navigation} />;
      case "Assessments":
        return <Assessment navigation={navigation} />;
      case "Task":
        return <Task navigation={navigation} />;
      case "Events":
        return <Events navigation={navigation} />;

      default:
        return null;
    }
  };

  return (
    <>
      {/* <StatusBar barStyle="light-content" /> */}


      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={"transparent"}
        hidden={false}
      />
      <ProfileHomePageHeader />
      {isloading && <Loader />}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <FastImage
            source={{
              uri:
                profile?.profileUrl ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
            }}
            // source={ImagesAssets.profileImage}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate("ProfilePhoto")}
          >
            <Image
              source={ImagesAssets.editActivityIcon}
              style={styles.profileeditIcon}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.Profilename}>
          {profile?.fullName
            ? profile?.fullName?.charAt(0).toUpperCase() +
            profile?.fullName?.slice(1)
            : null}
        </Text>
        <Text style={styles.Profiletag}>{profile?.designation || ""}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.editProfileBtn}
          onPress={() =>
            navigation.navigate("EditProfile", { screen: "Profile" })
          }
        >
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <ProfleListHeader
        navigation={navigation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    backgroundColor: 'white',
    alignItems: "center",
    justifyContent: 'center',
  },
  profileImageContainer: {
    height: 100,
    width: 100,
  },
  profileImage: {
    borderRadius: 100,
    height: 100,
    borderColor: Colors.secondary,
    borderWidth: 2,
    width: 100,
  },
  editProfileButton: {
    position: "absolute",
    bottom: 2,
    padding: 7,
    borderRadius: 50,
    borderColor: 'grey',
    borderWidth: 0.5,
    backgroundColor: 'white',
    right: 4,
  },
  profileeditIcon: {
    height: 18,
    width: 18,

  },
  Profilename: {
    marginTop: 10,
    fontSize: 25,
    fontWeight: "700",
    color: "black",
    fontFamily: "Poppins-Bold",
  },
  Profiletag: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "400",
    color: "black",
  },
  editProfileBtn: {
    backgroundColor: "#000",
    width: width * 0.9,
    height: height * 0.05,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  editProfileBtnText: {
    color: "#fff",
    fontFamily: "Poppins-Regular",
    fontSize: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: 'white'
  },

});

export default Profile;
