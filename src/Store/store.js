// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "Store/ducks/authSlice";
import userDetailsReducer from "Store/ducks/userDetailsSlice";
import runListReducer from "Store/ducks/runsList";
import runDetailsReducer from "Store/ducks/runsDetails";
import testCasesReducer from "Store/ducks/testCases";
import projectListReducer from "Store/ducks/projectListSlice"
import applicationDetailsReducer from "Store/ducks/applicationDetailsSlice"
import updateProjectDetailsReducer from "Store/ducks/updateProjectDetails"
import testPlanListReducer from "Store/ducks/testPlanListSlice"
import { setupListeners } from "@reduxjs/toolkit/query";
import apiSlice from "Services/API/apiSlice";

const combinedReducer = combineReducers({
  auth: authReducer,
  userDetails: userDetailsReducer,
  runListData: runListReducer,
  runSummary: runDetailsReducer,
  testCases: testCasesReducer,
  projectList:projectListReducer,
  testPlanList:testPlanListReducer,
  applicationDetails: applicationDetailsReducer,
  updateProjectDetails: updateProjectDetailsReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const rootReducer = (state, action) => {
  if (action.type === "logout") {
    state = undefined;
  }
  return combinedReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);

export default store;
