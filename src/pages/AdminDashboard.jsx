import { useState, useEffect } from 'react';
import {
  FiUsers, FiBookOpen, FiStar, FiTrendingUp,
  FiTrash2, FiEdit2, FiShield, FiUser
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import API from '../utils/api';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/helpers';
import './Dashboard.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/courses'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setCourses(coursesRes.data.courses);
    } catch (err) {
      toast.error('Failed to load admin data');
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their data?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await API.delete(`/admin/courses/${courseId}`);
      toast.success('Course deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  if (loading) return <Loader text="Loading admin panel..." />;

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div className="container">
          <div className="dashboard-welcome">
            <div className="dashboard-avatar admin-avatar">
              <FiShield size={24} />
            </div>
            <div>
              <h1 className="dashboard-title">Admin Panel</h1>
              <p className="dashboard-subtitle">Platform management & analytics</p>
            </div>
          </div>

          <div className="dashboard-stats-row">
            <div className="dash-stat-card">
              <FiUsers className="dash-stat-icon" />
              <div>
                <span className="dash-stat-number">{stats?.stats?.totalUsers || 0}</span>
                <span className="dash-stat-label">Total Users</span>
              </div>
            </div>
            <div className="dash-stat-card">
              <FiBookOpen className="dash-stat-icon" />
              <div>
                <span className="dash-stat-number">{stats?.stats?.totalCourses || 0}</span>
                <span className="dash-stat-label">Total Courses</span>
              </div>
            </div>
            <div className="dash-stat-card">
              <FiTrendingUp className="dash-stat-icon" />
              <div>
                <span className="dash-stat-number">{stats?.stats?.totalEnrollments || 0}</span>
                <span className="dash-stat-label">Enrollments</span>
              </div>
            </div>
            <div className="dash-stat-card">
              <FiStar className="dash-stat-icon" />
              <div>
                <span className="dash-stat-number">{stats?.stats?.totalReviews || 0}</span>
                <span className="dash-stat-label">Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container dashboard-content">
        {/* Tabs */}
        <div className="admin-tabs">
          {['overview', 'users', 'courses'].map(tab => (
            <button
              key={tab}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="admin-overview animate-fade-in">
            <div className="admin-grid">
              <div className="admin-panel">
                <h3 className="admin-panel-title">Top Courses</h3>
                {stats?.topCourses?.length > 0 ? (
                  <div className="admin-top-list">
                    {stats.topCourses.map((c, i) => (
                      <div key={c._id} className="admin-top-item">
                        <span className="admin-top-rank">{i + 1}</span>
                        <div className="admin-top-info">
                          <p className="admin-top-name">{c.title}</p>
                          <span className="admin-top-meta">{c.category}</span>
                        </div>
                        <span className="admin-top-value">{c.enrollmentCount} enrolled</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-muted">No courses yet</p>}
              </div>

              <div className="admin-panel">
                <h3 className="admin-panel-title">Category Distribution</h3>
                {stats?.categoryDistribution?.length > 0 ? (
                  <div className="admin-category-bars">
                    {stats.categoryDistribution.map(cat => {
                      const maxCount = stats.categoryDistribution[0].count;
                      return (
                        <div key={cat._id} className="admin-cat-bar-item">
                          <div className="admin-cat-bar-label">
                            <span>{cat._id}</span>
                            <span>{cat.count}</span>
                          </div>
                          <div className="admin-cat-bar-track">
                            <div className="admin-cat-bar-fill" style={{ width: `${(cat.count / maxCount) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-muted">No data</p>}
              </div>

              <div className="admin-panel">
                <h3 className="admin-panel-title">Recent Users</h3>
                {stats?.recentUsers?.length > 0 ? (
                  <div className="admin-top-list">
                    {stats.recentUsers.map(u => (
                      <div key={u._id} className="admin-top-item">
                        <div className="admin-user-avatar-sm">{u.name?.[0]?.toUpperCase()}</div>
                        <div className="admin-top-info">
                          <p className="admin-top-name">{u.name}</p>
                          <span className="admin-top-meta">{u.email}</span>
                        </div>
                        <span className={`badge badge-${u.role === 'instructor' ? 'info' : u.role === 'admin' ? 'warning' : 'primary'}`}>{u.role}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-muted">No users</p>}
              </div>

              <div className="admin-panel">
                <h3 className="admin-panel-title">User Breakdown</h3>
                <div className="admin-breakdown">
                  <div className="admin-breakdown-item">
                    <span className="admin-bd-dot" style={{ background: 'var(--accent-primary)' }} />
                    <span>Learners</span>
                    <span className="admin-bd-count">{stats?.stats?.totalLearners || 0}</span>
                  </div>
                  <div className="admin-breakdown-item">
                    <span className="admin-bd-dot" style={{ background: 'var(--accent-secondary)' }} />
                    <span>Instructors</span>
                    <span className="admin-bd-count">{stats?.stats?.totalInstructors || 0}</span>
                  </div>
                  <div className="admin-breakdown-item">
                    <span className="admin-bd-dot" style={{ background: 'var(--success)' }} />
                    <span>Published Courses</span>
                    <span className="admin-bd-count">{stats?.stats?.publishedCourses || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-table-section animate-fade-in">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="admin-table-user">
                          <div className="admin-user-avatar-sm">{u.name?.[0]?.toUpperCase()}</div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.role === 'admin' ? 'warning' : u.role === 'instructor' ? 'info' : 'primary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-muted">{formatDate(u.createdAt)}</td>
                      <td>
                        {u.role !== 'admin' && (
                          <div className="admin-table-actions">
                            <select
                              className="admin-role-select"
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            >
                              <option value="learner">Learner</option>
                              <option value="instructor">Instructor</option>
                            </select>
                            <button className="icc-action-btn icc-delete" onClick={() => handleDeleteUser(u._id)}>
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="admin-table-section animate-fade-in">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Students</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c._id}>
                      <td><span className="admin-table-course-title">{c.title}</span></td>
                      <td className="text-muted">{c.instructor?.name || 'Unknown'}</td>
                      <td><span className="badge badge-info">{c.category}</span></td>
                      <td>
                        <span className={`badge badge-${c.isPublished ? 'success' : 'warning'}`}>
                          {c.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>{c.enrollmentCount || 0}</td>
                      <td>
                        <button className="icc-action-btn icc-delete" onClick={() => handleDeleteCourse(c._id)}>
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
