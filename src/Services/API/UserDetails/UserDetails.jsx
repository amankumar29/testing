import { api } from "../index";

export const userData = () => {
  return api.get("/api/user/details");
};

export const updateUserData = (payload) => {
  return api.patch("/api/user/update", payload);
};

export const changePassword = (payload) => {
  return api.post("/api/user/change-password", payload);
};
