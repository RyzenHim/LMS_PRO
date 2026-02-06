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
};
