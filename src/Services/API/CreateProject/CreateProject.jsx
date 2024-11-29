import { api, collabApi } from "../index";

export const createProject = (payload) => {
  return api.post("/api/project/create", payload);
};

export const deleteWorkbook = (payload) => {
  return collabApi.post("/api/spreadsheets/delete", payload);
};
