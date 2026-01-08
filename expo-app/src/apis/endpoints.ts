import Constants from 'expo-constants';

// Type-safe extra config
type ExtraConfig = {
  API_URL?: string;
  env?: string;
};

// Safely access extra with fallback
const extra = Constants.expoConfig?.extra as ExtraConfig | undefined;

export const BASE_URL = extra?.API_URL || 'https://seabuddyapi.seekware.in/api/v1';

// Define endpoints
export const ENDPOINTS = {
  LOGIN: `${BASE_URL}/user/login`,
  REGISTER: `${BASE_URL}/user/register`,
  FORGOTPASSWORD: `${BASE_URL}/user/resendOtp`,
  VERIFYOTP: `${BASE_URL}/user/verifyOtp`,
  RESETPASSWORD: `${BASE_URL}/user/resetPassword`,
  UPLOADFILE: `${BASE_URL}/user/uploadFile`,
  uploadFileUrl: `${BASE_URL}/user/uploadFileUrl`,
  GETALLCOUNTRIES: `${BASE_URL}/user/getAllCountries`,
  UPDATEPROFILE: `${BASE_URL}/user/updateProfile`,
  GETALLASSESSMENTS: `${BASE_URL}/user/getAssessmentQuestions`,
  GETALLASSESSMENTSRESULT: `${BASE_URL}/user/getAssessmentResult`,
  SAVEASSESSMENTRESPONSE: `${BASE_URL}/user/saveAssessmentResponses`,
  GETASSESSMENTRESPONSELIST: `${BASE_URL}/user/getAssessmentResponseList`,
  GETALLCONTENTS: `${BASE_URL}/content/getAllContents`,
  GETALLPOSTS: `${BASE_URL}/user/getAllHangoutPost`,
  LIKEPOST: `${BASE_URL}/user/likeCommentHangoutPost`,
  GETALLCOMMENTS: `${BASE_URL}/user/getAllHangoutPostComments`,
  VIEW_PROFILE: `${BASE_URL}/user/viewUserProfile`,
  GET_ALL_HELPLINES: `${BASE_URL}/helpline/getAllHelplines`,
  VIEW_USER_TEST: `${BASE_URL}/user/viewUserTest`, 
  GETALLCATEGORY:`${BASE_URL}/content/getAllCategory`,
  VIEW_CONTENT_DETAILS:`${BASE_URL}/content/viewContentDetails`,
  GET_ALL_DOCTORS:`${BASE_URL}/helpline/allDoctorsList`,
  GET_ALL_BOOKED_APPOINTMENTS:`${BASE_URL}/helpline/allBookedAppointments`,
  GET_REACTIONS_ON_MESSAGE:`${BASE_URL}/user/getReactionsOnMessage`,
  GET_RECOMMENDED_CONTENTS:`${BASE_URL}/content/getRecommendedContents`,
  GETALLHELPLINES: `${BASE_URL}/helpline/getAllHelplines`,
  GETHELPLINEFORMQUESTIONS: `${BASE_URL}/helpline/getAllHelplineFormQuestions`,
  SUBMITHELPLINEANSWER: `${BASE_URL}/helpline/addHelplineFormAnswers`,
  GETALLCOMPLAINTHISTORY: `${BASE_URL}/helpline/getAllHelplineSubmittedForms`,
  GETHELPLINEANSWER: `${BASE_URL}/helpline/getOneHelplineFormAnswers`,
  GETALLADMINBUDDYUPCATEGORY: `${BASE_URL}/activity/getAllGroupActivityCategories`,
  GETUSERLEADERBOARD: `${BASE_URL}/user/getUserLeaderBoard`,
  GETALLBUDDYUPEVENTS: `${BASE_URL}/activity/getAllGroupActivity`,
  ADDEDITDELETEBUDDYUPEVENTS: `${BASE_URL}/activity/addUpdateGroupActivity`,
  VIEWBUDDYUPDETAILS: `${BASE_URL}/activity/viewGroupActivityDetails`,
  LISTALLUSERSFORTAG:`${BASE_URL}/user/listAllUsersForTag`,
  CREATEPOST:`${BASE_URL}/user/createHangoutPost`,
  UPDATEPOST:`${BASE_URL}/user/updateHangoutPost`,
  UPDATEPOSTBYID:`${BASE_URL}/user/updateHangoutPostById`,
  GETALLSHIPSLIST:`${BASE_URL}/company/getAllShipsList`,
  GETALLNOTIFICATIONS:`${BASE_URL}/user/getAllNotifications`,
  READSINGLENOTIFICATION:`${BASE_URL}/user/readSingelNotification`,
  READALLNOTIFICATIONS:`${BASE_URL}/user/readAllNotification`,
  DELETESINGLEANDCLEARALLNOTIFICATION:`${BASE_URL}/user/clearNotifications`,
  CREATECUSTOMCATEGORY: `${BASE_URL}/activity/createGroupActivityCategories`,
  CHANGE_PASSWORD:`${BASE_URL}/user/changePassword`,
  GET_MOOD_TRACKER_ANALYSIS:`${BASE_URL}/user/getMoodTrackerAnalysis`,
  GET_ALL_MOOD_TRACKER:`${BASE_URL}/user/getAllMoodTracker`,
  MOOD_TRACKER:`${BASE_URL}/user/moodTracker`,
  LISTALLUSERS:`${BASE_URL}/user/listAllUsers`,
  OFFBOARDONBOARDCREW:`${BASE_URL}/user/updateShipBoardingStatus`,
  ADDUPDATESHIPSTATUS:`${BASE_URL}/company/addUpdateShip`,
  GLOBAL_SEARCH: `${BASE_URL}/user/globalSearch`,
  GET_UNREAD_NOTIFICATION_COUNT: `${BASE_URL}/user/getUnreadNotificationCount`,
  GETAPPLASTVERSION:`${BASE_URL}/user/getLastVersion`,
  GET_UNREAD_MESSAGE_COUNT: `${BASE_URL}/user/getUnreadMessageCount`,
  BOOK_APPOINTMENT_WITH_DOCTOR: `${BASE_URL}/helpline/bookAppointmentWithDoctor`,
  GET_DATA_USAGE: `${BASE_URL}/user/getDataUsage`,
  FETCHCUSTOMSURVEY: `${BASE_URL}/user/viewUserTestList`,
  GETANALYTICS: `${BASE_URL}/user/getAnalytics`,

};