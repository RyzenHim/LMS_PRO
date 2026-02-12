import axiosInstance from "../api/axios";

export const reportService = {
  getStudentReport: (params) => axiosInstance.get("/reports/students", { params }),
};
