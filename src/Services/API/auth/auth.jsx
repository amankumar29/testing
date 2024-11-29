import { api } from "../index";

export const userLogin = (payload) => {
  return api.post("/api/user/login", payload);
};
