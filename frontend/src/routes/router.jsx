import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/auth/Login";
import { createBrowserRouter } from "react-router-dom";
import NotFound from "../pages/PageNotFound";
import Landing from "../pages/Landing";
import ProtectedRoute from "./ProtectedRoute";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        {/* <RoleRoute allowedRoles={["admin"]}> */}
        <AdminLayout />
        {/* </RoleRoute> */}
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
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;

// frontend/src/
//  ├─ api/
//  │   └─ axios.js
//  │
//  ├─ services/
//  │   ├─ authService.js
//  │   ├─ adminService.js
//  │   ├─ tutorService.js
//  │   └─ studentService.js
//  │
//  ├─ store/
//  │   ├─ index.js
//  │   └─ auth/
//  │       ├─ authSlice.js
//  │       └─ authThunks.js
//  │
//  ├─ routes/
//  │   └─ router.jsx
//  │
//  ├─ layouts/
//  │   ├─ AuthLayout.jsx
//  │   ├─ AdminLayout.jsx
//  │   ├─ TutorLayout.jsx
//  │   └─ StudentLayout.jsx
//  │
//  ├─ components/
//  │   ├─ ProtectedRoute.jsx
//  │   ├─ RoleRoute.jsx
//  │   ├─ Sidebar.jsx
//  │   ├─ Topbar.jsx
//  │   └─ common/
//  │
//  ├─ pages/
//  │   ├─ auth/
//  │   │   ├─ Login.jsx
//  │   │   └─ Signup.jsx
//  │   │
//  │   ├─ admin/
//  │   │   ├─ Dashboard.jsx
//  │   │   ├─ Users.jsx
//  │   │   ├─ Tutors.jsx
//  │   │   ├─ Courses.jsx
//  │   │   └─ Reports.jsx
//  │   │
//  │   ├─ tutor/
//  │   │   ├─ Dashboard.jsx
//  │   │   ├─ MyCourses.jsx
//  │   │   ├─ Students.jsx
//  │   │   └─ Assignments.jsx
//  │   │
//  │   └─ student/
//  │       ├─ Dashboard.jsx
//  │       ├─ MyCourses.jsx
//  │       ├─ Progress.jsx
//  │       └─ Certificates.jsx
//  │
//  ├─ context/
//  │   └─ ThemeContext.jsx
//  │
//  ├─ hooks/
//  │   ├─ useAppDispatch.js
//  │   └─ useAppSelector.js
//  │
//  ├─ main.jsx
//  └─ index.css
