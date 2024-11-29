// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// Initial state for authentication
const initialState = {
  token: Cookies.get("ilAuth") || null,
  refreshToken: Cookies.get("refreshToken") || null,
  isAuthenticated: !!Cookies.get("isAuth"),
};

// Create auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      Cookies.set("ilAuth", action.payload.token, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("refreshToken", action.payload.refreshToken, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("isAuth", "true", { secure: true, sameSite: "Strict" });
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      Cookies.remove("ilAuth");
      Cookies.remove("refreshToken");
      Cookies.remove("isAuth");
    },
  },
});

// Export actions and reducer
export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
