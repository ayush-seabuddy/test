import { configureStore } from "@reduxjs/toolkit";
import socialPostReducer from "./socialPostSlice"
import chatListReducer from "./chatListSlice"
import UserDetails from "./userDetailsSlice";

export const store = configureStore({
  reducer: {
    counter:  socialPostReducer,
    chatList: chatListReducer,
    userDetails: UserDetails
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;