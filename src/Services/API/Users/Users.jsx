import { api } from "../index";

export const getUserList = (payload) => {
  return api.post("/api/project/project-users", payload);
};

export const createUser = (payload) => {
  return api.post("/api/user/create/project-user", payload);
};

export const getAllUser = () => {
  return api.get("/api/v1/user/get-all");
};

export const createAssignUser = (payload) => {
  return api.post("/api/v1/project/invite-user", payload);
};

export const deleteUser = (id, payload) => {
  return api.post(`/api/project/project-users/${id}`, payload);
};

export const updateUserRole = (payload) => {
  return api.patch("/api/project/project-users/update-role", payload);
};

export const updateUserStatus = (payload) => {
  return api.patch("/api/project/project-users/update-status", payload);
};
