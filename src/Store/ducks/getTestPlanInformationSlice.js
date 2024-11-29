const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
  testPlanInfo: null,
  loading: false,
  error: null,
};

const getTestPlanInformationSlice = createSlice({
  initialState,
  reducers: {
    setTestPlanInfo: (state, action) => {
      state.testPlanInfo = action.payload;
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

export const {setTestPlanInfo , setLoading , setError} = getTestPlanInformationSlice.actions

export default getTestPlanInformationSlice.reducer
