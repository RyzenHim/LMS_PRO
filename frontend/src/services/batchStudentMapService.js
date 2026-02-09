import axiosInstance from "../api/axios";

export const batchStudentMapService = {
  getStudentsOfBatch: (batchId) =>
    axiosInstance.get(`/batch-student-map/batch/${batchId}/students`),

  addStudentsToBatch: (batchId, students) =>
    axiosInstance.put(`/batch-student-map/batch/${batchId}/add-students`, {
      students,
    }),

  removeStudentsFromBatch: (batchId, students) =>
    axiosInstance.put(`/batch-student-map/batch/${batchId}/remove-students`, {
      students,
    }),

  getBatchesOfStudent: (studentId) =>
    axiosInstance.get(`/batch-student-map/student/${studentId}/batches`),

  getBatchHistoryOfStudent: (studentId) =>
    axiosInstance.get(
      `/batch-student-map/student/${studentId}/batches?includeHistory=true`,
    ),

  changeStudentBatch: (studentId, payload) =>
    axiosInstance.post(`/batch-student-map/student/${studentId}/change-batch`, payload),
};
