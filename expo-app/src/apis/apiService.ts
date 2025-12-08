import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./apiHelpers";
import { ENDPOINTS } from "./endpoints";

export interface LoginRequest {
  email: string;
  password: string;
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
  file: string;
}

export interface SocialPostParams {
  page?: number;
  limit?: number;
}
export interface UpdatePostRequest {
  hangoutId?: string;
  reason?: string;
  status?: string
}

export interface LikePostRequest {
  hangoutId: string,
  comment: string,
  isLiked: true,
}

export interface ViewProfileParams {
  userId?: string;
}

export interface SaveAssessmentRequest {
  questionType: string;
  month: string;
  answers: Array<{
    questionId: string;
    answer: number;
    createdAt: string;
  }>;
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

  workingExperience?: Array<{
    id: string;
    companyName: string;
    role: string;
    from: string;
    to: string;
    status: "DELETE";
    createdAt: string;
  }>;

  SocialMediaLinks?: Array<{
    platform: string;
    link: string;
  }>;

  certifications?: Array<{
    id: string;
    certificateName: string;
    from: string;
    to: string;
    organization: string;
    status: "DELETE";
    createdAt: string;
  }>;

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

export interface GetSingleHelplineAnswerParams {
  helplineFormId: string,
}

export interface GetAllAdminBuddyUpEventsParams {
  isAdmin: boolean;
}

export interface GetLeaderboardParams {
  isZero:boolean;
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
    const formData = new FormData();
    formData.append('file', {
      uri: payload.file,
      name: 'image.jpg',
      type: 'image/jpeg',
    } as any);
    const response = await apiRequest({
      method: 'POST',
      url: ENDPOINTS.UPLOADFILE,
      data: formData,
    });
    return response;
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

export const getallcomments = async (params?: GetAllCommentsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLCOMMENTS,
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

export const getsinglehelplineanswer = async (params?: GetSingleHelplineAnswerParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETHELPLINEANSWER,
    params,
  });
};
export const getalladminbuddyupevents = async (params?: GetAllAdminBuddyUpEventsParams): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GetAllAdminBuddyUpEvents,
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

