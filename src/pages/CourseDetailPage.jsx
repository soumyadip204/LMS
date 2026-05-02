import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { getYouTubeId } from '../utils/helpers';
import API from '../utils/api';
import Loader from '../components/common/Loader';
import {
  FiPlayCircle, FiCheckCircle, FiStar, FiClock, FiUsers,
  FiBookOpen, FiChevronDown, FiChevronUp, FiVideo, FiFileText,
  FiEdit3, FiHelpCircle, FiLock, FiExternalLink, FiXCircle, FiAward
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import CourseForum from '../components/course/CourseForum';
import CourseAnalytics from '../components/course/CourseAnalytics';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currentCourse, fetchCourse, enrollInCourse, submitAssignment, submitQuiz, fetchMySubmissions, submitReview } = useCourses();

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeItem, setActiveItem] = useState(null);

  const [expandedModules, setExpandedModules] = useState({ 0: true });

  // Submissions State
  const [mySubmissions, setMySubmissions] = useState({ assignments: [], quizzes: [] });

  // Specific UI States for interactive items
  const [assignmentUrl, setAssignmentUrl] = useState('');
  const [assignmentText, setAssignmentText] = useState('');

  const [quizState, setQuizState] = useState({ started: false, answers: [] });

  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState('content');

  const isEnrolled = isAuthenticated && currentCourse?.enrolledStudents?.some(s =>
    (typeof s === 'string' ? s : s._id) === user?._id
  );
  const isInstructor = isAuthenticated && currentCourse?.instructor?._id === user?._id;
  const canAccessContent = isEnrolled || isInstructor || user?.role === 'admin';

  useEffect(() => {
    loadCourseData();
  }, [id, isAuthenticated]);

  const loadCourseData = async () => {
    setLoading(true);
    try {
      const course = await fetchCourse(id);
      if (course?.modules?.length > 0) {
        if (course.modules[0].items?.length > 0) {
          setActiveItem(course.modules[0].items[0]);
        }
      }

      if (canAccessContent) {
        loadSubmissions();
      }
    } catch (err) {
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    const subs = await fetchMySubmissions(id);
    setMySubmissions(subs);
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) return navigate('/login');
    setEnrolling(true);
    try {
      await enrollInCourse(id);
      toast.success('Successfully enrolled!');
      fetchCourse(id); // refresh
      loadSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleItemClick = (modIndex, item) => {
    if (!canAccessContent) return;
    setActiveModuleIndex(modIndex);
    setActiveItem(item);

    // Reset specific states
    setQuizState({ started: false, answers: [] });
    // Pre-fill assignment if existing
    if (item.type === 'assignment') {
      const existingSub = mySubmissions.assignments.find(a => a.assignmentId === item._id);
      if (existingSub) {
        setAssignmentUrl(existingSub.submissionUrl);
        setAssignmentText(existingSub.submissionText);
      } else {
        setAssignmentUrl('');
        setAssignmentText('');
      }
    }
  };

  const toggleModule = (index) => {
    setExpandedModules(p => ({ ...p, [index]: !p[index] }));
  };

  // ASSIGNMENT HANDLING
  const handleAssignmentSubmit = async () => {
    if (!assignmentUrl && !assignmentText) {
      return toast.error("Please provide either a URL or text approach");
    }
    const btn = document.activeElement;
    if (btn) btn.disabled = true;
    try {
      await submitAssignment(id, activeItem._id, { submissionUrl: assignmentUrl, submissionText: assignmentText });
      toast.success("Assignment submitted successfully!");
      loadSubmissions();
    } catch (err) {
      toast.error('Failed to submit assignment');
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  // QUIZ HANDLING
  const startQuiz = () => {
    setQuizState({
      started: true,
      answers: activeItem.questions.map(q => ({ questionId: q._id, selectedOptionIds: [] }))
    });
  };

  const toggleQuizOption = (qId, type, optId) => {
    setQuizState(prev => {
      const newAnswers = prev.answers.map(ans => {
        if (ans.questionId === qId) {
          if (type === 'single') {
            return { ...ans, selectedOptionIds: [optId] };
          } else {
            const hasOption = ans.selectedOptionIds.includes(optId);
            return {
              ...ans,
              selectedOptionIds: hasOption
                ? ans.selectedOptionIds.filter(id => id !== optId)
                : [...ans.selectedOptionIds, optId]
            };
          }
        }
        return ans;
      });
      return { ...prev, answers: newAnswers };
    });
  };

  const handleQuizSubmit = async () => {
    // Validate if any option is chosen at all (or enforce all questions)
    // The user requirement: "clicking finish and submit quiz without choosing any option it shows quiz submitted, fix it."
    const hasAnyAnswer = quizState.answers.some(ans => ans.selectedOptionIds.length > 0);
    if (!hasAnyAnswer) {
      return toast.error("Please select at least one option before submitting the quiz.");
    }

    const btn = document.activeElement;
    if (btn) btn.disabled = true;
    try {
      await submitQuiz(id, activeItem._id, quizState.answers);
      toast.success("Quiz submitted!");
      await loadSubmissions();
      // Setting started to false will immediately show the results view
      setQuizState({ started: false, answers: [] });
    } catch (err) {
      toast.error('Failed to submit quiz');
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  if (loading) return <Loader text="Loading course details..." />;
  if (!currentCourse) return <div className="container mt-5 text-center"><h2>Course not found</h2></div>;

  const totalReviews = currentCourse.totalReviews || 0;
  const rating = currentCourse.averageRating || 0;

  // Computed helpers for rendering
  const getItemIcon = (type) => {
    switch (type) {
      case 'video': return <FiVideo className="item-icon-small" />;
      case 'documentation': return <FiFileText className="item-icon-small text-info" />;
      case 'assignment': return <FiEdit3 className="item-icon-small text-primary" />;
      case 'quiz': return <FiHelpCircle className="item-icon-small text-warning" />;
      default: return null;
    }
  };

  const isItemCompleted = (item) => {
    if (item.type === 'assignment') return mySubmissions.assignments.some(a => a.assignmentId === item._id);
    if (item.type === 'quiz') return mySubmissions.quizzes.some(q => q.quizId === item._id);
    return false; // Video/Doc progress tracking not implemented
  };

  // Main UI Renders
  const renderVideoPlayer = () => {
    const videoId = getYouTubeId(activeItem.url);
    if (!videoId) return <div className="video-error">Invalid video URL provided.</div>;
    return (
      <div className="cd-video-wrapper">
        <iframe
          className="cd-video-iframe"
          title={activeItem.title}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  const renderDocumentation = () => {
    return (
      <div className="cd-doc-viewer">
        <FiFileText size={64} className="text-info mb-4" />
        <h2 className="mb-4">{activeItem.title}</h2>
        <a href={activeItem.url?.startsWith('http') ? activeItem.url : `https://${activeItem.url}`} target="_blank" rel="noreferrer" className="btn btn-primary">
          Open Document <FiExternalLink className="ml-2" />
        </a>
      </div>
    );
  };

  const renderAssignmentUI = () => {
    const existingSub = mySubmissions.assignments.find(a => a.assignmentId === activeItem._id);

    return (
      <div className="cd-interactive-panel">
        <div className="panel-header">
          <h2>{activeItem.title} <span className="badge badge-primary ml-3">{activeItem.maxScore} pts</span></h2>
          <span className="metadata-badge"><FiClock /> {activeItem.time ? `${activeItem.time} mins limit` : 'No time limit'}</span>
          <span className="metadata-badge text-warning"><FiStar /> Passing: {activeItem.passingScore}</span>
        </div>

        <div className="panel-desc mt-4">
          <p>{activeItem.description}</p>
          {activeItem.attachmentUrl && (
            <a href={activeItem.attachmentUrl.startsWith('http') ? activeItem.attachmentUrl : `https://${activeItem.attachmentUrl}`} target="_blank" rel="noreferrer" className="attachment-link mt-3 block">
              <FiExternalLink /> Instructions Material
            </a>
          )}
        </div>

        <div style={{ marginTop: '32px', padding: '28px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color-hover)' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.3rem' }}>
            Your Submission {existingSub && <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiCheckCircle /> Submitted</span>}
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Submission URL</label>
            <input className="form-input" placeholder="https://github.com/username/project" value={assignmentUrl} onChange={e => setAssignmentUrl(e.target.value)} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color-hover)' }} />
            <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Provide a link to your work (e.g., GitHub, Drive, Portfolio)</small>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Submission Text / Notes</label>
            <textarea className="form-textarea" placeholder="Provide extra context, code snippets, or instructions here..." rows="5" value={assignmentText} onChange={e => setAssignmentText(e.target.value)} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color-hover)' }}></textarea>
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleAssignmentSubmit}>
            {existingSub ? 'Update Submission' : 'Submit Assignment'}
          </button>

          {existingSub?.score !== null && existingSub?.score !== undefined && (
            <div style={{ marginTop: '20px', padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiAward style={{ color: 'var(--success)' }} />
              <strong>Graded Score:</strong> <span style={{ color: 'var(--success)', fontWeight: 700 }}>{existingSub.score}</span> / {activeItem.maxScore}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuizUI = () => {
    const existingSub = mySubmissions.quizzes.find(q => q.quizId === activeItem._id);

    // View Results State
    if (existingSub && !quizState.started) {
      return (
        <div className="cd-interactive-panel">
          <div className="panel-header mb-4 text-center">
            <h2>{activeItem.title} - Results</h2>
            <div className={`quiz-result-large ${existingSub.passed ? 'text-success' : 'text-error'} mt-3`}>
              {existingSub.passed ? 'PASSED' : 'FAILED'} ({existingSub.score} / {activeItem.maxScore})
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <h3 style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>Question Review</h3>
            {activeItem.questions.map((q, qIndex) => {
              const studentAnswer = existingSub.answers.find(ans => ans.questionId === q._id);
              const selectedIds = studentAnswer ? studentAnswer.selectedOptionIds : [];
              return (
                <div key={q._id} style={{ padding: '24px', marginBottom: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color-hover)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <p style={{ fontWeight: 700, margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', flex: 1 }}>
                      {qIndex + 1}. {q.questionText}
                    </p>
                    <span className="badge badge-warning" style={{ marginLeft: '12px', flexShrink: 0 }}>{q.score} pts</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {q.options.map((opt) => {
                      const isSelected = selectedIds.includes(opt._id);
                      let borderStyle = '1px solid var(--border-color)';
                      let bgColor = 'var(--bg-card)';
                      let textColor = 'var(--text-secondary)';

                      if (opt.isCorrect) {
                        borderStyle = '2px solid var(--success)';
                        bgColor = 'rgba(16, 185, 129, 0.12)';
                        textColor = 'var(--success)';
                      } else if (isSelected) {
                        borderStyle = '2px solid var(--error)';
                        bgColor = 'rgba(239, 68, 68, 0.12)';
                        textColor = 'var(--error)';
                      }

                      return (
                        <div key={opt._id} style={{
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: borderStyle,
                          background: bgColor,
                          color: textColor,
                          fontWeight: (opt.isCorrect || isSelected) ? 600 : 400,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <span style={{ width: '20px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                            {opt.isCorrect ? <FiCheckCircle /> : (isSelected ? <FiXCircle /> : null)}
                          </span>
                          <span style={{ flex: 1 }}>{opt.text}</span>
                          {opt.isCorrect && <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>Correct</span>}
                          {!opt.isCorrect && isSelected && <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>Your Pick</span>}
                        </div>
                      )
                    })}
                  </div>
                  {q.explanation && (
                    <div style={{ marginTop: '16px', padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.08)', borderLeft: '4px solid var(--info)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--info)', fontWeight: 600, fontSize: '0.88rem' }}>
                        <FiHelpCircle /> Explanation
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button className="btn btn-secondary mt-5 mx-auto block" onClick={startQuiz}>Retake Quiz</button>
        </div>
      );
    }

    // Attempting state handled outside normal UI layout as a full page
    if (quizState.started) {
      return null;
    }

    // Intro state
    const metaCardStyle = { padding: '20px 16px', border: '1px solid var(--border-color-hover)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' };
    return (
      <div className="cd-interactive-panel" style={{ textAlign: 'center', padding: '48px 40px' }}>
        <div style={{ marginBottom: '20px' }}>
          <FiHelpCircle size={72} style={{ color: 'var(--warning)', opacity: 0.75 }} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>{activeItem.title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '36px', maxWidth: '550px', margin: '0 auto 36px auto', lineHeight: 1.6 }}>
          Review the details below before starting. Once started, you must complete the quiz in one sitting.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          maxWidth: '700px',
          margin: '0 auto 36px auto'
        }}>
          <div style={metaCardStyle}>
            <FiClock size={22} style={{ color: 'var(--accent-secondary)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time Limit</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activeItem.time ? `${activeItem.time} mins` : 'Unlimited'}</span>
          </div>
          <div style={metaCardStyle}>
            <FiBookOpen size={22} style={{ color: 'var(--accent-secondary)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Questions</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activeItem.questions?.length}</span>
          </div>
          <div style={metaCardStyle}>
            <FiStar size={22} style={{ color: 'var(--accent-secondary)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max Score</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activeItem.maxScore} pts</span>
          </div>
          <div style={metaCardStyle}>
            <FiCheckCircle size={22} style={{ color: 'var(--accent-secondary)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Passing Score</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activeItem.passingScore} pts</span>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={startQuiz} style={{ fontSize: '1.1rem', padding: '16px 48px' }}>
          Start Quiz Now
        </button>
      </div>
    );
  };

  // FULLSCREEN QUIZ RENDER INTERCEPT
  if (activeItem?.type === 'quiz' && quizState.started) {
    return (
      <div className="course-detail-page page-enter">
        <div className="container" style={{ marginTop: '40px', marginBottom: '40px' }}>
          <div className="cd-interactive-panel card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
            <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ marginBottom: '8px' }}>{activeItem.title}</h2>
              <div className="metadata-badge" style={{ color: 'var(--warning)' }}><FiClock /> {activeItem.time ? `${activeItem.time} mins limit` : 'No time limit'}</div>
            </div>

            <div>
              {activeItem.questions.map((q, i) => (
                <div key={q._id} style={{
                  padding: '28px',
                  marginBottom: '24px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color-hover)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', flex: 1 }}>
                      {i + 1}. {q.questionText}
                    </h3>
                    <span className="badge badge-info" style={{ flexShrink: 0 }}>{q.type === 'single' ? 'Single' : 'Multiple'}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {q.options.map(opt => {
                      const myAns = quizState.answers.find(a => a.questionId === q._id);
                      const isChecked = myAns?.selectedOptionIds.includes(opt._id);
                      return (
                        <label key={opt._id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '16px 18px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: isChecked ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          background: isChecked ? 'rgba(108, 43, 217, 0.12)' : 'var(--bg-card)',
                        }}>
                          <input
                            type={q.type === 'single' ? 'radio' : 'checkbox'}
                            name={`quest_${q._id}`}
                            checked={isChecked}
                            onChange={() => toggleQuizOption(q._id, q.type, opt._id)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                          />
                          <span style={{ fontSize: '1rem', color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <button className="btn btn-secondary" onClick={() => setQuizState({ started: false, answers: [] })}>Cancel</button>
                <button className="btn btn-primary" onClick={handleQuizSubmit}>Finish & Submit Quiz</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating || !reviewComment.trim()) return toast.error("Please provide a rating and a comment");
    setSubmittingReview(true);
    try {
      await submitReview(id, reviewRating, reviewComment);
      toast.success("Review submitted successfully!");
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const userHasReviewed = currentCourse.reviews?.some(r => r.user?._id === user?._id);

  return (
    <div className="course-detail-page page-enter">
      {/* HEADER SECTION */}
      <div className="cd-hero">
        <div className="container cd-hero-inner">
          <div className="cd-hero-content">
            <span className="badge badge-warning mb-3">{currentCourse.category}</span>
            <h1 className="cd-title">{currentCourse.title}</h1>
            <p className="cd-desc">{currentCourse.description}</p>

            <div className="cd-meta-group">
              <div className="cd-meta-item cd-instructor-badge">
                <div className="cd-avatar">{currentCourse.instructor?.name?.[0]?.toUpperCase()}</div>
                <span>{currentCourse.instructor?.name}</span>
              </div>
              <div className="cd-meta-item">
                <FiStar className="text-warning" />
                <span>{rating.toFixed(1)} ({totalReviews} reviews)</span>
              </div>
              <div className="cd-meta-item">
                <FiUsers />
                <span>{currentCourse.enrollmentCount || 0} students enrolled</span>
              </div>
            </div>
          </div>

          <div className="cd-hero-action">
            {canAccessContent ? (
              <div className="cd-enrolled-notice">
                <FiCheckCircle size={24} className="text-success mb-2" />
                <h3>You are {isInstructor ? 'the instructor' : 'enrolled'}</h3>
                <p>Scroll down to browse the curriculum modules.</p>
              </div>
            ) : (
              <div className="cd-enroll-box card">
                <div className="enroll-price">Free</div>
                <button className="btn btn-primary btn-block btn-lg" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
                <ul className="enroll-perks">
                  <li><FiVideo /> Rich module content</li>
                  <li><FiFileText /> Assigments & Quizzes</li>
                  <li><FiClock /> Certificate of completion</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container cd-main">
        {canAccessContent ? (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <button
                className={`btn ${activeTab === 'content' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('content')}
              >
                Course Content
              </button>
              <button
                className={`btn ${activeTab === 'forum' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('forum')}
              >
                Q&A Forum
              </button>
              {(isInstructor || user?.role === 'admin') && (
                <button
                  className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Analytics
                </button>
              )}
            </div>

            {activeTab === 'content' && (
              <div className="cd-learning-layout">
                <div className="cd-sidebar">
                  <h3 className="cd-sidebar-title">Course Modules</h3>
                  <div className="cd-module-list">
                    {currentCourse.modules?.length > 0 ? (
                      currentCourse.modules.map((module, modIndex) => (
                        <div key={module._id || modIndex} className="cd-module-accordion">
                          <div className="cd-module-header" onClick={() => toggleModule(modIndex)}>
                            <div className="mod-title">
                              <span className="mod-num">Module {modIndex + 1}</span>
                              <h4>{module.title}</h4>
                            </div>
                            {expandedModules[modIndex] ? <FiChevronUp /> : <FiChevronDown />}
                          </div>

                          {expandedModules[modIndex] && (
                            <div className="cd-module-items">
                              {module.items?.map((item) => {
                                let itemCompleted = isItemCompleted(item);

                                return (
                                  <button
                                    key={item._id}
                                    className={`cd-item-btn ${activeItem?._id === item._id ? 'active' : ''} ${itemCompleted ? 'completed' : ''}`}
                                    onClick={() => handleItemClick(modIndex, item)}
                                  >
                                    <div className="item-icon-col">
                                      {itemCompleted ? <FiCheckCircle className="text-success" /> : getItemIcon(item.type)}
                                    </div>
                                    <div className="item-info-col">
                                      <span className="item-title">{item.title}</span>
                                      {item.duration > 0 && <span className="item-dur"><FiClock /> {item.duration} mins</span>}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted p-4 text-center">No modules available</p>
                    )}
                  </div>
                </div>

                <div className="cd-content-area card">
                  {activeItem ? (
                    <>
                      {activeItem.type === 'video' && renderVideoPlayer()}
                      {activeItem.type === 'documentation' && renderDocumentation()}
                      {activeItem.type === 'assignment' && renderAssignmentUI()}
                      {activeItem.type === 'quiz' && renderQuizUI()}
                    </>
                  ) : (
                    <div className="content-placeholder">
                      <FiPlayCircle size={64} className="text-muted mb-4" />
                      <h3>Welcome exactly to the course!</h3>
                      <p>Select an item from the modules list to begin.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'forum' && <CourseForum courseId={id} />}
            {activeTab === 'analytics' && <CourseAnalytics courseId={id} />}
          </>
        ) : (
          <div className="cd-locked-preview">
            <FiLock size={48} className="text-muted mb-4 mx-auto block" />
            <h2 className="text-center mb-5">Course Curriculum</h2>
            <div className="preview-modules-grid">
              {currentCourse.modules?.map((mod, i) => (
                <div key={mod._id || i} className="preview-mod-card card">
                  <div className="mod-num">Module {i + 1}</div>
                  <h4>{mod.title}</h4>
                  <p className="text-muted">{mod.items?.length || 0} learning items</p>
                </div>
              ))}
            </div>
            {currentCourse.whatYouWillLearn?.length > 0 && currentCourse.whatYouWillLearn[0] !== "" && (
              <div style={{ marginTop: '48px', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto', padding: '32px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color-hover)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)', fontSize: '1.4rem', fontWeight: 700 }}>What you'll learn</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px 32px' }}>
                  {currentCourse.whatYouWillLearn.map((point, i) => point && (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0' }}>
                      <FiCheckCircle size={18} style={{ color: 'var(--success)', marginTop: '3px', flexShrink: 0 }} />
                      <span style={{ lineHeight: '1.6', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* REVIEWS SECTION */}
        <div className="cd-reviews-section mt-5 pt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
          {isInstructor && (
            <>
              <h2 className="mb-4">Reviews</h2>
              <div className="reviews-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '40px' }}>
                {currentCourse.reviews && currentCourse.reviews.length > 0 ? (
                  currentCourse.reviews.map((review, idx) => (
                    <div key={review._id || idx} className="review-card card" style={{ padding: '20px' }}>
                      <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '40px', height: '40px', background: 'var(--accent-gradient)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                            {review.user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span style={{ fontWeight: '600' }}>{review.user?.name || 'Anonymous User'}</span>
                        </div>
                        <div className="rating-stars" style={{ color: 'var(--warning)' }}>
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} fill={i < review.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No reviews yet.</p>
                )}
              </div>
            </>
          )}

          {isEnrolled && !userHasReviewed && (
            <div style={{ marginTop: '40px', padding: '32px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color-hover)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ marginBottom: '24px', fontSize: '1.3rem', fontWeight: 700 }}>Leave a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', alignItems: 'start' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>Rating</label>
                    <select
                      className="form-select"
                      value={reviewRating}
                      onChange={e => setReviewRating(Number(e.target.value))}
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color-hover)' }}
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Good</option>
                      <option value="2">2 - Fair</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ marginBottom: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>Comment</label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      placeholder="Tell others what you thought of this course..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      required
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color-hover)' }}
                    ></textarea>
                  </div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview} style={{ padding: '12px 36px' }}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
