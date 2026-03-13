import { createSlice } from "@reduxjs/toolkit";


interface SearchState {
    query:string;
}

const initialState: SearchState = {
    query: "",
}


const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        setQuerySearch(state, action: {payload: string}) {
            state.query = action.payload;
        },
        unsetQuerySearch(state) {
            state.query = "";
        }
    }
});

export const { setQuerySearch, unsetQuerySearch } = searchSlice.actions;
export default searchSlice.reducer;