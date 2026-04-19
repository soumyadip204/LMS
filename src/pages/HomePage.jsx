import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPlay, FiUsers, FiBookOpen, FiAward, FiSearch } from 'react-icons/fi';
import CourseCard from '../components/course/CourseCard';
import { useCourses } from '../context/CourseContext';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';
import './HomePage.css';

const HomePage = () => {
  const { courses, fetchCourses, loading } = useCourses();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses({ limit: 8 });
  }, [fetchCourses]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient-orb hero-orb-1" />
          <div className="hero-gradient-orb hero-orb-2" />
          <div className="hero-gradient-orb hero-orb-3" />
          <div className="hero-grid-pattern" />
        </div>

        <div className="container hero-content">
          <div className="hero-text animate-fade-in">
            <div className="hero-badge">
              <FiPlay size={14} /> Free Learning Platform
            </div>
            <h1 className="hero-title">
              Learn Without <br />
              <span className="hero-title-accent">Boundaries</span>
            </h1>
            <p className="hero-desc">
              Access curated YouTube courses for free. Enroll, learn, and grow
              with expert instructors across technology & design.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <FiSearch className="hero-search-icon" />
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
                id="hero-search"
              />
              <button type="submit" className="btn btn-primary hero-search-btn">
                Search
              </button>
            </form>

            <div className="hero-stats">
              <div className="hero-stat">
                <FiBookOpen className="hero-stat-icon" />
                <div>
                  <span className="hero-stat-number">100+</span>
                  <span className="hero-stat-label">Courses</span>
                </div>
              </div>
              <div className="hero-stat">
                <FiUsers className="hero-stat-icon" />
                <div>
                  <span className="hero-stat-number">5K+</span>
                  <span className="hero-stat-label">Learners</span>
                </div>
              </div>
              <div className="hero-stat">
                <FiAward className="hero-stat-icon" />
                <div>
                  <span className="hero-stat-number">50+</span>
                  <span className="hero-stat-label">Instructors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories-section">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <p className="section-subtitle">Explore courses across trending tech domains</p>

          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/browse?category=${encodeURIComponent(cat)}`}
                className="category-card"
              >
                <span className="category-icon">{CATEGORY_ICONS[cat]}</span>
                <span className="category-name">{cat}</span>
                <FiArrowRight className="category-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="section-subtitle">Handpicked courses to get you started</p>
            </div>
            <Link to="/browse" className="btn btn-secondary">
              View All <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="courses-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="course-skeleton card">
                  <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                  <div style={{ padding: '16px' }}>
                    <div className="skeleton" style={{ height: '20px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '14px', width: '70%', marginBottom: '16px' }} />
                    <div className="skeleton" style={{ height: '14px', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="courses-grid">
              {courses.slice(0, 8).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiBookOpen size={48} />
              <h3>No courses yet</h3>
              <p>Be the first instructor to create a course!</p>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg-decor" />
            <h2 className="cta-title">Ready to Share Your Knowledge?</h2>
            <p className="cta-desc">
              Join as an instructor and create courses that reach learners worldwide. It's completely free.
            </p>
            <div className="cta-btns">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Teaching <FiArrowRight />
              </Link>
              <Link to="/browse" className="btn btn-secondary btn-lg">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
