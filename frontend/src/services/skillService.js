import axiosInstance from "../api/axios";

export const skillService = {
  getAll: (params) => axiosInstance.get("/skills/all", { params }),
  getById: (id) => axiosInstance.get(`/skills/${id}`),
  getDeleted: (params) => axiosInstance.get("/skills/trash/list", { params }),
  create: (data) => axiosInstance.post("/skills/add", data),
  update: (id, data) => axiosInstance.put(`/skills/${id}`, data),
  toggleStatus: (id) => axiosInstance.patch(`/skills/${id}/toggle-status`),
  softDelete: (id) => axiosInstance.delete(`/skills/${id}`),
  restore: (id) => axiosInstance.patch(`/skills/${id}/restore`),
};
