import { api } from "../index";

export const getLocator = (payload) => {
  return api.get("api/v1/locateElements", { params: payload });
};
export const getActionKey = (payload) => {
  return api.post("/api/v1/action-keyword", payload);
};

export const getNewActionKey = (payload) => {
  return api.post("/api/v1/method", payload);
};

export const createTestCase = (data) => {
  return api.post("/api/v1/test-cases/create", data);
};

export const importTestCase = (data) => {
  return api.post("/api/v1/test-cases/import", data);
};

export const createTestSteps = (data) => {
  return api.post("/api/v1/test-steps/create", data);
};

export const updateTestCase = (data, id) => {
  return api.put(`api/v1/test-cases/${id}`, data);
};

export const getCaseInfo = (id) => {
  return api.get(`api/v1/test-cases/${id}`);
};

export const getTestSteps = (data) => {
  return api.post("api/test-cases/steps", data);
};

export const updateTestSteps = (data) => {
  return api.patch("/api/v1/test-steps/update", data);
};

export const transferTestCase = (data) => {
  return api.post("/api/v1/test-cases/transfer", data);
};

export const testCaseInfoUpdate = (id, payload) => {
  return api.patch(`/api/test-cases/info/${id}`, payload);
};

export const testCaseExport = (payload) => {
  return api.post("/api/v1/test-cases/export", payload, {
    responseType: "blob",
  });
};

export const apiRunResponse = (payload) => {
  return api.post(`/api/v1/automation/api-run-response`, payload);
};
