import axiosInstance from "../api/axios";

export const skillService = {
  getAll: () => axiosInstance.get("/skills/all"),
  getById: (id) => axiosInstance.get(`/skills/${id}`),
  getDeleted: () => axiosInstance.get("/skills/trash/list"),
  create: (data) => axiosInstance.post("/skills/add", data),
  update: (id, data) => axiosInstance.put(`/skills/${id}`, data),
  toggleStatus: (id) => axiosInstance.patch(`/skills/${id}/toggle-status`),
  softDelete: (id) => axiosInstance.delete(`/skills/${id}`),
  restore: (id) => axiosInstance.patch(`/skills/${id}/restore`),
};
