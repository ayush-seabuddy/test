import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export interface surveylistState {
  surveyList: any[],
}

const initialState: surveylistState = {
  surveyList: [],
}

export const customSurveySlice = createSlice({
  name: 'customSurveyList',
  initialState,
  reducers: {
    updateSurveyList: (state, action: PayloadAction<any[]>) => {
      state.surveyList = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const { updateSurveyList} = customSurveySlice.actions

export default customSurveySlice.reducer