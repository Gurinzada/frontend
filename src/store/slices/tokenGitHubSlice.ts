import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface TokenGitHubState {
    hasToken: boolean;
    token: string | null;
    loading: boolean;
}  

const initialState:TokenGitHubState = {
    hasToken: false,
    token: null,
    loading: false,
}

export const tokenGitHubFind = createAsyncThunk(
    "tokenGitHub/find",
    async () => {
        const token = localStorage.getItem("github_token");
        if (token) {
            return JSON.parse(token) as string;
        } else {
            return null;
        }
    }
);


export const insertTokenGitHub = createAsyncThunk(
    "tokenGitHub/insert",
    async (token: string) => {
        localStorage.setItem("github_token", JSON.stringify(token));
        return token;
    }
);

export const removeTokenGitHub = createAsyncThunk(
    "tokenGitHub/remove",
    async () => {
        localStorage.removeItem("github_token");
        return null;
    }
);

export const tokenGitHubSlice = createSlice({
    name: "tokenGitHub",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(tokenGitHubFind.pending, (state) => {
            state.hasToken = false;
            state.token = null;
            state.loading = true;
        })
        .addCase(tokenGitHubFind.fulfilled, (state, action) => {
            state.hasToken = action.payload !== null;
            state.token = action.payload;
            state.loading = false;
        })
        .addCase(tokenGitHubFind.rejected, (state) => {
            state.hasToken = false;
            state.token = null;
            state.loading = false;
        })
        .addCase(insertTokenGitHub.pending, (state) => {
            state.loading = true;
        })
        .addCase(insertTokenGitHub.fulfilled, (state, action) => {
            state.hasToken = true;
            state.token = action.payload;
            state.loading = false;
        })
        .addCase(insertTokenGitHub.rejected, (state) => {
            state.hasToken = false;
            state.token = null;
            state.loading = false;
        })
        .addCase(removeTokenGitHub.pending, (state) => {
            state.loading = true;
        })
        .addCase(removeTokenGitHub.fulfilled, (state) => {
            state.hasToken = false;
            state.token = null;
            state.loading = false;
        })
        .addCase(removeTokenGitHub.rejected, (state) => {
            state.loading = false;
        })
    }
});

export default tokenGitHubSlice.reducer;
