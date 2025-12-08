import Constants from 'expo-constants';
import { BaseGesture } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/gesture';

// Type-safe extra config
type ExtraConfig = {
  API_URL?: string;
  env?: string;
};

// Safely access extra with fallback
const extra = Constants.expoConfig?.extra as ExtraConfig | undefined;

export const BASE_URL = extra?.API_URL;

// Define endpoints
export const ENDPOINTS = {
  LOGIN: `${BASE_URL}/user/login`,
  REGISTER: `${BASE_URL}/user/register`,
  FORGOTPASSWORD: `${BASE_URL}/user/resendOtp`,
  VERIFYOTP: `${BASE_URL}/user/verifyOtp`,
  RESETPASSWORD: `${BASE_URL}/user/resetPassword`,
  UPLOADFILE: `${BASE_URL}/user/uploadFile`,
  GETALLCOUNTRIES: `${BASE_URL}/user/getAllCountries`,
  UPDATEPROFILE: `${BASE_URL}/user/updateProfile`,
  GETALLASSESSMENTS: `${BASE_URL}/user/getAssessmentQuestions`,
  GETALLASSESSMENTSRESULT: `${BASE_URL}/user/getAssessmentResult`,
  SAVEASSESSMENTRESPONSE: `${BASE_URL}/user/saveAssessmentResponses`,
  GETASSESSMENTRESPONSELIST: `${BASE_URL}/user/getAssessmentResponseList`,
  GETALLCONTENTS: `${BASE_URL}/content/getAllContents`,
  GETALLPOSTS: `${BASE_URL}/user/getAllHangoutPost`,
  UPDATEPOST: `${BASE_URL}/user/updateHangoutPost`,
  LIKEPOST: `${BASE_URL}/user/likeCommentHangoutPost`,
  GETALLCOMMENTS: `${BASE_URL}/user/getAllHangoutPostComments`,
  VIEW_PROFILE: `${BASE_URL}/user/viewUserProfile`,
  GETALLHELPLINES: `${BASE_URL}/helpline/getAllHelplines`,
  GETHELPLINEFORMQUESTIONS: `${BASE_URL}/helpline/getAllHelplineFormQuestions`,
  SUBMITHELPLINEANSWER: `${BASE_URL}/helpline/addHelplineFormAnswers`,
  GETALLCOMPLAINTHISTORY: `${BASE_URL}/helpline/getAllHelplineSubmittedForms`,
  GETHELPLINEANSWER: `${BASE_URL}/helpline/getOneHelplineFormAnswers`,
  GetAllAdminBuddyUpEvents: `${BASE_URL}/activity/getAllGroupActivityCategories`,
  GETUSERLEADERBOARD:`${BASE_URL}/user/getUserLeaderBoard`,

};