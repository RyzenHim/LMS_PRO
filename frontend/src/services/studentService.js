import axiosInstance from "../api/axios";

export const studentService = {
  getAll: (params) => axiosInstance.get("/students/all", { params }),
  getById: (id) => axiosInstance.get(`/students/${id}`),
  getDeleted: (params) => axiosInstance.get("/students/trash/list", { params }),
  create: (data) => axiosInstance.post("/students/add", data),
  update: (id, data) => axiosInstance.put(`/students/${id}`, data),
  toggleStatus: (id) => axiosInstance.patch(`/students/${id}/toggle-status`),
  softDelete: (id) => axiosInstance.delete(`/students/${id}`),
  restore: (id) => axiosInstance.patch(`/students/${id}/restore`),
};



  


