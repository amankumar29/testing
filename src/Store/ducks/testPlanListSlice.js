import { createSlice } from "@reduxjs/toolkit";

const initialState={
    testPlanList:null,
    loading:false,
    error:null
}

const testPlanListSlice = createSlice({
    name:'testPlanList',
    initialState,
    reducers:{
        setTestPlanList: (state, action) => {
            state.projectList = action.payload;
          },
          setLoading: (state, action) => {
            state.loading = action.payload;
          },
          setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
          },
    }
})

export const {setTestPlanList , setLoading , setError} = testPlanListSlice.actions;
export default testPlanListSlice.reducer