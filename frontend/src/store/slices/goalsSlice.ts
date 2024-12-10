import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  // Add other goal fields as needed
}

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    fetchGoalsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchGoalsSuccess(state, action: PayloadAction<Goal[]>) {
      state.goals = action.payload;
      state.loading = false;
    },
    fetchGoalsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addGoal(state, action: PayloadAction<Goal>) {
      state.goals.push(action.payload);
    },
    updateGoal(state, action: PayloadAction<Goal>) {
      const index = state.goals.findIndex(goal => goal.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    deleteGoal(state, action: PayloadAction<string>) {
      state.goals = state.goals.filter(goal => goal.id !== action.payload);
    },
  },
});

export const { fetchGoalsStart, fetchGoalsSuccess, fetchGoalsFailure, addGoal, updateGoal, deleteGoal } = goalsSlice.actions;
export default goalsSlice.reducer;