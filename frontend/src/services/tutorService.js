import axiosInstance from "../api/axios";

export const tutorService = {
  getMeDashboard: () => axiosInstance.get("/tutors/me/dashboard"),
  getMeStudents: (params) => axiosInstance.get("/tutors/me/students", { params }),
  getAll: (params) => axiosInstance.get("/tutors/all", { params }),
  getById: (id) => axiosInstance.get(`/tutors/${id}`),
  getDeleted: (params) => axiosInstance.get("/tutors/trash/list", { params }),
  create: (data) => axiosInstance.post("/tutors/add", data),
  update: (id, data) => axiosInstance.put(`/tutors/${id}`, data),
  toggleStatus: (id) => axiosInstance.patch(`/tutors/${id}/toggle-status`),
  softDelete: (id) => axiosInstance.delete(`/tutors/${id}`),
  restore: (id) => axiosInstance.patch(`/tutors/${id}/restore`),
};

