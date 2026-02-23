// src/services/attendanceService.js
import axiosInstance from "../api/axios";

export const attendanceService = {
  /**
   * Get list of students enrolled in a batch
   * GET /attendance/batch/:batchId/students
   */
  getBatchStudents: (batchId) =>
    axiosInstance.get(`/attendance/batch/${batchId}/students`),

  /**
   * Get attendance records for a specific date in a batch
   * GET /attendance/batch/:batchId?date=YYYY-MM-DD
   */
  getAttendanceByDate: (batchId, date) =>
    axiosInstance.get(`/attendance/batch/${batchId}`, {
      params: { date },
    }),

  /**
   * Mark attendance for multiple students on a date
   * POST /attendance/batch/:batchId/mark
   * Body: { date: string, records: [{ student: id, status: string }] }
   */
  markAttendance: (batchId, data) =>
    axiosInstance.post(`/attendance/batch/${batchId}/mark`, data),

  /**
   * Mark/update attendance for a single student
   * PATCH /attendance/batch/:batchId/student/:studentId
   * Body: { date: string, status: string }
   */
  markSingleStudent: (batchId, studentId, data) =>
    axiosInstance.patch(`/attendance/batch/${batchId}/student/${studentId}`, data),

  /**
   * Get full attendance dashboard/analytics for a batch
   * GET /attendance/batch/:batchId/dashboard?threshold=75
   */
  getBatchDashboard: (batchId, threshold = 75) =>
    axiosInstance.get(`/attendance/batch/${batchId}/dashboard`, {
      params: { threshold },
    }),

  /**
   * Get legacy summary (if still needed)
   * GET /attendance/batch/:batchId/summary
   */
  getBatchSummary: (batchId) =>
    axiosInstance.get(`/attendance/batch/${batchId}/summary`),
};