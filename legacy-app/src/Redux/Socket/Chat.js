import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import socketService from "../../Socket/Socket";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Thunk to get user details
export const fetchUserDetails = createAsyncThunk(
  "chat/fetchUserDetails",
  async (_, { rejectWithValue }) => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const Data = JSON.parse(dbResult);
      return { senderId: Data.id, shipId: Data.shipId };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ chatRoomId, content }, { getState, rejectWithValue }) => {
    try {
      const { chat } = getState();
      const createdAt = new Date().toISOString();
      const chat_payload = {
        senderId: chat.senderId,
        chatRoomId,
        content,
        createdAt,
      };

      socketService.emit("userSendMessage", chat_payload);
      return chat_payload; // Add message to the chat list
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to initialize user chat
export const initializeUserChat = createAsyncThunk(
  "chat/initializeUserChat",
  async ({ receiverId }, { getState, rejectWithValue }) => {
    try {
      const { chat } = getState();
      const payload = {
        senderId: chat.senderId,
        receiverId,
        shipId: chat.shipId,
        page: 1,
        limit: 100,
      };

      socketService.emit("initiateUserChat", payload);

      return new Promise((resolve) => {
        socketService.on("userChatInitiated", (data) => {
          resolve(data);
        });
      });
    } catch (error) {
      console.error("Error initializing user chat:", error);
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    senderId: null,
    shipId: null,
    chatRoomId: null,
    chatList: [],
    typingStatus: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    setTypingStatus(state, action) {
      state.typingStatus = action.payload;
    },
    addMessage(state, action) {
      state.chatList.push(action.payload);
    },

    updateChatList(state, action) {
      state.chatList = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.senderId = action.payload.senderId;
        state.shipId = action.payload.shipId;
      })
      .addCase(initializeUserChat.fulfilled, (state, action) => {
        state.chatRoomId = action.payload.chatRoomId;
        state.chatList = action.payload.previousMessages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.chatList.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setTypingStatus, addMessage, updateChatList } =
  chatSlice.actions;

export const selectChat = (state) => state.chat;

export default chatSlice.reducer;
