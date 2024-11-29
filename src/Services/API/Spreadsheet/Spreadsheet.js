import { collabApi ,api} from "../index";

export const createSpreadsheet = (payload) => {
  return api.post("/api/v1/spreadsheets", payload);
};

export const getSpreedsheet = (id) => {
  return api.get(`/api/v1/spreadsheets/${id}`);
};

export const updatesCells = (spreadSheetId, payload) => {
  return api.put(`/api/v1/spreadsheets/${spreadSheetId}/cells`, payload);
};

export const addSheet = (spreadSheetId)=>{
  return api.post(`/api/v1/spreadsheets/${spreadSheetId}/sheets`)
}

export const renameSheet = (payload) =>{
  return api.post(`/api/v1/spreadsheets/rename`,payload)
}