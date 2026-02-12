import axiosInstance from "../api/axios";

export const batchService = {
  getAll: (params) => axiosInstance.get("/batch/all", { params }),

  getDeleted: (params) => axiosInstance.get("/batch/deleted", { params }),

  create: (data) => axiosInstance.post("/batch", data),

  update: (id, data) => axiosInstance.put(`/batch/${id}`, data),

  softDelete: (id) => axiosInstance.delete(`/batch/${id}`),

  restore: (id) => axiosInstance.put(`/batch/restore/${id}`),

  toggleStatus: (id) => axiosInstance.put(`/batch/toggle-status/${id}`),

  getAllBatches: () => axiosInstance.get("/batch/all"),
};
