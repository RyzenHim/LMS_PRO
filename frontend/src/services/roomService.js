import axiosInstance from "../api/axios";

export const roomService = {
  getAll: (params) => axiosInstance.get("/rooms/all", { params }),
  getOptions: () => axiosInstance.get("/rooms/options"),
  create: (data) => axiosInstance.post("/rooms", data),
  update: (id, data) => axiosInstance.put(`/rooms/${id}`, data),
  remove: (id) => axiosInstance.delete(`/rooms/${id}`),
};
