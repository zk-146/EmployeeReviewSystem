import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface PerformanceData {
  metric: string;
  value: number;
  // Add other performance data fields as needed
}

interface PerformanceState {
  data: PerformanceData[];
  loading: boolean;
  error: string | null;
}

const initialState: PerformanceState = {
  data: [],
  loading: false,
  error: null,
};

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    fetchPerformanceDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPerformanceDataSuccess(state, action: PayloadAction<PerformanceData[]>) {
      state.data = action.payload;
      state.loading = false;
    },
    fetchPerformanceDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchPerformanceDataStart, fetchPerformanceDataSuccess, fetchPerformanceDataFailure } = performanceSlice.actions;
export default performanceSlice.reducer;