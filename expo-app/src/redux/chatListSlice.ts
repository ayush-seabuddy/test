import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { ChatRoom } from '../screens/chat/types/chatRoom'

export interface CounterState {
  shipChatList: ChatRoom[],
  fleetChatList: ChatRoom[]
}

const initialState: CounterState = {
  shipChatList: [],
  fleetChatList: []
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
      }
    },
  },
})

// Action creators are generated for each case reducer function
export const { updateShipList, updateFleetList , updateOneShipChat , updateOneFleetChat } = chatListSlice.actions

export default chatListSlice.reducer