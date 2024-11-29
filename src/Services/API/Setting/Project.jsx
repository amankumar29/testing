import { api } from "../index";

export const uploadApp = (applicationId, formData) => {
  return api.post(
    `/api/project/application/upload/chunk/${applicationId}`,
    formData
  );
};

export const removeApp = (applicationId) => {
  return api.delete(`/api/project/application/delete/app-file/${applicationId}`);
};
