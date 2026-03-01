import { configureStore } from "@reduxjs/toolkit";
import chatListReducer from "./chatListSlice";
import contentReducer from "./ContentSlice";
import notificationReducer from "./notificationSlice";
import socialPostReducer from "./socialPostSlice";
import UserDetails from "./userDetailsSlice";
import CustomSurvey from './customSurvey'
import moodTracker from './moodtracker'


export const store = configureStore({
  reducer: {
    counter:  socialPostReducer,
    chatList: chatListReducer,
    userDetails: UserDetails,
    content: contentReducer,
    notification: notificationReducer,
    CustomSurvey:CustomSurvey,
    moodTrackerData: moodTracker
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;