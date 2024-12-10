import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AppThunk } from '../index'; // Import the AppThunk type
import { RootState } from '../rootReducer';
import axios from 'axios';
import { updateUserProfile as updateAuthUserProfile } from './authSlice'; // Import the updateUserProfile action from authSlice

interface UserProfile {
  id: string;
  name: string;
  email: string;
  // Add other profile fields as needed
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchUserProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
      state.loading = false;
    },
    fetchUserProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateUserProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
      state.loading = false;
    },
    updateUserProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchUserProfileStart,
  fetchUserProfileSuccess,
  fetchUserProfileFailure,
  updateUserProfileStart,
  updateUserProfileSuccess,
  updateUserProfileFailure,
} = userSlice.actions;

export const fetchUserProfile = (): AppThunk => async (dispatch, getState) => {
  dispatch(fetchUserProfileStart());
  const token = (getState() as RootState).auth.token;
  try {
    const response = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(fetchUserProfileSuccess(response.data));
  } catch (error: any) {
    dispatch(fetchUserProfileFailure(error.response?.data?.message || 'Failed to fetch profile'));
  }
};

export const updateUserProfile = (profile: UserProfile): AppThunk => async (dispatch, getState) => {
  dispatch(updateUserProfileStart());
  const token = (getState() as RootState).auth.token;
  try {
    const response = await axios.put('http://localhost:5000/api/auth/profile', profile, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(updateUserProfileSuccess(response.data));
    // Update the auth state with the new profile
    dispatch(updateAuthUserProfile(response.data));
    // Fetch the updated user profile
    dispatch(fetchUserProfile());
  } catch (error: any) {
    dispatch(updateUserProfileFailure(error.response?.data?.message || 'Failed to update profile'));
  }
};

export default userSlice.reducer;