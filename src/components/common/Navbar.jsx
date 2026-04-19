import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiBookOpen, FiGrid, FiChevronDown } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'instructor': return '/instructor';
      case 'learner': return '/dashboard';
      default: return '/';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="EdStream" className="navbar-logo-img" />
          <span className="navbar-logo-text">
            <span className="logo-ed">Ed</span>
            <span className="logo-stream">Stream</span>
          </span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/browse" className={`nav-link ${location.pathname === '/browse' ? 'active' : ''}`}>Browse</Link>

          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className={`nav-link ${location.pathname.includes('dashboard') || location.pathname.includes('instructor') || location.pathname.includes('admin') ? 'active' : ''}`}>
                <FiGrid size={16} /> Dashboard
              </Link>

              <div className="nav-user-section" ref={dropdownRef}>
                <button className="nav-user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="nav-avatar">{getInitials(user?.name)}</div>
                  <span className="nav-user-name">{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown className={`nav-chevron ${dropdownOpen ? 'rotated' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      <p className="nav-dropdown-name">{user?.name}</p>
                      <span className="nav-dropdown-role badge badge-primary">{user?.role}</span>
                    </div>
                    <div className="nav-dropdown-divider" />
                    <Link to="/profile" className="nav-dropdown-item">
                      <FiUser size={16} /> Profile
                    </Link>
                    <Link to={getDashboardLink()} className="nav-dropdown-item">
                      <FiBookOpen size={16} /> Dashboard
                    </Link>
                    <div className="nav-dropdown-divider" />
                    <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="nav-auth-btns">
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
