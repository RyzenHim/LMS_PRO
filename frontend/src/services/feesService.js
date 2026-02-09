import axiosInstance from "../api/axios";

export const feesService = {
  getAll: (params) => axiosInstance.get("/fees/all", { params }),
  getDeleted: (params) => axiosInstance.get("/fees/trash/list", { params }),
  getById: (id) => axiosInstance.get(`/fees/${id}`),

  create: (data) => axiosInstance.post("/fees/add", data),
  update: (id, data) => axiosInstance.put(`/fees/${id}`, data),

  toggleStatus: (id) => axiosInstance.patch(`/fees/${id}/toggle-status`),

  softDelete: (id) => axiosInstance.delete(`/fees/${id}`),
  restore: (id) => axiosInstance.patch(`/fees/${id}/restore`),
};
