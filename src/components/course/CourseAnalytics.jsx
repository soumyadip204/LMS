import { useState, useEffect } from 'react';
import { FiUsers, FiTrendingUp, FiAward, FiMessageSquare, FiStar, FiActivity, FiCheckCircle, FiFileText } from 'react-icons/fi';
import API from '../../utils/api';
import Loader from '../common/Loader';
import { toast } from 'react-toastify';

const CourseAnalytics = ({ courseId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/courses/${courseId}/analytics`);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load course analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [courseId]);

  if (loading) return <div className="text-center p-5"><Loader text="Crunching numbers..." /></div>;
  if (!analytics) return <div className="text-center p-5 text-muted">No analytics data available.</div>;

  const { enrollment, performance, engagement } = analytics;

  const StatCard = ({ title, value, subtitle, icon, colorClass }) => (
    <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `var(--bg-tertiary)`, border: `1px solid var(--border-color)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }} className={colorClass}>
        {icon}
      </div>
      <div>
        <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.8rem', color: 'var(--text-primary)' }}>{value}</h3>
        {subtitle && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</span>}
      </div>
    </div>
  );

  return (
    <div className="course-analytics" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: '32px', border: '1px solid var(--border-color-hover)' }}>
      <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FiActivity className="text-primary" /> Course Analytics Dashboard
      </h3>

      <div style={{ marginBottom: '36px' }}>
        <h4 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Enrollment & Activity</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <StatCard 
            title="Total Enrolled" 
            value={enrollment.totalEnrolled} 
            subtitle="Registered Students"
            icon={<FiUsers />} 
            colorClass="text-info"
          />
          <StatCard 
            title="Active Learners" 
            value={enrollment.activeStudents} 
            subtitle={`${enrollment.engagementRate}% Engagement Rate`}
            icon={<FiTrendingUp />} 
            colorClass="text-success"
          />
          <StatCard 
            title="Avg. Progress" 
            value={`${performance.averageProgress}%`} 
            subtitle="Overall Completion"
            icon={<FiActivity />} 
            colorClass="text-warning"
          />
        </div>
      </div>

      <div style={{ marginBottom: '36px' }}>
        <h4 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Performance Metrics</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <StatCard 
            title="Total Submissions" 
            value={performance.totalSubmissions} 
            subtitle="Quizzes & Assignments"
            icon={<FiFileText />} 
            colorClass="text-primary"
          />
          <StatCard 
            title="Avg Quiz Score" 
            value={`${performance.averageQuizScore}`} 
            subtitle="Points per quiz"
            icon={<FiAward />} 
            colorClass="text-success"
          />
          <StatCard 
            title="Avg Assignment Score" 
            value={`${performance.averageAssignmentScore}`} 
            subtitle="Points per assignment"
            icon={<FiCheckCircle />} 
            colorClass="text-info"
          />
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Course Effectiveness & Engagement</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <StatCard 
            title="Average Rating" 
            value={engagement.averageRating.toFixed(1)} 
            subtitle={`From ${engagement.totalReviews} reviews`}
            icon={<FiStar />} 
            colorClass="text-warning"
          />
          <StatCard 
            title="Forum Threads" 
            value={engagement.forumThreads} 
            subtitle="Discussions started"
            icon={<FiMessageSquare />} 
            colorClass="text-primary"
          />
          <StatCard 
            title="Forum Replies" 
            value={engagement.forumReplies} 
            subtitle="Total interactions"
            icon={<FiUsers />} 
            colorClass="text-info"
          />
        </div>
      </div>
      <div style={{ marginTop: '36px' }}>
        <h4 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Individual Learner Tracking</h4>
        {analytics.studentPerformance && analytics.studentPerformance.length > 0 ? (
          <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Learner</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Progress</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Quizzes</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Avg Quiz</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Assignments</th>
                  <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Avg Assign</th>
                </tr>
              </thead>
              <tbody>
                {analytics.studentPerformance.map((student, idx) => (
                  <tr key={student._id} style={{ borderBottom: idx === analytics.studentPerformance.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {student.name ? student.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{student.name}</p>
                          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${student.progress}%`, height: '100%', background: 'var(--success)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '35px' }}>{student.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{student.completedQuizzes}</td>
                    <td style={{ padding: '16px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{student.averageQuizScore}</td>
                    <td style={{ padding: '16px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{student.completedAssignments}</td>
                    <td style={{ padding: '16px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{student.averageAssignmentScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted p-4 text-center card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            No enrolled students to display.
          </p>
        )}
      </div>
    </div>
  );
};

export default CourseAnalytics;
