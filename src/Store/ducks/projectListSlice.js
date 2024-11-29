import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projectList: null,
  getAllProjects: null,
  loading: false,
  error: null,
};

const projectListSlice = createSlice({
  name: "projectList",
  initialState,
  reducers: {
    setProjectList: (state, action) => {
      state.projectList = action.payload;
    },
    setGetAllProjects: (state, action) => {
      state.getAllProjects = action.payload;
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

export const { setProjectList, setGetAllProjects, setLoading, setError } =
  projectListSlice.actions;
export default projectListSlice.reducer;
