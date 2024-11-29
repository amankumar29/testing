import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { getRunSummary } from "Services/API/Run/Run";

const runSummarySlice = createSlice({
  name: "runSummary",
  initialState: {
    runSummary: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRunSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRunSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.runSummary = action.payload;
      })
      .addCase(fetchRunSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Unable to fetch run summary data.");
      });
  },
});

// Thunk to fetch run summary data
export const fetchRunSummary = createAsyncThunk(
  "runSummary/fetchRunSummary",
  async ({ id, runType }, { rejectWithValue }) => {
    console.log("id", id, "runType", runType);
    try {
      const response = await getRunSummary(id, runType);
      return response.data; // Adjust based on your API response structure
    } catch (error) {
      const message =
        error?.response?.data?.details || "Unable to fetch run summary data.";
      return rejectWithValue(message);
    }
  }
);

export default runSummarySlice.reducer;
