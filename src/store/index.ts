import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import searchSlice from "./slices/searchSlice";
import gitHubSlice from "./slices/gitHubSlice";
import analysisSlice from "./slices/analysisSlice";

export const store = configureStore({
  reducer: {
    search: searchSlice,
    gitHub: gitHubSlice,
    analysis: analysisSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
