import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { ChatRoom } from '../screens/chat/types/chatRoom'

export interface CounterState {
  shipChatList: ChatRoom[],
  fleetChatList: ChatRoom[],
  unreadMessageCount: number,
  unreadNotificationCount: number
}

const initialState: CounterState = {
  shipChatList: [],
  fleetChatList: [],
  unreadMessageCount: 0,
  unreadNotificationCount: 0
}

export const chatListSlice = createSlice({
  name: 'chatList',
  initialState,
  reducers: {
    updateShipList: (state, action: PayloadAction<ChatRoom[]>) => {
      state.shipChatList = action.payload;
    },
    updateOneShipChat: (state, action: PayloadAction<ChatRoom>) => {
      const index = state.shipChatList.findIndex(
        chat => chat.id === action.payload.id
      );
      if (index !== -1) {
        state.shipChatList[index] = action.payload;
      }else{
        state.shipChatList.push(action.payload);
      } 
    },

    updateFleetList: (state, action: PayloadAction<ChatRoom[]>) => {
      state.fleetChatList = action.payload;
    },

    updateOneFleetChat: (state, action: PayloadAction<ChatRoom>) => {
      const index = state.fleetChatList.findIndex(
        chat => chat.id === action.payload.id
      );
      if (index !== -1) {
        state.fleetChatList[index] = action.payload;
      }else{
        state.fleetChatList.push(action.payload);
      }
    },
    updateUnreadMessageCount: (state, action: PayloadAction<number>) => {
      state.unreadMessageCount = action.payload;
    },
    updateUnreadNotificationCount: (state, action: PayloadAction<number>) => {
      state.unreadNotificationCount = action.payload;
    },
    clearAllChatLists: (state) => {
      state.shipChatList = []
      state.fleetChatList = []
      state.unreadMessageCount = 0
      state.unreadNotificationCount = 0
    },
  },
})

// Action creators are generated for each case reducer function
export const { updateShipList, updateFleetList , updateOneShipChat , updateOneFleetChat , clearAllChatLists , updateUnreadMessageCount , updateUnreadNotificationCount} = chatListSlice.actions

export default chatListSlice.reducer