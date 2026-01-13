import { configureStore } from "@reduxjs/toolkit";
import chatListReducer from "./chatListSlice";
import contentReducer from "./ContentSlice";
import notificationReducer from "./notificationSlice";
import socialPostReducer from "./socialPostSlice";
import UserDetails from "./userDetailsSlice";
import CustomSurvey from './customSurvey'


export const store = configureStore({
  reducer: {
    counter:  socialPostReducer,
    chatList: chatListReducer,
    userDetails: UserDetails,
    content: contentReducer,
    notification: notificationReducer,
    CustomSurvey:CustomSurvey
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;