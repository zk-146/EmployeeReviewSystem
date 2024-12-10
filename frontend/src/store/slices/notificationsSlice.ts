import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  // Add other notification fields as needed
}

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    fetchNotificationsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.loading = false;
    },
    fetchNotificationsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    markAsRead(state, action: PayloadAction<string>) {
      const index = state.notifications.findIndex(notification => notification.id === action.payload);
      if (index !== -1) {
        state.notifications[index].read = true;
      }
    },
  },
});

export const { fetchNotificationsStart, fetchNotificationsSuccess, fetchNotificationsFailure, markAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;