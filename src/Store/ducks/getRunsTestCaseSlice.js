import { createSlice } from "@reduxjs/toolkit";

const initialState={
    runTestCaseList:null,
    loading:false,
    error:null
}

const getRunsTestCaseListSlice = createSlice({
    name:"runTestCaseList",
    initialState,
    reducers:{
        setRunTestCaseList : (state,action)=>{
          state.runTestCaseList = action.payload;
        },
        setLoading:(state,action)=>{
            state.loading = action.payload;
        },
        setError:(state,action)=>{
         state.error = action.payload;
         state.loading = false
        }
    }
})

export const {setRunTestCaseList , setLoading , setError} = getRunsTestCaseListSlice.actions;
export default getRunsTestCaseListSlice.reducer;