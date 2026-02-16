import axiosInstance from "../api/axios";

export const assignmentService = {
  getMyAssignments: (params) => axiosInstance.get("/assignments/my", { params }),
  getStudentAssignments: (params) =>
    axiosInstance.get("/assignments/student/me", { params }),
  createAssignment: (payload) => axiosInstance.post("/assignments", payload),
  updateAssignment: (id, payload) =>
    axiosInstance.put(`/assignments/${id}`, payload),
  deleteAssignment: (id) => axiosInstance.delete(`/assignments/${id}`),
};
