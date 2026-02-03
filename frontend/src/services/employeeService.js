import axiosInstance from "../api/axios";

export const employeeService = {
  getAll: () => axiosInstance.get("/emp/allEmp"),
  getById: (id) => axiosInstance.get(`/emp/${id}`),
  getDeleted: () => axiosInstance.get("/emp/trash/list"),
  create: (data) => axiosInstance.post("/emp/addEmp", data),
  update: (id, data) => axiosInstance.put(`/emp/${id}`, data),
  toggleStatus: (id) => axiosInstance.patch(`/emp/${id}/toggle-status`),
  softDelete: (id) => axiosInstance.delete(`/emp/${id}`),
  restore: (id) => axiosInstance.patch(`/emp/${id}/restore`),
};

