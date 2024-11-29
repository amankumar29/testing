import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    updateProjectDetails: null,
    loading: null,
    error: null,
}

const updateProjectDetailsSlice = createSlice({
    name: "updateProjectDetails",
    initialState,
    reducers: {
        setProjectDetails : (state, action)=>{
            state.projectDetails = action.payload
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

export const {setApplicationDetails,setLoading, setError } = updateProjectDetailsSlice.actions;
export default updateProjectDetailsSlice.reducer;