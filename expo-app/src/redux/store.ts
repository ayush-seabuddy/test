import { configureStore } from "@reduxjs/toolkit";
import socialPostReducer from "./socialPostSlice"
import chatListReducer from "./chatListSlice"

export const store = configureStore({
  reducer: {
    counter:  socialPostReducer,
    chatList: chatListReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;