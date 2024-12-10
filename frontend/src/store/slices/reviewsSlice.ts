import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  // Add other review fields as needed
}

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  loading: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    fetchReviewsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchReviewsSuccess(state, action: PayloadAction<Review[]>) {
      state.reviews = action.payload;
      state.loading = false;
    },
    fetchReviewsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addReview(state, action: PayloadAction<Review>) {
      state.reviews.push(action.payload);
    },
    updateReview(state, action: PayloadAction<Review>) {
      const index = state.reviews.findIndex(review => review.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
    },
    deleteReview(state, action: PayloadAction<string>) {
      state.reviews = state.reviews.filter(review => review.id !== action.payload);
    },
  },
});

export const { fetchReviewsStart, fetchReviewsSuccess, fetchReviewsFailure, addReview, updateReview, deleteReview } = reviewsSlice.actions;
export default reviewsSlice.reducer;