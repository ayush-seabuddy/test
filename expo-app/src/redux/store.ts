import { configureStore } from "@reduxjs/toolkit";
import chatListReducer from "./chatListSlice";
import contentReducer from "./ContentSlice";
import socialPostReducer from "./socialPostSlice";
import UserDetails from "./userDetailsSlice";


export const store = configureStore({
  reducer: {
    counter:  socialPostReducer,
    chatList: chatListReducer,
    userDetails: UserDetails,
    content: contentReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;