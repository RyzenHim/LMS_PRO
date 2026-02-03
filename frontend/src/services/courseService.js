import axiosInstance from "../api/axios";

export const courseService = {
  getAll: () => axiosInstance.get("/courses/all"),
  getById: (id) => axiosInstance.get(`/courses/${id}`),
  getDeleted: () => axiosInstance.get("/courses/trash/list"),
  create: (data) => axiosInstance.post("/courses/add", data),
  update: (id, data) => axiosInstance.put(`/courses/${id}`, data),
  toggleStatus: (id) => axiosInstance.patch(`/courses/${id}/toggle-status`),
  softDelete: (id) => axiosInstance.delete(`/courses/${id}`),
  restore: (id) => axiosInstance.patch(`/courses/${id}/restore`),
};

