import { api } from "../index";


export const getLastRunSuite = (applicationId, runType) => {
  return api.get(`api/v1/run/last-run-history`, {
    params: { applicationId, runType },
  });
};


export const getLastRunHistory = (testSuiteId) => {
  return api.get("/api/v1/run/history", {
    params: { testSuiteId },
  });
};

export const getError = (testSuiteRunId) => {
  return api.get(`/api/v1/run/last-run-history-errors`, {
    params: { testSuiteRunId },
  });
};
