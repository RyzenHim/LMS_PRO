import axiosInstance from "../api/axios";

export const studentService = {
  getAll: () => axiosInstance.get("/students/all"),
  getById: (id) => axiosInstance.get(`/students/${id}`),
  getDeleted: () => axiosInstance.get("/students/trash/list"),
  create: (data) => axiosInstance.post("/students/add", data),
  update: (id, data) => axiosInstance.put(`/students/${id}`, data),
  toggleStatus: (id) => axiosInstance.patch(`/students/${id}/toggle-status`),
  softDelete: (id) => axiosInstance.delete(`/students/${id}`),
  restore: (id) => axiosInstance.patch(`/students/${id}/restore`),
};

