import { api } from "../index";

export const deleteTestCase = (id) => {
  return api.delete(`/api/v1/test-cases/${id}`);
};
