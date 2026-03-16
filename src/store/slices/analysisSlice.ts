import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnalysisResult } from "../../types/analysis";

interface AnalysisState {
  result: AnalysisResult | null;
}

const initialState: AnalysisState = {
  result: null,
};

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    setAnalysisResult(state, action: PayloadAction<AnalysisResult>) {
      state.result = action.payload;
    },
    clearAnalysisResult(state) {
      state.result = null;
    },
  },
});

export const { setAnalysisResult, clearAnalysisResult } = analysisSlice.actions;
export default analysisSlice.reducer;
