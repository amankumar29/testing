// services/baseQuery.js
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setCredentials } from "Store/ducks/authSlice";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_MONGO_URI}/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    // const token = getState().auth.token;
    const token = Cookies.get("ilAuth");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error) {
    console.error("API Call Error:", result.error);

    // Handle 401 Unauthorized
    if (result.error.status === 401) {
      console.warn("Unauthorized access - logging out.");
      api.dispatch(logout());
    }

    // Handle 403 Forbidden
    if (result.error.status === 403) {
      const refreshToken = api.getState().auth.refreshToken;

      const refreshResult = await baseQuery(
        {
          url: "/user/refresh-token",
          method: "POST",
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        },
        api,
        extraOptions
      );

      if (refreshResult?.data) {
        api.dispatch(
          setCredentials({
            token: refreshResult.data.accessToken,
            refreshToken: refreshResult.data.refreshToken,
          })
        );
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      console.warn(`Unhandled error status: ${result.error.status}`);
    }
  }

  return result;
};

export default baseQueryWithReauth;
