import axiosInstance from "../api/axios";

export const timetableService = {
  addSlot: (data) => axiosInstance.post("/timetable/add", data),
  getBatchTimetable: (batchId) => axiosInstance.get(`/timetable/batch/${batchId}`),
  updateSlot: (id, data) => axiosInstance.put(`/timetable/${id}`, data),
  deleteSlot: (id) => axiosInstance.delete(`/timetable/${id}`),
};
