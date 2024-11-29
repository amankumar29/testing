import { api } from "../index";

export const getProjectsList = () => {
  return api.get(`/api/v1/project/get-all`);
};

export const getTestCasesList = (payload) => {
  return api.get(`/api/v1/test-cases`, { params: payload });
};

export const getDuplicateList = (payload) => {
  return api.post(`/api/v1/test-cases/duplicate`, payload);
};

export const statusDropDown = (updatedData, id) => {
  return api.put(`/api/v1/test-cases/${id}`, updatedData);
};

export const createApplication = (payload) => {
  return api.post("/api/v1/application/create-application", payload);
};

export const addNewTestSuite = (payload) => {
  return api.post("/api/v1/test-suite/create", payload);
};

// -------------------TestSuites ------------------------------

export const getTestSuiteList = (payload) => {
  return api.get(`/api/v1/test-suite`, { params: payload });
};

export const deleteTestSuite = (id) => {
  return api.delete(`/api/v1/test-suite/${id}`);
};

export const createTestSuiteRun = (payload) => {
  return api.post("api/run/create-test-suite-run", payload);
};

export const setDefaultProject = (payload) => {
  return api.post("api/project/default", payload);
};

export const getDefaultProjectList = () => {
  return api.get("api/v1/project/get-all");
};
export const removeSuiteTestCase = (payload) => {
  return api.post("/api/test-suite/remove-case", payload);
};

export const getTestSuiteDetails = (suiteId, payload) => {
  return api.get(`/api/v1/test-suite/${suiteId}`, { params: payload });
};

export const updateTestSuite = (suiteId, payload) => {
  return api.patch(`/api/v1/test-suite/${suiteId}`, payload);
};

export const duplicateTestSuite = (payload) => {
  return api.post(`/api/v1/test-suite/duplicate`, payload);
};

export const duplicateSuiteTestCase = (id, payload) => {
  return api.post(`/api/test-suite/test-case/duplicate/${id}`, payload);
};

export const transferTestSuite = (payload) => {
  return api.post("/api/v1/test-suite/transfer", payload);
};
export const getTestSuitInfo = (id) => {
  return api.get(`/api/v1/test-suite/${id}`);
};

export const getTestSuiteDetailsTransfer = (payload) => {
  return api.post("/api/v1/test-cases/transfer", payload);
};
