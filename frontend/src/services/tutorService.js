import axiosInstance from "../api/axios";

export const tutorService = {
  getAll: () => axiosInstance.get("/tutors/all"),
  getById: (id) => axiosInstance.get(`/tutors/${id}`),
  getDeleted: () => axiosInstance.get("/tutors/trash/list"),
  create: (data) => axiosInstance.post("/tutors/add", data),
  update: (id, data) => axiosInstance.put(`/tutors/${id}`, data),
  toggleStatus: (id) => axiosInstance.patch(`/tutors/${id}/toggle-status`),
  softDelete: (id) => axiosInstance.delete(`/tutors/${id}`),
  restore: (id) => axiosInstance.patch(`/tutors/${id}/restore`),
};

