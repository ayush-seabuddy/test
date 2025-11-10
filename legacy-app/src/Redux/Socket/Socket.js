import AsyncStorage from "@react-native-async-storage/async-storage";
import socketService from "../../Socket/Socket";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) {
        return rejectWithValue("No user details found");
      }

      const Data = JSON.parse(dbResult);
      const shipId = Data.shipId;
      const userId = Data.id;
      const payload = { userId, shipId, page: 1, limit: 100 };

      socketService.emit("getAllUsers", payload);

      return new Promise((resolve) => {
        socketService.on("usersChatList", (response) => {
          resolve(response.usersList.usersList);
        });
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return rejectWithValue(error.message);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    chatList: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearChatList(state) {
      state.chatList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chatList = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearChatList } = usersSlice.actions;

export const selectChatList = (state) => state.users.chatList;
export const selectUsersStatus = (state) => state.users.status;

export default usersSlice.reducer;
