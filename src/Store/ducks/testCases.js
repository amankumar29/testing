import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    testCases : {
        projectId:null,
        applicationId:null,
        currentOffset:0,
        totalCount:null,
        list:[],
    },
    testSuites :{
        projectId:null,
        applicationId:null,
        currentOffset:0,
        totalCount:null,
        isRunned:false,
        list:[]
    },
    testScheduler :{
        projectId:null,
        applicationId:null,
        currentOffset:0,
        totalCount:null,
        list:[]
    },
    caseRunned:false,
    suiteRunned:false,
    suiteIsCreated:false,
    schedulerModifed:false,
    caseCreated:false
}

const testCasesSlices = createSlice({
    name:'testCases',
    initialState,
    reducers : {
        setTestCasesList:(initialState,action)=>{
            initialState.testCases = action.payload
        },
        setTestSuitesList : (initialState,action)=>{
            initialState.testSuites = action.payload
        },
        setTestSchedulerList : (initialState,action) =>{
            initialState.testScheduler = action.payload
        },
        setIsrunned : (initialState,action)=>{
            if(action?.payload?.type === "test-cases"){
                initialState.caseRunned = action?.payload?.value
            }else if( action?.payload?.type === "test-suites"){
                initialState.suiteRunned = action?.payload?.value
            }else if(action?.payload?.type === 'suite-test-cases'){
                initialState.caseRunned = action?.payload?.value
            }
        },
        setsuiteIsCreated : (initialState,action)=>{
            initialState.suiteIsCreated = action.payload
        },
        setschedulerModifed:(initialState,action)=>{
            initialState.schedulerModifed = action.payload
        },
        setcaseCreated : (initialState,action)=>{
            initialState.caseCreated = action.payload
        }
    }
})  


export const {
    setTestCasesList,
    setTestSchedulerList,
    setTestSuitesList,
    setIsrunned,
    setsuiteIsCreated,
    setschedulerModifed,
    setcaseCreated
} = testCasesSlices.actions

export  default testCasesSlices.reducer