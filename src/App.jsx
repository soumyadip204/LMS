import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';
import AnimatedRoutes from './components/common/AnimatedRoutes';
import ScrollToTop from './components/common/ScrollToTop';

import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import CourseDetailPage from './pages/CourseDetailPage';
import Login from './pages/Login';
import Register from './pages/Register';
import LearnerDashboard from './pages/LearnerDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseEditor from './pages/CourseEditor';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import HelpCenterPage from './pages/HelpCenterPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CourseProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <AnimatedRoutes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/course/:id" element={<CourseDetailPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Learner Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <RoleRoute roles={['learner']}>
                      <LearnerDashboard />
                    </RoleRoute>
                  }
                />

                {/* Instructor Routes */}
                <Route
                  path="/instructor"
                  element={
                    <RoleRoute roles={['instructor']}>
                      <InstructorDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/instructor/course/new"
                  element={
                    <RoleRoute roles={['instructor']}>
                      <CourseEditor />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/instructor/course/:id/edit"
                  element={
                    <RoleRoute roles={['instructor']}>
                      <CourseEditor />
                    </RoleRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <RoleRoute roles={['admin']}>
                      <AdminDashboard />
                    </RoleRoute>
                  }
                />

                {/* Profile (all authenticated users) */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </AnimatedRoutes>
            </main>
            <Footer />
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </div>
        </CourseProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
