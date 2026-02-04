import axiosInstance from "../api/axios";

export const batchService = {
  // Active batches
  getAll: () => axiosInstance.get("/batch"),

  // Deleted batches
  getDeleted: () => axiosInstance.get("/batch/deleted"),

  // Create
  create: (data) => axiosInstance.post("/batch", data),

  // Update
  update: (id, data) => axiosInstance.put(`/batch/${id}`, data),

  // Soft delete
  softDelete: (id) => axiosInstance.delete(`/batch/${id}`),

  // Restore
  restore: (id) => axiosInstance.put(`/batch/restore/${id}`),

  // Toggle isActive
  toggleStatus: (id) => axiosInstance.put(`/batch/toggle-status/${id}`),
};
