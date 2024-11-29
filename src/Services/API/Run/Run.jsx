import { api } from "../index";

export const createRun = (payload) => {
  return api.post("api/run/create-test-case-run", payload);
};

export const runsData = (payload) => {
  return api.post("/api/run/get-all", payload);
};

// export default const runSummary = () => {
//   api.get(`/api/run/673`);
// };

export const getRunSummary = (id, runType) => {
  return api.get(`/api/v1/run/${id}`, {
    params: { runType }, // Adds the runType as a query parameter
  });
};

// export const DeleteRunTestCasesListData = (id) => {
//   return api.delete(`/api/run/${id}`);    // for feature reference i need this one
// };
export const deleteRunsData = (id) => {
  return api.delete(`/api/run/${id}`);
};

export const runsExport = (payload) => {
  return api.post("/api/run/export", payload, { responseType: "blob" });
};

export const downloadAssets = (path) => {
  return api.get(`/api/download/${path}`, { responseType: "blob" });
};

export const getRunsDetails = (payload) => {
  return api.post("/api/run/details", payload);
};

export const getStepsDetails = (runId, testCaseId, testSuiteId) => {
  return api.get(`/api/v1/run/steps/${runId}`, {
    params: { testSuiteId, testCaseId }, // Adds the runType as a query parameter
  });
};

export const apiCreateTestcaseRun = (payload) => {
  return api.post(`/api/v1/run/api-create-test-case-run`, payload);
};

export const apiCreateTestSuiteRun = (payload) => {
  return api.post(`/api/v1/run/api-create-test-suite-run`, payload);
};
