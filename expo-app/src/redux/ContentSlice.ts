
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAllCategory } from '../apis/apiService';


export interface Category {
  Name: string;
  id: string;
  description?: string;
  order: string;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt: string;
  updatedAt: string;
}

interface ContentUser {
  id: string;
  fullName: string;
  email: string;
  profileUrl: string;
  userType: string;
}

interface SubCategoryDetails {
  id: string;
  Name: string;
}

interface ContentItem {
  id: string;
  userId: string;
  contentTitle: string;
  description: string;
  thumbnail: string;
  contentUrl: string[];
  hashtags: string[];
  contentType: "ARTICLE" | "VIDEO" | "AUDIO"; // add more types if needed
  contentCategory: string;
  contentSubCategory: string;
  isPublic: boolean;
  highPriority: boolean;
  order: number | null;
  status: "ACTIVE" | "INACTIVE" | "DRAFT"; // adjust based on your actual statuses
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  contentUser: ContentUser;
  subCategoryDetails: SubCategoryDetails;
  alreadySeen: boolean;
  alreadyAcknowledge: boolean;
  priority: number;
}

interface ApiResponse {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  allContents: ContentItem[];
}

interface listAllContent {
    [department: string]: ApiResponse;
}


interface ContentState {
    categoryList:Category[],
    error: string | null;
    loading: boolean
    contentList: listAllContent
}
// Initial state
const initialState: ContentState = {
  categoryList: [],
  error: null,
  loading: false,
  contentList: {},
};

export const listAllCategory = createAsyncThunk(
    'user/listAllCategory',
    async (arg, { rejectWithValue }) => {
        try {
            const response = await getAllCategory();
            console.log("response: sdflksdklfdslkf", response);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Error fetching data');
        }
    }
);


// Redux slice
const contentSlice = createSlice({
    name: 'content',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null; // Reset error state
        },
        clearAllCategory: (state) => {
          state.categoryList = [];
        },
        updateContentList: (state, action) => {
          state.contentList[action.payload.id] = action.payload.data;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(listAllCategory.pending, (state) => {
                state.loading = true;
                state.error = null; 
            })
            .addCase(
                listAllCategory.fulfilled,
                (state, action: PayloadAction<Category[]>) => {
                    state.loading = false;
                    state.categoryList = action.payload;
                    
                }
            )
            .addCase(listAllCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })



    },
});

export const { clearError, clearAllCategory , updateContentList} = contentSlice.actions;
export default contentSlice.reducer;
