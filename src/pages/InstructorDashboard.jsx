import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiBookOpen, FiUsers, FiArrowRight, FiX, FiSave, FiPlay
} from 'react-icons/fi';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, getYouTubeThumbnail } from '../utils/helpers';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import './Dashboard.css';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { myCourses, fetchMyCourses, createCourse, updateCourse, deleteCourse, loading } = useCourses();
  const navigate = useNavigate();


  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const openCreateModal = () => {
    navigate('/instructor/course/new');
  };

  const openEditModal = (course) => {
    navigate(`/instructor/course/${course._id}/edit`);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(courseId);
      toast.success('Course deleted');
      fetchMyCourses();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      await updateCourse(course._id, { isPublished: !course.isPublished });
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published!');
      fetchMyCourses();
    } catch (err) {
      toast.error('Failed to update course');
    }
  };

  const totalStudents = myCourses?.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0) || 0;

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-welcome">
            <div className="dashboard-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <h1 className="dashboard-title">Instructor Dashboard</h1>
              <p className="dashboard-subtitle">Manage your courses and track performance</p>
            </div>
          </div>
          <div className="dashboard-stats-row">
            <div className="dash-stat-card">
              <FiBookOpen className="dash-stat-icon" />
              <div>
                <span className="dash-stat-number">{myCourses?.length || 0}</span>
                <span className="dash-stat-label">Total Courses</span>
              </div>
            </div>
            <div className="dash-stat-card">
              <FiUsers className="dash-stat-icon" />
              <div>
                <span className="dash-stat-number">{totalStudents}</span>
                <span className="dash-stat-label">Total Students</span>
              </div>
            </div>
            <div className="dash-stat-card">
              <FiEye className="dash-stat-icon" />
              <div>
                <span className="dash-stat-number">{myCourses?.filter(c => c.isPublished).length || 0}</span>
                <span className="dash-stat-label">Published</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-content">
        <div className="dashboard-section">
          <div className="section-header-row">
            <h2 className="section-title">My Courses</h2>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <FiPlus /> Create Course
            </button>
          </div>

          {loading ? (
            <Loader text="Loading courses..." />
          ) : myCourses?.length > 0 ? (
            <div className="instructor-courses-list">
              {myCourses.map(course => (
                <div key={course._id} className="instructor-course-card card" onClick={() => navigate(`/course/${course._id}`)} style={{ cursor: 'pointer' }}>
                  <div className="icc-thumb">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" />
                    ) : (
                      <div className="icc-thumb-placeholder"><FiPlay size={24} /></div>
                    )}
                  </div>
                  <div className="icc-info">
                    <div className="icc-top">
                      <span className="icc-title">{course.title}</span>
                      <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="icc-category">{course.category}</p>
                    <div className="icc-stats">
                      <span><FiUsers size={14} /> {course.enrollmentCount || 0} students</span>
                      <span><FiBookOpen size={14} /> {course.modules?.length || 0} modules</span>
                    </div>
                  </div>
                  <div className="icc-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="icc-action-btn" title={course.isPublished ? 'Unpublish' : 'Publish'} onClick={() => handleTogglePublish(course)}>
                      {course.isPublished ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                    <button className="icc-action-btn" title="Edit" onClick={() => openEditModal(course)}>
                      <FiEdit2 size={16} />
                    </button>
                    <button className="icc-action-btn icc-delete" title="Delete" onClick={() => handleDelete(course._id)}>
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiBookOpen size={48} />
              <h3>No courses created yet</h3>
              <p>Start sharing your knowledge by creating your first course!</p>
              <button className="btn btn-primary" onClick={openCreateModal}>
                <FiPlus /> Create Your First Course
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default InstructorDashboard;
