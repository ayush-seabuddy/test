import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./apiHelpers";
import { ENDPOINTS } from "./endpoints";

export interface LoginRequest {
  email: string;
  password: string;
  deviceToken?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
}

export interface UploadFileRequest {
  file: any;
  fileName: any;
  fileSize: any;
  type: any
}

export interface SocialPostParams {
  page?: number;
  limit?: number;
  postId?: string;
  userId?: string;

}
export interface UpdatePostRequest {
  hangoutId?: string;
  reason?: string;
  status?: string
}

export interface UpdatePostByIdRequest {
  id: string,
  imageUrls?: string[];
  caption: string;
  tags?: string[];
  hashtags?: string[];
  ratioValue?: number;
  imageresizeMode?: string;
}

export interface LikePostRequest {
  hangoutId: string,
  comment: string,
  isLiked: true,
}

export interface ViewProfileParams {
  userId?: string;
  version?: string;
  os?: string;
  packageName?: string
}

export interface SaveAssessmentRequest {
  questionType: string;
  month: string;
  answers: {
    questionId: string;
    answer: number;
    createdAt: string;
  }[];
}

export type BuddyUpStatus =
  | "ACTIVE"
  | "BLOCK"
  | "DELETE"
  | "REJECTED"
  | "COMPLETED"
  | "REQUESTED"
  | "REPORTED";

export interface AddEditDeleteBuddyUpEventRequest {
  groupActivities?: {
    eventId?: string;
    eventName?: string | null;
    description?: string;
    categoryId?: string | null;
    location?: string | null;
    startDateTime?: string;
    endDateTime?: string;
    timezone?: string;
    imageUrls?: string[];
    completionImages?: string[];
    joinedPeople?: string[];
    isPublic?: boolean;
    points?: number;
    hashtags?: string[] | undefined;
    shipId?: any;
    createdAt?: string;
    completionDescription?: string;
    status?: BuddyUpStatus;
  }[];
}

export interface CreateCustomCategoryRequest {
  categoryName: string,
  categoryImage: string,
}


export interface Hangout {
  imageUrls?: string[];
  caption: string;
  tags?: string[];
  hashtags?: string[];
  ratioValue?: number;
  imageresizeMode?: string;
  createdAt?: string;
}

export interface CreatePostRequest {
  hangouts: Hangout[];
}

export interface SubmitHelplineAnswerRequest {
  helplineId: string;
  answers: {
    helplineQuestionId: string;
    answer: string;
    createdAt: string;
  }[];
}


export interface ApiResponse<T = any> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

export interface UpdateProfileRequest {
  userId?: string;
  fullName?: string;
  countryCode?: string;
  mobileNumber?: string;
  email?: string;

  profileUrl?: string;
  password?: string;
  address?: string;

  gender?: string;
  rank?: string;
  experience?: string;
  relationshipStatus?: string;
  nationality?: string;
  ethnicity?: string;
  religion?: string;
  scriptures?: string;

  hobbies?: string[];
  favoriteActivity?: string[];
  currentMood?: string;
  socialInteraction?: string;

  smoker?: string;
  healthCondition?: string;
  alcohol?: string;

  bio?: string;
  dob?: string;

  workingExperience?: {
    id?: string;
    companyName?: string;
    role?: string;
    from?: string;
    to?: string;
    status?: string;
    createdAt?: string;
  }[];

  SocialMediaLinks?: {
    platform: string;
    link: string;
  }[];

  certifications?: {
    id: string;
    certificateName?: string;
    from?: string;
    to?: string;
    organization?: string;
    status?: "DELETE";
    createdAt?: string;
  }[];

  status?: string;
  isProfileCompleted?: true;
}



export interface GetAllAssessmentsParams {
  questionType?: string
}

export interface GetAllAssessmentsResultParams {
  questionType?: string
}

export interface GetAllAssessmentResponseListParams {
  assessmentType?: string
}

export interface GetAllContentsParams {
  page?: number,
  limit?: number,
  onlyAnnouncement?: boolean,
  contentCategory?: string,
  contentType?: string,
  department?: string,
  subCategory?: string
}

export interface ViewContentDetailsParams {
  contentId?: string
}

export interface GetAllDoctorsParams {
  page?: number,
  limit?: number,
  contentCategory?: string,
  contentType?: string,
}

export interface GetAllCommentsParams {
  hangoutId: string
  page?: number,
  limit?: number,
}
export interface GetAllHelplinesParams {
  helplineType?: string
}

export interface GetAllComplaintHistoryParams {
  page?: number,
  limit?: number,
}

export interface GetAllBookedAppointmentsParams {
  page?: number,
  limit?: number,
}

export interface GetReactionsOnMessageParams {
  messageId: string,
  page?: number,
  limit?: number,
}

export interface GetRecommendedContentsParams {
  contentId: string,
}
export interface GetSingleHelplineAnswerParams {
  helplineFormId: string,
}

export interface GETALLADMINBUDDYUPCATEGORYParams {
  isAdmin?: boolean;
  page?: number,
  limit?: number
}

export interface GetAllBuddyUpEventParams {
  page: number,
  limit: number,
  eventType?: string,
  filter?: string,
  userId?: string
}

export interface ViewBuddyUpDetailsParams {
  eventId: string
}

export interface GetAllShipsListParams {
  employerId: string
}

export interface GetAllNotificationsParams {
  page: number,
  limit: number,
}

export interface ListAllUsersParams {
  shipId: string,
  department?: string,
  page: number,
  limit: number,
}

export interface GetAnalyticsParams {
  fromMonth: string,
  toMonth: string
}

export interface GetSurveyByIdParams {
  surveyId: string
}

export interface signoutPayload {
  deviceTokens: string[]
}

export interface SubmitSurveyPayload {
  surveyId: string;
  responseJson: {
    questionId: string;
    answer: any;  // string | number | string[] | { fileName: string; url: string } | null
  }[];
}

export interface ReadSingleNotificationRequest {
  notificationId: string
}

export interface OffboardOnboardCrewRequest {
  shipId: string,
  boardedStatus: [
    {
      userId: string,
      isBoarded: boolean
    }
  ]
}

export interface AddUpdateShipStatusRequest {
  shipId?: string;
  crewMembers?: {
    userId?: string;
  }[];
  employerId?: string;
}
export interface DeleteAndClearAllNotificationRequest {
  notificationId?: string,
}

export interface GetMoodTrackerAnalysisParams {
  month: number,
  year: number
}

export interface GetAllMoodTrackerParams {
  page: number,
  limit: number,
}

export interface ListAllUsersForTagParams {
  shipId: string
}

export interface GetLeaderboardParams {
  isZero?: boolean,
  page?: number,
  limit?: number,
  shipId?: string,
  designation?: string,
}

export interface ChangePassword {
  currentPassword: string,
  newPassword: string,
}

export interface MoodTrackerPayload {
  mood?: string,
  feeling?: string,
  reason?: string,
  details?: string,
  createdAt?: string,
}

export interface MoodTrackerRequest {
  moodTrackers: MoodTrackerPayload[],
}

export interface BookAppointmentWithDoctorRequest {
  doctorId: string,
  description: string,
  dateTime: string,
  images?: string[],
}

export interface GetDataUsageParams {
  month: string,
}

export const login = async (
  payload: LoginRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.LOGIN,
    data: payload,
  });
};

export const register = async (
  payload: RegisterRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.REGISTER,
    data: payload,
  });
};

export const forgotpassword = async (
  payload: ForgotPasswordRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.FORGOTPASSWORD,
    data: payload,
  });
};

export const verifyotp = async (
  payload: VerifyOtpRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.VERIFYOTP,
    data: payload,
  });
};

export const resetpassword = async (
  payload: ResetPasswordRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.RESETPASSWORD,
    data: payload,
  });
};


export const uploadfile = async (payload: UploadFileRequest) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const data = {
      fileName: payload.fileName,
      fileType: payload.type,
      fileSize: payload.fileSize,
    };
    console.log("data: sdfnskldfld", data);
    const response = await apiRequest({
      method: 'POST',
      url: ENDPOINTS.uploadFileUrl,
      data: data,
    });

    console.log("response: ", response);
    const { uploadUrl, key } = response.data;
    // 2️⃣ Convert file URI to blob
    const fileResponse = await fetch(payload.file);
    const blob = await fileResponse.blob();

    // 3️⃣ Upload to S3
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': payload.type,
      },
      body: blob,
    });

    console.log("uploadRes: ", uploadRes);
    if (!uploadRes.ok) {
      throw new Error('S3 upload failed');
    }
    return {
      success: true,
      status: 200,
      data: `https://seabuddy.s3.us-east-1.amazonaws.com/${key}`
    }
  } catch (error) {
    console.log('UPLOAD ERROR:', error);
    throw error;
  }
};


export const getallcountries = async (): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLCOUNTRIES,
  });
};

export const updateprofile = async (
  payload: UpdateProfileRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "PUT",
    url: ENDPOINTS.UPDATEPROFILE,
    data: payload,
  });
};

export const getallposts = async (
  params?: SocialPostParams
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLPOSTS,
    params,
  });
};

export const updatepost = async (
  payload: UpdatePostRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "PUT",
    url: ENDPOINTS.UPDATEPOST,
    data: payload,
  });
};

export const updatepostbyid = async (
  payload: UpdatePostByIdRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "PUT",
    url: ENDPOINTS.UPDATEPOSTBYID,
    data: payload,
  });
};

export const likecommentpost = async (
  payload: LikePostRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "PUT",
    url: ENDPOINTS.LIKEPOST,
    data: payload,
  });
};

export const viewProfile = async (
  params?: ViewProfileParams
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.VIEW_PROFILE,
    params
  });
};


export const getallassessments = async (params?: GetAllAssessmentsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLASSESSMENTS,
    params
  });
};


export const saveassessmentresponse = async (
  payload: SaveAssessmentRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.SAVEASSESSMENTRESPONSE,
    data: payload,
  });
};


export const getallassessmentsResult = async (params?: GetAllAssessmentsResultParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLASSESSMENTSRESULT,
    params
  });
};


export const getassessmentresponseList = async (params?: GetAllAssessmentResponseListParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETASSESSMENTRESPONSELIST,
    params
  });
};

export const getallcontents = async (params?: GetAllContentsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLCONTENTS,
    params
  });
};


export const getAllHelplines = async (params?: GetAllHelplinesParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GET_ALL_HELPLINES,
    params
  });
};
export const getallcomments = async (params?: GetAllCommentsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLCOMMENTS,
    params
  });
};

export const viewUserTest = async (): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.VIEW_USER_TEST,
  });
}

export const getAllCategory = async (): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLCATEGORY,
  });
};

export const viewContentDetails = async (params?: ViewContentDetailsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.VIEW_CONTENT_DETAILS,
    params
  });
};
export const getallhelplines = async (params?: GetAllHelplinesParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLHELPLINES,
    params
  });
};

export const getAllDoctors = async (params?: GetAllDoctorsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GET_ALL_DOCTORS,
  });
};

export const gethelplineformquestions = async (): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETHELPLINEFORMQUESTIONS,
  });
};

export const submithelplineanswer = async (
  payload: SubmitHelplineAnswerRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.SUBMITHELPLINEANSWER,
    data: payload,
  });
};

export const getallcomplainthistory = async (params?: GetAllComplaintHistoryParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLCOMPLAINTHISTORY,
    params
  });
};

export const getAllBookedAppointments = async (params?: GetAllBookedAppointmentsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GET_ALL_BOOKED_APPOINTMENTS,
    params
  });
};

export const getReactionsOnMessage = async (params?: GetReactionsOnMessageParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GET_REACTIONS_ON_MESSAGE,
    params
  });
};

export const getRecommendedContents = async (params?: GetRecommendedContentsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GET_RECOMMENDED_CONTENTS,
    params
  });
};

export const getsinglehelplineanswer = async (params?: GetSingleHelplineAnswerParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETHELPLINEANSWER,
    params,
  });
};
export const getalladminbuddyupcategories = async (params?: GETALLADMINBUDDYUPCATEGORYParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLADMINBUDDYUPCATEGORY,
    params,
  });
};


export const getleaderboard = async (params?: GetLeaderboardParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETUSERLEADERBOARD,
    params,
  });
};

export const GETALLBUDDYUPEVENTS = async (params?: GetAllBuddyUpEventParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLBUDDYUPEVENTS,
    params,
  });
};

export const addeditdeletebuddyupevent = async (
  payload: AddEditDeleteBuddyUpEventRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.ADDEDITDELETEBUDDYUPEVENTS,
    data: payload,
  });
};


export const viewbuddyupdetails = async (params?: ViewBuddyUpDetailsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.VIEWBUDDYUPDETAILS,
    params,
  });
};

export const listallusersfortag = async (params?: ListAllUsersForTagParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.LISTALLUSERSFORTAG,
    params,
  });
};

export const createpost = async (
  payload: CreatePostRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.CREATEPOST,
    data: payload,
  });
};


export const getallshipslist = async (params?: GetAllShipsListParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLSHIPSLIST,
    params,
  });
};


export const getMoodTrackerAnalysis = async (params?: GetMoodTrackerAnalysisParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GET_MOOD_TRACKER_ANALYSIS,
    params,
  });
};

export const getAllMoodTracker = async (params?: GetAllMoodTrackerParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GET_ALL_MOOD_TRACKER,
    params,
  });
}


export const changePassword = async (
  payload: ChangePassword
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.CHANGE_PASSWORD,
    data: payload,
  });
}

export const moodTracker = async (
  payload: MoodTrackerRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.MOOD_TRACKER,
    data: payload,
  });
}

export const getallnotifications = async (params?: GetAllNotificationsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLNOTIFICATIONS,
    params,
  });
};


export const readsinglenotification = async (params?: ReadSingleNotificationRequest): Promise<ApiResponse> => {
  return await apiRequest({
    method: "PUT",
    url: ENDPOINTS.READSINGLENOTIFICATION,
    params,
  });
};

export const readallnotifications = async (): Promise<ApiResponse> => {
  return await apiRequest({
    method: "PUT",
    url: ENDPOINTS.READALLNOTIFICATIONS,
  });
};


export const deleteandclearallnotification = async (params?: DeleteAndClearAllNotificationRequest): Promise<ApiResponse> => {
  return await apiRequest({
    method: "DELETE",
    url: ENDPOINTS.DELETESINGLEANDCLEARALLNOTIFICATION,
    params,
  });
};

export const createcustomcategory = async (
  payload: CreateCustomCategoryRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.CREATECUSTOMCATEGORY,
    data: payload,
  });
};

export const listallusers = async (params?: ListAllUsersParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.LISTALLUSERS,
    params,
  });
};




export const offboardonboardcrew = async (
  payload: OffboardOnboardCrewRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "PUT",
    url: ENDPOINTS.OFFBOARDONBOARDCREW,
    data: payload,
  });
};

export const addupdateshipstatus = async (
  payload: AddUpdateShipStatusRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.ADDUPDATESHIPSTATUS,
    data: payload,
  });
};

export const globalSearch = async (search: string): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GLOBAL_SEARCH,
    params: { search: search },
  });
}

export const getUnreadNotificationCount = async (): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GET_UNREAD_NOTIFICATION_COUNT,
  });
}

export const getUnreadMessageCount = async (): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GET_UNREAD_MESSAGE_COUNT,
  });
}

export const bookAppointmentWithDoctor = async (payload: BookAppointmentWithDoctorRequest): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.BOOK_APPOINTMENT_WITH_DOCTOR,
    data: payload,
  });
}

export const getDataUsage = async (params?: GetDataUsageParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GET_DATA_USAGE,
    params,
  });
}

export const getapplastversion = async (): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETAPPLASTVERSION,
  });
}

export const fetchcustomsurvey = async (): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.FETCHCUSTOMSURVEY,
  });
}

export const getAnalytics = async (params?: GetAnalyticsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    params,
    url: ENDPOINTS.GETANALYTICS,
  });
}


export const logout = async (payload: signoutPayload): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.LOGOUT,
    data: payload,
  });
}

export const getsurveybyid = async (params?: GetSurveyByIdParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    params,
    url: ENDPOINTS.GETSURVEYBYID,
  });
}

export const submitsurvey = async (payload: SubmitSurveyPayload): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.SUBMITSURVEY,
    data: payload,
  });
}
