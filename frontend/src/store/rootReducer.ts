import authReducer from './slices/authSlice';
import { combineReducers } from '@reduxjs/toolkit';
import goalsReducer from './slices/goalsSlice';
import notificationsReducer from './slices/notificationsSlice';
import performanceReducer from './slices/performanceSlice';
import reviewsReducer from './slices/reviewsSlice';
import userReducer from './slices/userSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  reviews: reviewsReducer,
  goals: goalsReducer,
  notifications: notificationsReducer,
  performance: performanceReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;