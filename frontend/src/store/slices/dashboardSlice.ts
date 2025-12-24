import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../rootReducer';
import axios from 'axios';

// Define the shape of the dashboard data
export interface DashboardData {
    user: {
        name: string;
        email: string;
        role: string;
    };
    latestReview?: {
        _id?: string;
        overallScore: number;
        status: string;
        reviewer?: { firstName: string; lastName: string };
        employee?: { firstName: string; lastName: string };
        reviewCycle?: { name: string; startDate: string; endDate: string; status: string };
    };
    goals: Array<{
        id: string;
        title: string;
        progress: number;
        status: string;
    }>;
    pendingReviews: Array<{ // For Managers/Admin
        _id: string;
        employee: { firstName: string; lastName: string };
        status: string;
        submittedAt: string;
    }>;
    skills: Array<{ name: string; expertise: number }>;
    awards: Array<{ title: string; date: string }>;
    stats?: { // For Admin
        totalEmployees: number;
        activeReviews: number;
        completedReviews: number;
    }
}

interface DashboardState {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    data: null,
    loading: false,
    error: null,
};

export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchData',
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const token = state.auth.token;
        const role = state.user.profile?.role || 'employee'; // Default to employee if role is missing

        let url = 'http://localhost:5000/api/dashboard/employee';
        if (role === 'manager') url = 'http://localhost:5000/api/dashboard/manager';
        if (role === 'admin') url = 'http://localhost:5000/api/dashboard/admin';

        try {
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Map backend response to frontend DashboardData structure if needed
            // Assuming backend returns similar structure or we map it here.
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchDashboardData.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchDashboardData.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
        });
        builder.addCase(fetchDashboardData.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
