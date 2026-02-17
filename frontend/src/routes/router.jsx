import { createBrowserRouter } from "react-router-dom";

import App from "../App";
import Landing from "../pages/Landing";
import NotFound from "../pages/PageNotFound";

import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import AdminLayout from "../layouts/adminLayout/Admin_Layout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminStudents from "../pages/admin/AdminStudents";
import AdminTutors from "../pages/admin/AdminTutors";
import AdminEmployees from "../pages/admin/AdminEmployees";
import AdminCourses from "../pages/admin/AdminCourses";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminSkills from "../pages/admin/AdminSkills";
import Visitor from "../pages/visitor/Visitor";
import AdminBatches from "../pages/admin/AdminBatches";
import AdminFees from "../pages/admin/AdminFees";
import AdminTimetable from "../pages/admin/AdminTimetable";

import HrLayout from "../layouts/hrLayout/HrLayout";
import HrDashboard from "../pages/hr/HrDashboard";

import StudentLayout from "../layouts/studentLayout/StudentLayout";
import StudentDashboard from "../pages/students/StudentDashboard";
import StudentTimetable from "../pages/students/StudentTimetable";

import InstructorLayout from "../layouts/TutorLayout";
import InstructorDashboard from "../pages/tutor/InstructorDashboard";

import AdminReports from "../pages/admin/report/AdminReports";
import BatchReport from "../pages/admin/report/BatchReport";
import FeeReport from "../pages/admin/report/FeeReport";
import StudentReport from "../pages/admin/report/StudentReport";
import TimetableReport from "../pages/admin/report/TimetableReport";
import TutorReport from "../pages/admin/report/TutorReport";
import VisitorReport from "../pages/admin/report/VisitorReport";
import CourseReport from "../pages/admin/report/CourseReport";
import EmployeeReport from "../pages/admin/report/EmployeeReport";
import SkillReport from "../pages/admin/report/SkillReport";
import AdminRooms from "../pages/admin/AdminRooms";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Landing /> },

      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          { index: true, element: <Login /> },
          { path: "login", element: <Login /> },
          { path: "forgot-password", element: <ForgotPassword /> },
          { path: "reset-password/:token", element: <ResetPassword /> },
        ],
      },

      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "students", element: <AdminStudents /> },
          { path: "tutors", element: <AdminTutors /> },
          { path: "employees", element: <AdminEmployees /> },
          { path: "courses", element: <AdminCourses /> },
          { path: "skills", element: <AdminSkills /> },
          { path: "profile", element: <AdminProfile /> },
          { path: "visitor", element: <Visitor /> },
          { path: "batches", element: <AdminBatches /> },
          { path: "fees", element: <AdminFees /> },
          { path: "timetable", element: <AdminTimetable /> },

          { path: "reports", element: <AdminReports /> },
          { path: "reports/students", element: <StudentReport /> },
          { path: "reports/batch", element: <BatchReport /> },
          { path: "reports/courses", element: <CourseReport /> },
          { path: "reports/fees", element: <FeeReport /> },
          { path: "reports/tutors", element: <TutorReport /> },
          { path: "reports/employees", element: <EmployeeReport /> },
          { path: "reports/skills", element: <SkillReport /> },
          { path: "reports/timetable", element: <TimetableReport /> },
          { path: "reports/visitors", element: <VisitorReport /> },
          { path: "rooms", element: <AdminRooms /> },
        ],
      },

      {
        path: "hr",
        element: (
          <ProtectedRoute>
            <RoleRoute allowedRoles={["hr"]}>
              <HrLayout />
            </RoleRoute>
          </ProtectedRoute>
        ),
        children: [{ index: true, element: <HrDashboard /> }],
      },

      {
        path: "student",
        element: (
          <ProtectedRoute>
            <RoleRoute allowedRoles={["student"]}>
              <StudentLayout />
            </RoleRoute>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: "timetable", element: <StudentTimetable /> },
        ],
      },

      {
        path: "instructor",
        element: (
          <ProtectedRoute>
            <RoleRoute allowedRoles={["tutor"]}>
              <InstructorLayout />
            </RoleRoute>
          </ProtectedRoute>
        ),
        children: [{ index: true, element: <InstructorDashboard /> }],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
