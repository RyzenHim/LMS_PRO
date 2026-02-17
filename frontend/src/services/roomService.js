import axiosInstance from "../api/axios";

export const roomService = {
  getAll: () => axiosInstance.get("/rooms/all"),
  getOptions: () => axiosInstance.get("/rooms/options"),
  create: (data) => axiosInstance.post("/rooms", data),
  update: (id, data) => axiosInstance.put(`/rooms/${id}`, data),
  remove: (id) => axiosInstance.delete(`/rooms/${id}`),
};
