import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiPlay, FiUsers, FiClock, FiStar, FiBookOpen,
  FiArrowLeft, FiCheck, FiX, FiSend, FiExternalLink
} from 'react-icons/fi';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, getYouTubeId } from '../utils/helpers';
import Loader from '../components/common/Loader';
import API from '../utils/api';
import { toast } from 'react-toastify';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCourse, fetchCourse, enrollInCourse, unenrollFromCourse, loading } = useCourses();
  const { user, isAuthenticated } = useAuth();
  const [activeLecture, setActiveLecture] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const course = currentCourse;
  const isEnrolled = course?.enrolledStudents?.some((s) => s._id === user?._id || s === user?._id);
  const isOwner = course?.instructor?._id === user?._id;

  useEffect(() => {
    fetchCourse(id);
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (course?.lectures?.length > 0 && !activeLecture) {
      setActiveLecture(course.lectures[0]);
    }
  }, [course]);

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/course/${id}`);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to enroll');
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await enrollInCourse(id);
      toast.success('Enrolled successfully!');
      fetchCourse(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
    setEnrolling(false);
  };

  const handleUnenroll = async () => {
    setEnrolling(true);
    try {
      await unenrollFromCourse(id);
      toast.success('Unenrolled successfully');
      fetchCourse(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unenroll');
    }
    setEnrolling(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await API.post(`/reviews/course/${id}`, {
        rating: reviewRating,
        comment: reviewText,
      });
      toast.success('Review added!');
      setReviewText('');
      setReviewRating(5);
      fetchReviews();
      fetchCourse(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    }
    setSubmittingReview(false);
  };

  if (loading || !course) return <Loader text="Loading course..." />;

  const videoId = activeLecture ? getYouTubeId(activeLecture.youtubeUrl) : null;

  return (
    <div className="course-detail-page page-enter">
      {/* Course Header */}
      <div className="cd-header">
        <div className="container">
          <button onClick={() => navigate(-1)} className="cd-back-btn">
            <FiArrowLeft /> Back
          </button>
          <div className="cd-header-content">
            <div className="cd-header-info">
              <span className="badge badge-primary">{course.category}</span>
              <h1 className="cd-title">{course.title}</h1>
              <p className="cd-desc">{course.description}</p>

              <div className="cd-meta">
                <div className="cd-meta-item">
                  <FiStar className="cd-meta-icon star" />
                  <span>{course.averageRating?.toFixed(1) || 'New'} ({course.totalReviews || 0} reviews)</span>
                </div>
                <div className="cd-meta-item">
                  <FiUsers className="cd-meta-icon" />
                  <span>{course.enrollmentCount || 0} students</span>
                </div>
                <div className="cd-meta-item">
                  <FiPlay className="cd-meta-icon" />
                  <span>{course.lectures?.length || 0} lectures</span>
                </div>
                <div className="cd-meta-item">
                  <FiClock className="cd-meta-icon" />
                  <span>Updated {formatDate(course.updatedAt)}</span>
                </div>
              </div>

              <div className="cd-instructor">
                <div className="cd-instructor-avatar">
                  {course.instructor?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="cd-instructor-label">Instructor</p>
                  <p className="cd-instructor-name">{course.instructor?.name}</p>
                </div>
              </div>

              {!isOwner && (
                <div className="cd-actions">
                  {isEnrolled ? (
                    <button onClick={handleUnenroll} className="btn btn-secondary" disabled={enrolling}>
                      <FiX /> Unenroll
                    </button>
                  ) : (
                    <button onClick={handleEnroll} className="btn btn-primary btn-lg" disabled={enrolling}>
                      {enrolling ? 'Enrolling...' : (<><FiBookOpen /> Enroll for Free</>)}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player & Lectures */}
      <div className="container cd-body">
        <div className="cd-main">
          {/* Video Player */}
          {activeLecture && videoId ? (
            <div className="cd-player-wrapper">
              <div className="cd-player">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title={activeLecture.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="cd-iframe"
                />
              </div>
              <div className="cd-player-info">
                <h3>{activeLecture.title}</h3>
                {activeLecture.duration && <span className="cd-duration">{activeLecture.duration}</span>}
                <a
                  href={activeLecture.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm cd-yt-link"
                >
                  <FiExternalLink /> Watch on YouTube
                </a>
              </div>
            </div>
          ) : (
            <div className="cd-no-video">
              <FiPlay size={48} />
              <p>Select a lecture to start watching</p>
            </div>
          )}

          {/* Reviews Section */}
          <div className="cd-reviews">
            <h3 className="cd-section-title">Reviews ({reviews.length})</h3>

            {isEnrolled && user?.role === 'learner' && (
              <form className="cd-review-form" onSubmit={handleReviewSubmit}>
                <div className="cd-rating-select">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`cd-star-btn ${star <= reviewRating ? 'active' : ''}`}
                      onClick={() => setReviewRating(star)}
                    >
                      <FiStar />
                    </button>
                  ))}
                </div>
                <div className="cd-review-input-row">
                  <input
                    type="text"
                    placeholder="Write a review..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="form-input"
                  />
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    <FiSend />
                  </button>
                </div>
              </form>
            )}

            {reviews.length > 0 ? (
              <div className="cd-reviews-list">
                {reviews.map((review) => (
                  <div key={review._id} className="cd-review-item">
                    <div className="cd-review-header">
                      <div className="cd-review-user">
                        <div className="cd-review-avatar">
                          {review.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="cd-review-name">{review.user?.name}</p>
                          <p className="cd-review-date">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="cd-review-stars">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={i < review.rating ? 'star-filled' : 'star-empty'} size={14} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="cd-review-comment">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="cd-no-reviews">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

        {/* Lectures Sidebar */}
        <div className="cd-sidebar">
          <div className="cd-lectures-panel">
            <h3 className="cd-lectures-title">
              <FiBookOpen /> Course Content
            </h3>
            <p className="cd-lectures-count">{course.lectures?.length || 0} lectures</p>

            <div className="cd-lectures-list">
              {course.lectures
                ?.sort((a, b) => a.order - b.order)
                .map((lecture, index) => (
                  <button
                    key={lecture._id || index}
                    className={`cd-lecture-item ${activeLecture?._id === lecture._id || activeLecture?.order === lecture.order ? 'active' : ''}`}
                    onClick={() => setActiveLecture(lecture)}
                  >
                    <span className="cd-lecture-number">{index + 1}</span>
                    <div className="cd-lecture-info">
                      <p className="cd-lecture-name">{lecture.title}</p>
                      {lecture.duration && <span className="cd-lecture-dur">{lecture.duration}</span>}
                    </div>
                    <FiPlay className="cd-lecture-play" size={14} />
                  </button>
                ))}
            </div>
          </div>

          {course.tags?.length > 0 && (
            <div className="cd-tags-panel">
              <h4>Tags</h4>
              <div className="cd-tags">
                {course.tags.map((tag, i) => (
                  <span key={i} className="badge badge-info">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
