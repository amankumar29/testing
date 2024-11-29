import { api } from "../index";

export const createIntegration = (payload) => {
  return api.post("/api/integrations/create", payload);
};

export const fetchIntegration = () => {
  return api.get("/api/integrations");
};

export const deleteIntegration = (id) => {
  return api.delete(`/api/integrations/${id}`);
};

export const updateIntegration = (id, payload) => {
  return api.patch(`/api/integrations/${id}`, payload);
};