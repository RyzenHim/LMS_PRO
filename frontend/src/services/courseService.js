import axiosInstance from "../api/axios";

export const courseService = {
  getAll: (params) => axiosInstance.get("/courses/all", { params }),
  getById: (id) => axiosInstance.get(`/courses/${id}`),
  getDeleted: (params) => axiosInstance.get("/courses/trash/list", { params }),
  create: (data) => axiosInstance.post("/courses/add", data),
  update: (id, data) => axiosInstance.put(`/courses/${id}`, data),
  toggleStatus: (id) => axiosInstance.patch(`/courses/${id}/toggle-status`),
  softDelete: (id) => axiosInstance.delete(`/courses/${id}`),
  restore: (id) => axiosInstance.patch(`/courses/${id}/restore`),
  getAllCourses: () => axiosInstance.get("/courses/all"),
};

