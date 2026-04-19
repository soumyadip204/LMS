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
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Web Development',
    thumbnail: '', tags: '', isPublished: false, lectures: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const resetForm = () => {
    setFormData({
      title: '', description: '', category: 'Web Development',
      thumbnail: '', tags: '', isPublished: false, lectures: []
    });
    setEditingCourse(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      thumbnail: course.thumbnail || '',
      tags: course.tags?.join(', ') || '',
      isPublished: course.isPublished,
      lectures: course.lectures || []
    });
    setShowModal(true);
  };

  const addLecture = () => {
    setFormData(prev => ({
      ...prev,
      lectures: [...prev.lectures, { title: '', youtubeUrl: '', duration: '', order: prev.lectures.length + 1 }]
    }));
  };

  const updateLecture = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      lectures: prev.lectures.map((l, i) => i === index ? { ...l, [field]: value } : l)
    }));
  };

  const removeLecture = (index) => {
    setFormData(prev => ({
      ...prev,
      lectures: prev.lectures.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i + 1 }))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (editingCourse) {
        await updateCourse(editingCourse._id, data);
        toast.success('Course updated!');
      } else {
        await createCourse(data);
        toast.success('Course created!');
      }
      setShowModal(false);
      resetForm();
      fetchMyCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    }
    setSaving(false);
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
                <div key={course._id} className="instructor-course-card card">
                  <div className="icc-thumb">
                    {course.thumbnail || (course.lectures?.[0]?.youtubeUrl && getYouTubeThumbnail(course.lectures[0].youtubeUrl)) ? (
                      <img src={course.thumbnail || getYouTubeThumbnail(course.lectures[0].youtubeUrl)} alt="" />
                    ) : (
                      <div className="icc-thumb-placeholder"><FiPlay size={24} /></div>
                    )}
                  </div>
                  <div className="icc-info">
                    <div className="icc-top">
                      <Link to={`/course/${course._id}`} className="icc-title">{course.title}</Link>
                      <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="icc-category">{course.category}</p>
                    <div className="icc-stats">
                      <span><FiUsers size={14} /> {course.enrollmentCount || 0} students</span>
                      <span><FiPlay size={14} /> {course.lectures?.length || 0} lectures</span>
                    </div>
                  </div>
                  <div className="icc-actions">
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

      {/* Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input className="form-input" placeholder="e.g. Complete React.js Bootcamp" value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} required />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" placeholder="Describe what students will learn..." value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} required rows={4} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" placeholder="react, javascript, web" value={formData.tags} onChange={e => setFormData(p => ({...p, tags: e.target.value}))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail URL (optional)</label>
                <input className="form-input" placeholder="https://example.com/image.jpg" value={formData.thumbnail} onChange={e => setFormData(p => ({...p, thumbnail: e.target.value}))} />
              </div>

              <div className="lectures-section">
                <div className="lectures-header">
                  <h3>Lectures ({formData.lectures.length})</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addLecture}>
                    <FiPlus /> Add Lecture
                  </button>
                </div>
                {formData.lectures.map((lecture, i) => (
                  <div key={i} className="lecture-form-item">
                    <span className="lecture-order">{i + 1}</span>
                    <div className="lecture-fields">
                      <input className="form-input" placeholder="Lecture title" value={lecture.title} onChange={e => updateLecture(i, 'title', e.target.value)} required />
                      <input className="form-input" placeholder="YouTube URL" value={lecture.youtubeUrl} onChange={e => updateLecture(i, 'youtubeUrl', e.target.value)} required />
                      <input className="form-input lecture-duration" placeholder="Duration (e.g. 12:34)" value={lecture.duration} onChange={e => updateLecture(i, 'duration', e.target.value)} />
                    </div>
                    <button type="button" className="lecture-remove" onClick={() => removeLecture(i)}><FiX /></button>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-checkbox-label">
                  <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData(p => ({...p, isPublished: e.target.checked}))} />
                  <span>Publish this course immediately</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <FiSave /> {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
