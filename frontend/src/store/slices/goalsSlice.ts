import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { RootState } from '../rootReducer';
import axios from 'axios';

interface Goal {
  _id?: string;
  id?: string; // fallback
  title: string;
  description: string;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate: string;
  reviewCycle: string; // ID
  employee: string; // ID
}

interface GoalsState {
  goals: Goal[];
  cycles: any[]; // Store cycles for selection
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: GoalsState = {
  goals: [],
  cycles: [],
  loading: false,
  error: null,
  successMessage: null,
};

// Thunks
export const fetchCyclesForGoal = createAsyncThunk(
  'goals/fetchCycles',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    try {
      const response = await axios.get('http://localhost:5000/api/review-cycles', {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cycles');
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/create',
  async (goalData: Partial<Goal>, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    try {
      const response = await axios.post('http://localhost:5000/api/goals', goalData, {
        headers: { Authorization: `Bearer ${state.auth.token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create goal');
    }
  }
);

export const fetchGoals = createAsyncThunk(
  'goals/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    // Need employee ID to fetch their goals? Or usage of `/api/goals/employee/:id/cycle/:id` ?
    // For now, let's assume we want "My Goals".
    // The backend route `getGoalsByEmployee` requires params.
    // BUT wait, is there a generic list/search route?
    // GoalRoutes has `router.get("/:id")` and `router.get("/employee/:employeeId/cycle/:cycleId")`.
    // It doesn't have a generic "my goals" endpoint.
    // We'll need to know the cycle or user.
    // Effectively, this thunk might be 'fetchGoalsByCycle'.

    // For simplistic "Goals List" on dashboard, we already have dashboard data.
    // This slice might be used for a dedicated "Goals Page" later.
    return []; // Placeholder if not strictly used yet.

  }
)

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoalMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    // Legacy reducers if any
    fetchGoalsStart(state) { state.loading = true; },
    fetchGoalsSuccess(state, action) { state.goals = action.payload; state.loading = false; },
    fetchGoalsFailure(state, action) { state.error = action.payload; state.loading = false; },
  },
  extraReducers: (builder) => {
    // Fetch Cycles
    builder.addCase(fetchCyclesForGoal.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCyclesForGoal.fulfilled, (state, action) => {
      state.loading = false;
      state.cycles = action.payload;
    });
    builder.addCase(fetchCyclesForGoal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Goal
    builder.addCase(createGoal.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createGoal.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = 'Goal created successfully';
      state.goals.push(action.payload);
    });
    builder.addCase(createGoal.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearGoalMessages, fetchGoalsStart, fetchGoalsSuccess, fetchGoalsFailure } = goalsSlice.actions;
// Legacy exports if needed...
export const addGoal = (goal: any) => ({ type: 'goals/addGoal', payload: goal }); // Placeholder
export const updateGoal = (goal: any) => ({ type: 'goals/updateGoal', payload: goal }); // Placeholder
export const deleteGoal = (id: string) => ({ type: 'goals/deleteGoal', payload: id }); // Placeholder

export default goalsSlice.reducer;