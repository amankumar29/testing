import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    applicationDetails: null,
    loading: null,
    error: null,
}

const applicationDetailsSlice = createSlice({
    name: "applicationDetails",
    initialState,
    reducers: {
        setApplicationDetails : (state, action)=>{
            state.applicationDetails = action.payload
        },
        setLoading: (state, action)=>{
            state.loading=action.payload
        },
        setError: (state, action)=>{
            state.error = action.payload;
            state.loading = false;
        }
    }
})

export const {setApplicationDetails,setLoading, setError } = applicationDetailsSlice.actions;
export default applicationDetailsSlice.reducer;