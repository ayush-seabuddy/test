import { configureStore } from "@reduxjs/toolkit";
import socialPostReducer from "./socialPostSlice"

export const store = configureStore({
  reducer: {
    counter:  socialPostReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;