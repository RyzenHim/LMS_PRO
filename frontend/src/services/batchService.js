import axiosInstance from "../api/axios";

export const batchService = {
  getAll: () => axiosInstance.get("/batch/all"),

  getDeleted: () => axiosInstance.get("/batch/deleted"),

  create: (data) => axiosInstance.post("/batch", data),

  update: (id, data) => axiosInstance.put(`/batch/${id}`, data),

  softDelete: (id) => axiosInstance.delete(`/batch/${id}`),

  restore: (id) => axiosInstance.put(`/batch/restore/${id}`),

  toggleStatus: (id) => axiosInstance.put(`/batch/toggle-status/${id}`),
};
