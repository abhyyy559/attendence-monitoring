import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MarkAttendance from './pages/MarkAttendance';
import StudentAttendance from './pages/StudentAttendance';
import StudentCourses from './pages/StudentCourses';
import ShortageAlerts from './pages/ShortageAlerts';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const DashboardSelector = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'faculty') return <FacultyDashboard />;
  return <StudentDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard */}
          <Route path="/" element={
            <PrivateRoute>
              <DashboardSelector />
            </PrivateRoute>
          } />

          {/* Student Routes */}
          <Route path="/student/attendance" element={
            <PrivateRoute>
              <StudentAttendance />
            </PrivateRoute>
          } />
          <Route path="/student/courses" element={
            <PrivateRoute>
              <StudentCourses />
            </PrivateRoute>
          } />
          <Route path="/student/shortage" element={
            <PrivateRoute>
              <ShortageAlerts />
            </PrivateRoute>
          } />
          <Route path="/student/reports" element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          } />

          {/* Faculty Routes */}
          <Route path="/mark-attendance" element={
            <PrivateRoute>
              <MarkAttendance />
            </PrivateRoute>
          } />
          <Route path="/faculty/courses" element={
            <PrivateRoute>
              <FacultyDashboard />
            </PrivateRoute>
          } />
          <Route path="/faculty/history" element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/courses" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/threshold" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/reports" element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          } />

          {/* Common Routes */}
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </Router>
    </AuthProvider>
  );
}

export default App;
