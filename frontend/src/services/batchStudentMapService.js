import axiosInstance from "../api/axios";

export const batchStudentMapService = {
  // Get active students of a batch
  getStudentsOfBatch: (batchId) =>
    axiosInstance.get(`/batch-student-map/batch/${batchId}/students`),

  // Add students to batch
  addStudentsToBatch: (batchId, students) =>
    axiosInstance.put(`/batch-student-map/batch/${batchId}/add-students`, {
      students,
    }),

  // Remove students from batch
  removeStudentsFromBatch: (batchId, students) =>
    axiosInstance.put(`/batch-student-map/batch/${batchId}/remove-students`, {
      students,
    }),

  // Get active batches of a student
  getBatchesOfStudent: (studentId) =>
    axiosInstance.get(`/batch-student-map/student/${studentId}/batches`),
};
