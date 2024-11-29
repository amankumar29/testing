import { api } from "../index";

export const getProjectInfo = (payload) => {
  return api.get(`api/v1/application/get-all/${payload.id}`);
};
