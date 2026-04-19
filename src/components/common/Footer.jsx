import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/logo.png" alt="EdStream" className="footer-logo-img" />
              <span className="footer-logo-text">
                <span className="logo-ed">Ed</span>
                <span className="logo-stream">Stream</span>
              </span>
            </Link>
            <p className="footer-desc">
              Empowering learners worldwide with free, quality education through curated YouTube courses.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-link"><FiGithub size={18} /></a>
              <a href="#" className="footer-social-link"><FiTwitter size={18} /></a>
              <a href="#" className="footer-social-link"><FiLinkedin size={18} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <Link to="/browse" className="footer-link">Browse Courses</Link>
            <Link to="/register" className="footer-link">Become an Instructor</Link>
            <Link to="/register" className="footer-link">Start Learning</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Categories</h4>
            <Link to="/browse?category=Web Development" className="footer-link">Web Development</Link>
            <Link to="/browse?category=Data Science" className="footer-link">Data Science</Link>
            <Link to="/browse?category=Machine Learning" className="footer-link">Machine Learning</Link>
            <Link to="/browse?category=UI/UX Design" className="footer-link">UI/UX Design</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Support</h4>
            <Link to="/" className="footer-link">Help Center</Link>
            <Link to="/" className="footer-link">Terms of Service</Link>
            <Link to="/" className="footer-link">Privacy Policy</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} EdStream. Made with <FiHeart className="footer-heart" size={14} /> for learners everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
