import { api } from "../index";

export const createPage = (locatorId, payload) => {
  return api.post(
    `/api/v1/locatorsRepository/createPage`,
    payload, // Pass payload as the body
    {
      params: { locatorId }, // Pass locatorId as a query parameter
    }
  );
};

export const getRepo = (projectId, applicationId) => {
  return api.get(`/api/v1/locatorsRepository/getLocator`, {
    params: { projectId, applicationId },
  });
};

export const getAllPage = (locatorId) => {
  return api.get(`/api/v1/locatorsRepository/pages`, {
    params: { locatorId },
  });
};

export const updatePage = (locatorId, pageId, payload) => {
  return api.put(`/api/v1/locatorsRepository/updatePage`, payload, {
    params: { locatorId, pageId },
  });
};
export const deletePage = (locatorId, id) => {
  return api.delete(`/api/v1/locatorsRepository/deletePage/${id}`, {
    params: { locatorId },
  });
};

export const getAllElement = (locatorId, pageId) => {
  return api.get(`/api/v1/locatorsRepository/elementsBypageId`, {
    params: { locatorId, pageId },
  });
};

export const createElement = (locatorId, pageId, payload) => {
  return api.post(
    `/api/v1/locatorsRepository/createElement`,
    payload, // Pass payload as the body
    {
      params: { locatorId, pageId }, // Pass locatorId as a query parameter
    }
  );
};

export const deleteElement = (locatorId, pageId, elementId) => {
  return api.delete(`/api/v1/locatorsRepository/deleteElement`, {
    params: { locatorId, pageId, elementId },
  });
};

export const updateElement = (locatorId, pageId, elementId, payload) => {
  return api.put(`/api/v1/locatorsRepository/updateElement`, payload, {
    params: { locatorId, pageId, elementId },
  });
};

export const createRepo = (projectId, applicationId) => {
  return api.post(`/api/v1/locatorsRepository/createLocator`, {
    projectId,
    applicationId,
  });
};
