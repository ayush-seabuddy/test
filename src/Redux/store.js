import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "../Redux/Socket/Socket"; // Adjust path to your slice
import chatReducer from "../Redux/Socket/Chat"; // Adjust path to your slice
import searchReducer from "./Search/reducer";

const store = configureStore({
  reducer: {
    users: usersReducer,
    chat: chatReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false, // Disable if you're using non-serializable values (e.g., socket)
    }),
});

export default store;
