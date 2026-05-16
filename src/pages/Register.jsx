import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiUserPlus, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('learner');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      toast.error('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error('Password must contain at least one number');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error('Password must contain at least one special character');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created successfully! Welcome to EdStream!');
      if (role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-elements">
        <div className="auth-bg-circle auth-bg-circle-1" />
        <div className="auth-bg-circle auth-bg-circle-2" />
        <div className="auth-bg-circle auth-bg-circle-3" />
      </div>

      <div className="auth-card register-card animate-fade-in">
        <div className="auth-header">
          <h1 className="auth-title">Join EdStream</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="auth-input-wrapper">
                <FiUser className="auth-input-icon" />
                <input
                  type="text"
                  className="form-input auth-input"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="register-name"
                  autoComplete="off"
                  name="name-no-autofill"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="auth-input-wrapper">
                <FiMail className="auth-input-icon" />
                <input
                  type="email"
                  className="form-input auth-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="register-email"
                  autoComplete="off"
                  name="email-no-autofill"
                />
              </div>
            </div>
          </div>

          <div className="auth-role-selector">
            <label className="form-label">I want to</label>
            <div className="auth-role-options">
              <button
                type="button"
                className={`auth-role-btn ${role === 'learner' ? 'active' : ''}`}
                onClick={() => setRole('learner')}
              >
                <span className="auth-role-emoji">🎓</span>
                <span>Learn</span>
              </button>
              <button
                type="button"
                className={`auth-role-btn ${role === 'instructor' ? 'active' : ''}`}
                onClick={() => setRole('instructor')}
              >
                <span className="auth-role-emoji">👨‍🏫</span>
                <span>Teach</span>
              </button>
            </div>
          </div>

          <div className="auth-form-grid">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  type="password"
                  className="form-input auth-input"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="register-password"
                  autoComplete="new-password"
                  name="password-no-autofill"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <FiLock className="auth-input-icon" />
                <input
                  type="password"
                  className="form-input auth-input"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  id="register-confirm-password"
                  autoComplete="new-password"
                  name="confirm-password-no-autofill"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading} id="register-submit">
            {loading ? 'Creating account...' : (<><FiUserPlus /> Create Account</>)}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in <FiArrowRight size={14} /></Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
