import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { runsData } from "Services/API/Run/Run";

const initialState = {
  runsListData: [],
  dataCount: 0,
  totalPages: 0,
  currentOffset: 0,
  isLoading: false,
  error: null,
};

// Create the slice
const runsSlice = createSlice({
  name: "runsList",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRunList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRunList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.runsListData = action.payload.results;
        state.dataCount = action.payload.count;
        state.totalPages = action.payload.totalPages;
        state.currentOffset = action.payload.offset;
      })
      .addCase(fetchRunList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch run test cases.";

        // Show toast message on error
        toast.error(state.error);
      });
  },
});

// Create a thunk to fetch run test cases data
export const fetchRunList = createAsyncThunk(
  "runsList/fetchRunList",
  async (
    {
      limit,
      offset,
      selectedApplication,
      selectedProject,
      searchKey,
      startDate,
      endDate,
      customDate,
      todayDate,
      yesterDayDate,
      lastWeekDate,
      lastMonthDate,
      runType = "test_case", // Default value for run_type
    },
    { rejectWithValue }
  ) => {
    try {
      // Construct the request body
      const requestBody = {
        applicationId: selectedApplication?.id,
        projectId: selectedProject?.id,
        sortOrder: "desc",
        sortColumn: "id",
        searchKey: searchKey || "",
        includeCount: true,
        limit,
        offset,
        run_type: runType,
      };

      // Add date range if any date filters are provided
      if (
        customDate ||
        todayDate ||
        yesterDayDate ||
        lastWeekDate ||
        lastMonthDate
      ) {
        requestBody.fromDate = startDate;
        requestBody.toDate = endDate;
      }

      // Make API call
      const res = await runsData(requestBody);
      const data = res?.data?.results;
      const totalPages = Math.ceil(res?.data?.count / limit);

      return {
        results: data,
        count: res?.data?.count,
        totalPages,
        offset: res?.data?.offset,
      };
    } catch (error) {
      // Handle errors
      const message =
        error?.response?.data?.details || "Failed to fetch run test cases.";
      return rejectWithValue(message);
    }
  }
);

export default runsSlice.reducer;
