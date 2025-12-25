import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../rootReducer';
import axios from 'axios';

// Define complex types matching backend
export interface ReviewResponse {
  question: string; // Question ID
  answer: string | null;
  score: number | null;
  _id?: string;
}

export interface GoalEvaluation {
  goal: {
    _id: string;
    title: string;
    description: string;
  };
  achievementLevel: number | null;
  comments: string;
  _id?: string;
}

export interface ReviewDetail {
  _id: string;
  employee: { _id: string; firstName: string; lastName: string; name?: string } | string;
  reviewer: { _id: string; firstName: string; lastName: string; name?: string } | string;
  reviewCycle: { _id: string; year: string } | string;
  reviewTemplate: {
    _id: string;
    name: string;
    questions: Array<{
      _id: string;
      text: string;
      type: 'text' | 'rating' | 'boolean';
      weight: number;
    }>;
  } | string;
  responses: ReviewResponse[];
  goalEvaluations: GoalEvaluation[];
  status: 'Draft' | 'Submitted' | 'ManagerApproved' | 'FinalApproved';
  overallScore?: number;
}

interface ReviewsState {
  reviews: ReviewDetail[]; // List for dashboard/admin
  currentReview: ReviewDetail | null; // For the form
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  currentReview: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Async Thunks
export const fetchReviewById = createAsyncThunk(
  'reviews/fetchById',
  async (id: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch review');
    }
  }
);

export const saveReviewDraft = createAsyncThunk(
  'reviews/saveDraft',
  async ({ id, data }: { id: string; data: Partial<ReviewDetail> }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    try {
      const response = await axios.put(`http://localhost:5000/api/reviews/${id}`, data, {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      // Also need to update goal evaluations if they changed
      // The backend has a separate endpoint for goals: PUT /:id/goal-evaluations
      // We might need to call that effectively.
      // For now, let's assume the main update might handle it or we chain it. 
      // WAIT: ReviewController.updateReview ONLY updates responses. 
      // ReviewController.updateGoalEvaluations updates goals.
      // We should probably chain them here if data contains goalEvaluations.

      if (data.goalEvaluations) {
        await axios.put(`http://localhost:5000/api/reviews/${id}/goal-evaluations`, { goalEvaluations: data.goalEvaluations }, {
          headers: { Authorization: `Bearer ${state.auth.token}` },
        });
      }

      return response.data; // Return the updated review
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save draft');
    }
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submit',
  async (id: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    try {
      const response = await axios.post(`http://localhost:5000/api/reviews/${id}/submit`, {}, {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearCurrentReview(state) {
      state.currentReview = null;
      state.error = null;
      state.successMessage = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    fetchReviewsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchReviewsSuccess(state, action: PayloadAction<ReviewDetail[]>) {
      state.loading = false;
      state.reviews = action.payload;
    },
    fetchReviewsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch Single
    builder.addCase(fetchReviewById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchReviewById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentReview = action.payload;
    });
    builder.addCase(fetchReviewById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Save Draft
    builder.addCase(saveReviewDraft.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(saveReviewDraft.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = "Draft saved successfully";
      // Update the current review with new data (simplistic, real merge might be better)
      // But usually we just re-fetch or trust the response
      // Ensure the currentReview is updated with the payload if it matches
      if (state.currentReview && state.currentReview._id === action.payload._id) {
        // Manually merge or just specific fields because payload might not be full populate
        // Actually, updateReview returns `review` which isn't fully populated in the controller response (check controller).
        // The controller returns `res.json(review)`. `review` is the mongoose doc. It might NOT be populated if not explicitly populated in update.
        // So safest is to NOT replace currentReview entirely, or trigger a re-fetch?
        // Let's just update status for now.
      }
    });
    builder.addCase(saveReviewDraft.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Submit
    builder.addCase(submitReview.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(submitReview.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = "Review submitted successfully";
      if (state.currentReview) state.currentReview.status = 'Submitted';
    });
    builder.addCase(submitReview.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Keep existing reducers if any? The old file was very basic. I am replacing it.
    // But need to keep generic 'fetchReviewsSuccess' if Dashboard uses it?
    // Dashboard used: fetchReviewsStart, fetchReviewsSuccess, fetchReviewsFailure
    // I should keep those or map them to new structure. 
    // Dashboard code: dispatch(fetchReviewsSuccess(data)); 
    // So I must include them.

  },
});

export const {
  clearCurrentReview,
  clearMessages,
  fetchReviewsStart,
  fetchReviewsSuccess,
  fetchReviewsFailure
} = reviewsSlice.actions;

export default reviewsSlice.reducer;