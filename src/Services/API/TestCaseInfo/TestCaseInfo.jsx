import { api } from "../index";

export const getTestCaseInfo = (id) => {
  return api.get(`api/test-cases/info/${id}`);
};
