import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type PageInterface = '/' | '/buddyupeventdescription' | '/contentDetails/[contentId]' | '/singlepost' | '/monthlyhappinessindex' | '/monthlywellbeingpulse';
export interface NotificationState {
  isNotification: boolean;
  page: PageInterface;
  params: Record<string, any> ;
}

const initialState: NotificationState = {
  isNotification: false,
  page: '/',
  params: {},
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setIsNotification: (state, action: PayloadAction<boolean>) => {
      state.isNotification = action.payload;
    },
    setPage: (state, action: PayloadAction<PageInterface>) => {
      state.page = action.payload;
    },
    setParams: (state, action: PayloadAction<Record<string, any>>) => {
      state.params = action.payload;
    },
    setNotificationState: (state, action: PayloadAction<Partial<NotificationState>>) => {
      return { ...state, ...action.payload };
    },
    clearNotification: () => initialState,
  },
});

export const {
  setIsNotification,
  setPage,
  setParams,
  setNotificationState,
  clearNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;