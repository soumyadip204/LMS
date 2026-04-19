import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiPlay, FiArrowRight } from 'react-icons/fi';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/course/CourseCard';
import Loader from '../components/common/Loader';
import './Dashboard.css';

const LearnerDashboard = () => {
  const { user } = useAuth();
  const { enrolledCourses, fetchEnrolledCourses, loading } = useCourses();

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-welcome">
            <div className="dashboard-avatar">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="dashboard-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
              <p className="dashboard-subtitle">Continue your learning journey</p>
            </div>
          </div>

          <div className="dashboard-stats-row">
            <div className="dash-stat-card">
              <FiBookOpen className="dash-stat-icon" />
              <div>
                <span className="dash-stat-number">{enrolledCourses?.length || 0}</span>
                <span className="dash-stat-label">Enrolled Courses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-content">
        <div className="dashboard-section">
          <div className="section-header-row">
            <h2 className="section-title">My Courses</h2>
            <Link to="/browse" className="btn btn-secondary btn-sm">
              Browse More <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading your courses..." />
          ) : enrolledCourses?.length > 0 ? (
            <div className="courses-grid">
              {enrolledCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiPlay size={48} />
              <h3>No courses enrolled yet</h3>
              <p>Explore our catalog and enroll in courses that interest you</p>
              <Link to="/browse" className="btn btn-primary">
                Browse Courses <FiArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;
