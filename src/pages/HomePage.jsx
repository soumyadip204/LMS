import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight, FiPlay, FiUsers, FiBookOpen, FiAward, FiSearch,
  FiStar, FiTarget, FiEye, FiHeart, FiZap, FiGlobe, FiMessageCircle
} from 'react-icons/fi';
import CourseCard from '../components/course/CourseCard';
import { useCourses } from '../context/CourseContext';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import './HomePage.css';

const TECH_LOGOS = [
  { name: 'Bootstrap', src: 'https://cdn.simpleicons.org/bootstrap/7952B3' },
  { name: 'C++', src: 'https://cdn.simpleicons.org/cplusplus/00599C' },
  { name: 'Kotlin', src: 'https://cdn.simpleicons.org/kotlin/7F52FF' },
  { name: 'Docker', src: 'https://cdn.simpleicons.org/docker/2496ED' },
  { name: 'Figma', src: 'https://cdn.simpleicons.org/figma/F24E1E' },
  { name: 'Git', src: 'https://cdn.simpleicons.org/git/F05032' },
  { name: 'React', src: 'https://cdn.simpleicons.org/react/61DAFB' },
  { name: 'MongoDB', src: 'https://cdn.simpleicons.org/mongodb/47A248' },
  { name: 'Node.js', src: 'https://cdn.simpleicons.org/nodedotjs/339933' },
  { name: 'npm', src: 'https://cdn.simpleicons.org/npm/CB3837' },
  { name: 'Python', src: 'https://cdn.simpleicons.org/python/3776AB' },
  { name: 'Spring', src: 'https://cdn.simpleicons.org/spring/6DB33F' },
  { name: 'Swift', src: 'https://cdn.simpleicons.org/swift/F05138' },
  { name: 'TypeScript', src: 'https://cdn.simpleicons.org/typescript/3178C6' }
];

const CORE_VALUES = [
  { icon: <FiZap size={28} />, title: 'Innovation', desc: 'We embrace cutting-edge technology and creative teaching methods to keep learning fresh and engaging.' },
  { icon: <FiGlobe size={28} />, title: 'Accessibility', desc: 'Education should be free and available to everyone, regardless of location, background, or financial status.' },
  { icon: <FiHeart size={28} />, title: 'Community', desc: 'We foster a supportive network where learners and instructors collaborate, share, and grow together.' },
  { icon: <FiAward size={28} />, title: 'Excellence', desc: 'Every course is curated for quality. We set high standards to ensure real-world, actionable knowledge.' },
];

const HomePage = () => {
  const { courses, fetchCourses, loading } = useCourses();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetchCourses({ limit: 8 });
    fetchTestimonials();
  }, [fetchCourses]);

  const fetchTestimonials = async () => {
    try {
      const res = await API.get('/reviews/featured');
      setTestimonials(res.data.reviews || []);
    } catch (err) {
      console.error('Fetch testimonials error:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/register';
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'instructor') return '/instructor';
    return '/dashboard';
  };

  return (
    <div className="home-page">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="modern-grid"></div>
          <div className="hero-glow-point point-center"></div>

          {/* Floating Tech Logos */}
          {TECH_LOGOS.map((logo, i) => (
            <img
              key={logo.name}
              src={logo.src}
              alt={`${logo.name} logo`}
              title={logo.name}
              className={`tech-logo tech-logo-${i + 1}`}
              // Optional: Add loading="lazy" if these are further down the page
              loading="lazy"
            />
          ))}
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

      {/* ===== CATEGORIES ===== */}
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

      {/* ===== FEATURED COURSES ===== */}
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
              <Link to={getDashboardLink()} className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </section>

      {/* ===== OUR MISSION ===== */}
      <section className="section about-section">
        <div className="container">
          <div className="about-row">
            <div className="about-image-wrapper">
              <img src="/mission.png" alt="Our Mission" className="about-image" />
              <div className="about-image-glow" />
            </div>
            <div className="about-text">
              <span className="about-label"><FiTarget size={16} /> Our Mission</span>
              <h2 className="about-heading">Democratizing Education for Everyone</h2>
              <p className="about-desc">
                We believe that world-class education shouldn't come with a price tag. EdStream's mission is to
                break down barriers by curating the best free learning content from across the internet and
                presenting it in a structured, engaging format that empowers learners of all backgrounds to
                achieve their goals.
              </p>
              <p className="about-desc">
                From first-time coders to seasoned professionals looking to upskill — everyone deserves access
                to knowledge that can transform their careers and lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OUR VISION ===== */}
      <section className="section about-section">
        <div className="container">
          <div className="about-row about-row-reverse">
            <div className="about-image-wrapper">
              <img src="/vision.png" alt="Our Vision" className="about-image" />
              <div className="about-image-glow" />
            </div>
            <div className="about-text">
              <span className="about-label"><FiEye size={16} /> Our Vision</span>
              <h2 className="about-heading">Building the Future of Learning</h2>
              <p className="about-desc">
                We envision a world where every person has the tools and opportunity to learn anything,
                anywhere, at any time. EdStream aims to become the go-to platform for free, structured online
                education — powered by community-driven content and cutting-edge technology.
              </p>
              <p className="about-desc">
                By 2030, we aim to serve 10 million learners globally, partnering with educators and
                institutions to make quality learning universally accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CORE VALUES ===== */}
      <section className="section values-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Core Values That Define Us</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>The principles that guide everything we build</p>

          <div className="values-grid">
            {CORE_VALUES.map((val, i) => (
              <div key={i} className="value-card">
                <div className="value-icon">{val.icon}</div>
                <h3 className="value-title">{val.title}</h3>
                <p className="value-desc">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="section testimonials-section">
          <div className="container">
            <h2 className="section-title" style={{ textAlign: 'center' }}>What Our Students Say</h2>
            <p className="section-subtitle" style={{ textAlign: 'center' }}>Real feedback from real learners</p>

            <div className="testimonials-grid">
              {testimonials.map((review, i) => (
                <div key={review._id || i} className="testimonial-card">
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, si) => (
                      <FiStar key={si} size={16} fill={si < review.rating ? '#fbbf24' : 'none'} color="#fbbf24" />
                    ))}
                  </div>
                  <p className="testimonial-text">"{review.comment}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">
                      {review.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span className="testimonial-name">{review.user?.name || 'Anonymous'}</span>
                      {review.course?.title && (
                        <span className="testimonial-course">{review.course.title}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CONTACT CTA ===== */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg-decor" />
            <FiMessageCircle size={48} className="cta-icon" />
            <h2 className="cta-title">Have Questions? Get in Touch</h2>
            <p className="cta-desc">
              Whether you have feedback, partnership inquiries, or just want to say hello — we'd love to hear from you.
            </p>
            <div className="cta-btns">
              <Link to="/contact" className="btn btn-primary btn-lg">
                Contact Us <FiArrowRight />
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
