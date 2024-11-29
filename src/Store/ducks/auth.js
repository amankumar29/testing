import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { userLogin } from "Services/API/auth/auth";

// Initial state
const initialState = {
  token: localStorage.getItem("ilAuth") || null,
  isAuthenticated: !!localStorage.getItem("isAuth"),
  loading: false,
  error: null,
  userDetails : null
};

// Authentication Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("authToken");
      state.token = null;
      state.isAuthenticated = false;
    },
    setuserDetails:(state,action)=>{
      state.userDetails = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.userDetails = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Async Thunk for login
export const loginAsync = createAsyncThunk(
  "auth/loginAsync",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await userLogin(credentials); // Call the service
      const token = response.data.results.accessToken;
      const user = response.data.results.user
      localStorage.setItem("ilAuth", token); // Store token in localStorage
      return {token,user};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// Export logout action and reducer
export const { logout ,setuserDetails} = authSlice.actions;
export default authSlice.reducer;
