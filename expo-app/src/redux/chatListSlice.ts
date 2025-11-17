import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface CounterState {
  shipChatList: [],
  fleetChatList: [] 
}

const initialState: CounterState = {
 shipChatList: [],
  fleetChatList: [] 
}

export const chatListSlice = createSlice({
  name: 'chatList',
  initialState,
  reducers: {
    updateShipList: (state,action: PayloadAction<[]>) => {
      state.shipChatList = action.payload;
    },
    updateFleetList: (state,action: PayloadAction<[]>) => {
      state.fleetChatList = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { updateShipList, updateFleetList } = chatListSlice.actions

export default chatListSlice.reducer