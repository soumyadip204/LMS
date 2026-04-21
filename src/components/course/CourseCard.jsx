import { Link } from 'react-router-dom';
import { FiUsers, FiPlay, FiStar } from 'react-icons/fi';
import { truncateText, getYouTubeThumbnail } from '../../utils/helpers';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const thumbnail =
    course.thumbnail ||
    (() => {
      // Find the first video item to pull its youtube thumbnail
      for (const module of course.modules || []) {
        for (const item of module.items || []) {
          if (item.type === 'video' && item.url) return getYouTubeThumbnail(item.url);
        }
      }
      return null;
    })();

  return (
    <Link to={`/course/${course._id}`} className="course-card card">
      <div className="course-card-img-wrapper">
        {thumbnail ? (
          <img src={thumbnail} alt={course.title} className="course-card-img" />
        ) : (
          <div className="course-card-placeholder">
            <FiPlay size={32} />
          </div>
        )}
        <div className="course-card-overlay">
          <span className="badge badge-primary">{course.category}</span>
        </div>
        {course.modules && (
          <span className="course-card-lectures-count">
            <FiPlay size={12} /> {course.modules.length} modules
          </span>
        )}
      </div>

      <div className="course-card-body">
        <h3 className="course-card-title">{truncateText(course.title, 55)}</h3>
        <p className="course-card-desc">{truncateText(course.description, 80)}</p>

        <div className="course-card-meta">
          <div className="course-card-instructor">
            <div className="course-card-avatar">
              {course.instructor?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span>{course.instructor?.name || 'Unknown'}</span>
          </div>
        </div>

        <div className="course-card-footer">
          <div className="course-card-rating">
            <FiStar className="star-icon" />
            <span>{course.averageRating?.toFixed(1) || 'New'}</span>
            {course.totalReviews > 0 && (
              <span className="review-count">({course.totalReviews})</span>
            )}
          </div>
          <div className="course-card-students">
            <FiUsers size={14} />
            <span>{course.enrollmentCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
