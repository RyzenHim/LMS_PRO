import axiosInstance from "../api/axios";

export const feesService = {
  getAll: () => axiosInstance.get("/fees/all"),
  getDeleted: () => axiosInstance.get("/fees/trash/list"),
  getById: (id) => axiosInstance.get(`/fees/${id}`),

  create: (data) => axiosInstance.post("/fees/add", data),
  update: (id, data) => axiosInstance.put(`/fees/${id}`, data),

  toggleStatus: (id) => axiosInstance.patch(`/fees/${id}/toggle-status`),

  softDelete: (id) => axiosInstance.delete(`/fees/${id}`),
  restore: (id) => axiosInstance.patch(`/fees/${id}/restore`),
};
