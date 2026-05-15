import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Trainers from "./pages/Trainers";
import Packages from "./pages/Packages";
import CheckIn from "./pages/CheckIn";
import Reports from "./pages/Reports";
import Schedule from "./pages/Schedule";
import Facilities from "./pages/Facilities";
import Invoices from "./pages/Invoices";
import UserHome from "./pages/UserHome";
import Blog from "./pages/Blog";
import Services from "./pages/Services";
import Promotions from "./pages/Promotions";
import Careers from "./pages/Careers";
import Settings from "./pages/Settings";
import MemberDashboard from "./pages/MemberDashboard";
import MemberProfile from "./pages/MemberProfile";
import MemberSchedule from "./pages/MemberSchedule";
import MemberCheckInHistory from "./pages/MemberCheckInHistory";
import MemberWorkouts from "./pages/MemberWorkouts";
import MemberMembership from "./pages/MemberMembership";
import MemberInvoices from "./pages/MemberInvoices";
import TrainerDashboard from "./pages/TrainerDashboard";
import TrainerProfile from "./pages/TrainerProfile";
import TrainerClasses from "./pages/TrainerClasses";
import TrainerStudents from "./pages/TrainerStudents";
import TrainerSchedule from "./pages/TrainerSchedule";
import TrainerAttendance from "./pages/TrainerAttendance";
import TrainerIncome from "./pages/TrainerIncome";
import "./pages/login.css";
import "./pages/blog.css";
import "./pages/services.css";
import "./pages/promotions.css";
import "./pages/careers.css";
import "./pages/memberDashboard.css";
import "./pages/memberProfile.css";
import "./pages/memberSchedule.css";
import "./pages/memberCheckInHistory.css";
import "./pages/memberWorkouts.css";
import "./pages/memberMembership.css";
import "./pages/memberInvoices.css";
import "./pages/trainerDashboard.css";
import "./pages/trainerProfile.css";
import "./pages/trainerClasses.css";
import "./pages/trainerStudents.css";
import "./pages/trainerSchedule.css";
import "./pages/trainerAttendance.css";
import "./pages/trainerIncome.css";

function App() {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === "Admin" || userRole === "admin";
  const isTrainer = userRole === "HuanLuyenVien" || userRole === "trainer";
  const isMember = userRole === "HoiVien" || userRole === "member";
  const defaultAuthenticatedRoute = isAdmin
    ? "/admin/dashboard"
    : isTrainer
      ? "/trainer/dashboard"
      : "/member/dashboard";

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<UserHome />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/services" element={<Services />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={defaultAuthenticatedRoute} replace />
            ) : (
              <Login />
            )
          }
        />

        {/* User Routes - Legacy */}
        <Route
          path="/user/profile"
          element={<Navigate to="/member/profile" replace />}
        />

        {/* Member Dashboard Routes */}
        <Route
          path="/member/dashboard"
          element={
            isAuthenticated && isMember ? (
              <MemberDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/member/profile"
          element={
            isAuthenticated && isMember ? (
              <MemberProfile />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/member/schedule"
          element={
            isAuthenticated && isMember ? (
              <MemberSchedule />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/member/checkin-history"
          element={
            isAuthenticated && isMember ? (
              <MemberCheckInHistory />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/member/workouts"
          element={
            isAuthenticated && isMember ? (
              <MemberWorkouts />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/member/membership"
          element={
            isAuthenticated && isMember ? (
              <MemberMembership />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/member/invoices"
          element={
            isAuthenticated && isMember ? (
              <MemberInvoices />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/member/*"
          element={
            isAuthenticated && isMember ? (
              <MemberDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Trainer Routes */}
        <Route
          path="/trainer/dashboard"
          element={
            isAuthenticated && isTrainer ? (
              <TrainerDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/trainer/profile"
          element={
            isAuthenticated && isTrainer ? (
              <TrainerProfile />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/trainer/classes"
          element={
            isAuthenticated && isTrainer ? (
              <TrainerClasses />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/trainer/students"
          element={
            isAuthenticated && isTrainer ? (
              <TrainerStudents />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/trainer/schedule"
          element={
            isAuthenticated && isTrainer ? (
              <TrainerSchedule />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/trainer/attendance"
          element={
            isAuthenticated && isTrainer ? (
              <TrainerAttendance />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/trainer/income"
          element={
            isAuthenticated && isTrainer ? (
              <TrainerIncome />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/trainer/*"
          element={
            isAuthenticated && isTrainer ? (
              <TrainerDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="packages" element={<Packages />} />
          <Route path="checkin" element={<CheckIn />} />
          <Route path="reports" element={<Reports />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="facilities" element={<Facilities />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? defaultAuthenticatedRoute : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
