import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getUserList: null,
  loading: false,
  error: null,
};

const getUserListSlice = createSlice({
  name: "getUserList",
  initialState,
  reducers: {
    setGetUserList: (state, action) => {
      state.getUserList = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {setGetUserList , setLoading , setError} = getUserListSlice.actions;
export default getUserListSlice.reducer
