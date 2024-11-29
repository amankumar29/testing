import { api } from "../index";

// List Api for the TestPlan
export const getTestPlansList = (payload) => {
  return api.post("/api/test-plans", payload);
};

// Delete Test Plans

export const deleteTestPlan = (id) => {
  return api.delete(`/api/test-plans/${id}`);
};

// Create Test Plan

export const createTestPlan = (payload) => {
  return api.post(`api/test-plans/create`, payload);
};

// Create Run Test Plan
export const createRunTestPlan = (payload) => {
  return api.post("api/run/create-test-plan-run", payload);
};

// TestPlanInfo
export const getTestPlanInfo = (id) => {
  return api.get(`/api/test-plans/${id}`);
};

// Update Test Plan
export const updateTestPlans = (payload, id) => {
  return api.patch(`api/test-plans/${id}`, payload);
};

export const duplicateTestPlans = (id, payload) => {
  return api.post(`/api/test-plans/duplicate/${id}`, payload);
};

export const transferTestPlan = (payload) => {
  return api.post("/api/test-plans/transfer", payload);
};
