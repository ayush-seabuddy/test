import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
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
    updateShipList: (state,action: PayloadAction<ChatRoom[]>) => {
      state.shipChatList = action.payload;
    },
    updateFleetList: (state,action: PayloadAction<ChatRoom[]>) => {
      state.fleetChatList = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { updateShipList, updateFleetList } = chatListSlice.actions

export default chatListSlice.reducer