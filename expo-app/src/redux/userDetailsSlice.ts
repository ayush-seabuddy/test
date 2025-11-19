import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UserDetails {
  authToken: string;
  companyDescription: string;
  companyLogo: string;
  companyName: string;
  countryCode: string;
  department: string;
  designation: string;
  email: string;
  employerId: string;
  fullName: string;
  id: string;
  isActive: boolean;
  isBoarded: boolean;
  isHappinessIndex: boolean;
  isMoodTracker: boolean;
  isPersonalityTestCompleted: boolean;
  isProfileCompleted: boolean;
  mobileNumber: string;
  notificationCount: number;
  profileUrl: string;
  rewardPoints: string;
  shipId: string;
  status: string;
  uniqueId: string;
  userType: string;
  [key: string]: any;
}

const initialState: UserDetails = {
  authToken: "",
  companyDescription: "",
  companyLogo: "",
  companyName: "",
  countryCode: "",
  department: "",
  designation: "",
  email: "",
  employerId: "",
  fullName: "",
  id: "",
  isActive: false,
  isBoarded: false,
  isHappinessIndex: false,
  isMoodTracker: false,
  isPersonalityTestCompleted: false,
  isProfileCompleted: false,
  mobileNumber: "",
  notificationCount: 0,
  profileUrl: "",
  rewardPoints: "",
  shipId: "",
  status: "",
  uniqueId: "",
  userType: "",
};

export const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<Partial<UserDetails>>) => {
      return { ...state, ...action.payload };
    },
    updateUserField: (
      state,
      action: PayloadAction<{ key: keyof UserDetails; value: any }>
    ) => {
      state[action.payload.key] = action.payload.value;
    },
    clearUserDetails: () => initialState,
  },
});

export const {
  setUserDetails,
  updateUserField,
  clearUserDetails
} = userDetailsSlice.actions;

export default userDetailsSlice.reducer;
