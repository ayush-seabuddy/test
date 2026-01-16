import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface moodTrackerDataState {
  loading: boolean
  isTodayFill: boolean
}

const initialState: moodTrackerDataState = {
  loading: true,
  isTodayFill: false,
}

export const moodTrackerSlice = createSlice({
  name: 'moodTrackerData',
  initialState,
  reducers: {
    updateMoodTrackerLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    updateMoodTrackerTodayFillData: (state, action: PayloadAction<boolean>) => {
      state.isTodayFill = action.payload
    },

    resetMoodTrackerState: () => initialState,
  },
})

// ✅ Correct action exports
export const {
  updateMoodTrackerLoading,
  updateMoodTrackerTodayFillData,
  resetMoodTrackerState,
} = moodTrackerSlice.actions

export default moodTrackerSlice.reducer
