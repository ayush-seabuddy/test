// App.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashLogo from "../../splashscreens/SplashLogo";
import IntroScreen1 from "../introscreens/IntroScreen1";
import IntroScreen2 from "../introscreens/IntroScreen2";
import IntroScreen3 from "../introscreens/IntroScreen3";
import IntroScreen4 from "../introscreens/IntroScreen4";
import IntroScreen5 from "../introscreens/IntroScreen5";
import HelperLanding from "../../screens/HelperLanding";
import BottomNavBar from "../../component/BottomNavBar";
import MBTI from "../../screens/Mbti_Screens/Mbti";
import Mbti_Start_Test from "../../screens/Mbti_Screens/Mbti_Start_Test";
import Mbti_Test_2 from "../../screens/Mbti_Screens/Mbti_Test_2";
import Mbti_Test_3 from "../../screens/Mbti_Screens/Mbti_Test_3";
import Search from "../../screens/Search";
import SearchType from "../../screens/SearchType";
import SearchResult from "../../screens/SearchResult";
import ChatRoom from "../../screens/ChatRoom";
import GroupChat from "../../screens/GroupChat";
import Terms from "../../Terms";
import Articles from "../../screens/Articles";
import ArticlesDetails from "../../screens/ArticlesDetails";
import VideosDetails from "../../screens/VideosDetails";
import Playlist from "../../screens/Playlist";
import UploadPhoto from "../../screens/ProfileScreens/UploadPhoto";
import UplloadedPhoto from "../../screens/ProfileScreens/UplloadedPhoto";
import UpdateProfile from "../../screens/ProfileScreens/UpdateProfile";
import PersonaResult from "../../screens/PersonaResult";
import HelpLine from "../../screens/HelpLineScreens/HelpLine";
import BookAppoinment from "../../screens/HelpLineScreens/BookAppoinment";
import DoctorProfile from "../../screens/HelpLineScreens/DoctorProfile";
import AppointmentForm from "../../screens/HelpLineScreens/AppointmentForm";
import HelpLineForm from "../../screens/HelpLineScreens/HelpLineForm";
import EventList from "../../screens/EventList";
import WorkoutBuddies from "../../screens/WorkoutBuddies";
import Leaderboard from "../../screens/LeaderboardScreens/Leaderboard";
import CrewProfile from "../../screens/LeaderboardScreens/CrewProfile";
import ActivityLog from "../../screens/ActivityLog";
import CrewList from "../../screens/CrewList";
import AiChat from "../../screens/AiChat";
import Setting from "../../screens/Setting";
import EditProfile from "../../screens/EditProfile";
import ProfilePhoto from "../../screens/ProfilePhoto";
import Huddle from "../../screens/Huddle";
import NewPost from "../../screens/NewPost";
import Analytics from "../../screens/Analytics";
import MoodTracker from "../../screens/MoodTracker";
import CreateGroupActivity from "../../screens/CreateGroupActivity";
import ActivityCalender from "../../component/ActivityCalender";
import Anouncement from "../../screens/Anouncement";
import Notifications from "../../screens/Notifications";
import CommentSection from "../../screens/CommentSection";
import MoodTrackerHistory from "../../screens/MoodTrackerHistory";
import ApprovalFromCaptain from "../../screens/ApprovalScreenGroupActivity";
import NewGroupActivityPost from "../../screens/NewGroupActivityPost";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";
import { Alert } from "react-native";
import MusicPlayer from "../../component/Cards/personaResultCards/MusicPlayer";
import PublicScreen from "../../screens/PublicScreen";
import WorkExperienceScreen from "../../screens/WorkExperienceScreen";
import Certifications from "../../screens/Certifications";
import SocialMediaLinks from "../../screens/SocialMediaLinks";
import AnouncementDetails from "../../screens/AnouncementDetails";
import ShowAllVideo from "../../screens/ShowAllVideo";
import ShowAllMusic from "../../screens/ShowAllMusic";
import ShowAllActivity from "../../screens/ShowAllActivity";
import HappinessIndex from "../../screens/HappinessIndex";
import JollyAi from "../../component/JollyAi";
import POMSTest from "../../screens/POMSTest";
import AllAssessmentTest from "../../component/AllAssessmentTest";
import ViewAssessmentResult from "../../screens/ViewAssessmentResult";
import AllPOMSAssementResult from "../../screens/AllPOMSAssementResult";
import BookedAppoinment from "../../screens/HelpLineScreens/BookedAppoinment";
import BookedDoctorProfile from "../../screens/HelpLineScreens/BookedDoctorProfile";
import AllListHelplinesForm from "../../screens/AllListHelplinesForm";
import HelpLineFormResult from "../../screens/HelpLineScreens/HelpLineFormResult";
import HealthDataScreen from "../../screens/HealthDataScreen";
import GraphScreen from "../../screens/GraphScreen";
import Assessment from "../../component/ProfileListComponents/Assessment";
import SinglePost from "../../screens/SinglePost";
import WebView from "../../screens/WebView";
import PersonalityResultInfoPopup from "../../screens/PersonalityMapInfoPopup";
import MediaFlatList from "../../screens/eventPost";
import ShowAllActivities from "../../screens/ShowAllActivities";
import ShowAllContent from "../../component/Cards/ShowAllContent";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ChangePasswordScreen from "../../screens/ChangePassword";
import Profile from "../../screens/Profile";
import CustomSurvey from "../../CustomSurvey";

const Stack = createStackNavigator();

const AppNav = () => {
  useEffect(() => {
    // Request camera and gallery permissions on app launch
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Request camera permission
    const cameraStatus = await request(
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA
    );

    // Request gallery (photo library) permission
    // const galleryStatus = await request(
    //   Platform.OS === 'ios'
    //     ? PERMISSIONS.IOS.PHOTO_LIBRARY
    //     : Platform.OS === 'android' && Platform.Version >= 29
    //     ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES // Android 10+
    //     : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE // Android 9 and below
    // );

    handlePermissions(cameraStatus);
  };

  const handlePermissions = (cameraStatus) => {
    if (cameraStatus === RESULTS.GRANTED) {
      // Permissions granted
      //Alert.alert('Permissions Granted', 'You can access the camera and gallery.');
    } else {
      // Permissions denied
      Alert.alert(
        "Permissions Denied",
        "Some permissions are required for full functionality."
      );
    }
  };

  // if (Platform.OS === 'ios') {
  //   useEffect(() => {
  //     requestUserPermission();
  //     notificationListener();
  //   }, []);
  // }

  return (
    <SafeAreaProvider>
  <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="IntroScreen1"
        component={IntroScreen1}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IntroScreen2"
        component={IntroScreen2}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IntroScreen3"
        component={IntroScreen3}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IntroScreen4"
        component={IntroScreen4}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IntroScreen5"
        component={IntroScreen5}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HelperLanding"
        component={HelperLanding}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={BottomNavBar}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Mbti"
        component={MBTI}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Mbti_Start_Test"
        component={Mbti_Start_Test}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Mbti_Test_2"
        component={Mbti_Test_2}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Mbti_Test_3"
        component={Mbti_Test_3}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Search"
        component={Search}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SearchType"
        component={SearchType}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SearchResult"
        component={SearchResult}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoom}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupChat"
        component={GroupChat}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Terms and Conditions"
        component={Terms}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Articles"
        component={Articles}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ArticlesDetails"
        component={ArticlesDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VideosDetails"
        component={VideosDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Playlist"
        component={Playlist}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UploadPhoto"
        component={UploadPhoto}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UplloadedPhoto"
        component={UplloadedPhoto}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpdateProfile"
        component={UpdateProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PersonaResult"
        component={PersonaResult}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HelpLine"
        component={HelpLine}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookAppoinment"
        component={BookAppoinment}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorProfile"
        component={DoctorProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppointmentForm"
        component={AppointmentForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HelpLineForm"
        component={HelpLineForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventList"
        component={EventList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkoutBuddies"
        component={WorkoutBuddies}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={Leaderboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShowAllVideo"
        component={ShowAllVideo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShowAllContent"
        component={ShowAllContent}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShowAllMusic"
        component={ShowAllMusic}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShowAllActivity"
        component={ShowAllActivity}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShowAllActivities"
        component={ShowAllActivities}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CrewProfile"
        component={CrewProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActivityLog"
        component={ActivityLog}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CrewList"
        component={CrewList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AiChat"
        component={AiChat}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Setting"
        component={Setting}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ headerShown: false, title: "Edit Profile" }}
      />
      <Stack.Screen
        name="ProfilePhoto"
        component={ProfilePhoto}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkExperienceScreen"
        component={WorkExperienceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Certifications"
        component={Certifications}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SocialMediaLinks"
        component={SocialMediaLinks}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Huddle"
        component={Huddle}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewPost"
        component={NewPost}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewGroupActivityPost"
        component={NewGroupActivityPost}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Analytics"
        component={Analytics}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Assessment"
        component={Assessment}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HealthDataScreen"
        component={HealthDataScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MoodTracker"
        component={MoodTracker}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GraphScreen"
        component={GraphScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MoodTrackerHistory"
        component={MoodTrackerHistory}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateGroupActivity"
        component={CreateGroupActivity}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActivityCalender"
        component={ActivityCalender}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Anouncement"
        component={Anouncement}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AnouncementDetails"
        component={AnouncementDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ApprovalFromCaptain"
        component={ApprovalFromCaptain}
        options={{ headerShown: false }}
      />
      {/* ApprovalFromCaptain */}
      <Stack.Screen
        name="Comment"
        component={CommentSection}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="MusicPlayer"
        component={MusicPlayer}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="PublicScreen"
        component={PublicScreen}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />

      <Stack.Screen
        name="WebView"
        component={WebView}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="SinglePost"
        component={SinglePost}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="SingleGroupActivityPost"
        component={MediaFlatList}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="HappinessIndex"
        component={HappinessIndex}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="AllAssessmentTest"
        component={AllAssessmentTest}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="ViewAssessmentResult"
        component={ViewAssessmentResult}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="HelpLineFormResult"
        component={HelpLineFormResult}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="AllListHelplinesForm"
        component={AllListHelplinesForm}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="AllPOMSAssementResult"
        component={AllPOMSAssementResult}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="BookedAppoinment"
        component={BookedAppoinment}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="BookedDoctorProfile"
        component={BookedDoctorProfile}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="POMSTest"
        component={POMSTest}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="JollyAi"
        component={JollyAi}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="PersonalityResultInfoPopup"
        component={PersonalityResultInfoPopup}
        options={{
          headerShown: false,
          // headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="CustomSurvey"
        component={CustomSurvey}
        options={{
          headerShown: false,
        }}
      />

      
    </Stack.Navigator>
    </SafeAreaProvider>
  
  );
};

export default AppNav;
