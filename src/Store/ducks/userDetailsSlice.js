// Store/ducks/userDetailsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userDetails: null,
  loading: false,
  error: null,
  defaultApplication: null,
  cookieDefaultApplication:null
};

const userDetailsSlice = createSlice({
  name: "userDetails",
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      state.userDetails = action.payload;
      state.loading = false; // Set loading to false on successful data fetch
      state.error = null; // Clear error on successful fetch
    },
    setLoading: (state, action) => {
      state.loading = action.payload; // Set loading state
    },
    setError: (state, action) => {
      state.error = action.payload; // Set error state
      state.loading = false; // Clear loading on error
    },
    clearUserDetails: (state) => {
      state.userDetails = null;
      state.loading = false;
      state.error = null;
    },
    setDefaultApplication: (state, action) => {
      state.defaultApplication = action.payload;
    },
    setCookieDefaultApplication:(state,action)=>{
      state.cookieDefaultApplication = action.payload
    }
  },
});

export const {
  setUserDetails,
  setLoading,
  setError,
  clearUserDetails,
  setDefaultApplication,
  setCookieDefaultApplication
} = userDetailsSlice.actions;
export default userDetailsSlice.reducer;
