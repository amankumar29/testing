import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: process.env.REACT_APP_MONGO_URI,
  headers: {
    "content-type": "application/json",
  },
});

export const collabApi = axios.create({
  baseURL: process.env.REACT_APP_COLLAB_URL,
  headers: {
    "content-type": "application/json",
  },
});

// Request interceptor for the `api` instance
api.interceptors.request.use(async (config) => {
  // const token = localStorage.getItem("ilAuth");
  const token = Cookies.get("ilAuth");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Set the appropriate Content-Type based on the request data
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      // Perform logout
      localStorage.removeItem("ilAuth");
      localStorage.removeItem("isAuth");
      window.location.href = "/login"; // Redirect to login
    }
    return Promise.reject(error);
  }
);
