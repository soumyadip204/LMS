import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('edstream_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Load user from token on mount
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('edstream_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await API.get('/auth/me');
      setUser(res.data.user);
      setToken(savedToken);
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('edstream_token');
      localStorage.removeItem('edstream_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Register
  const register = async (name, email, password, role = 'learner') => {
    const res = await API.post('/auth/register', { name, email, password, role });
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('edstream_token', newToken);
    localStorage.setItem('edstream_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return res.data;
  };

  // Login
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('edstream_token', newToken);
    localStorage.setItem('edstream_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('edstream_token');
    localStorage.removeItem('edstream_user');
    setToken(null);
    setUser(null);
  };

  // Update profile
  const updateProfile = async (data) => {
    const res = await API.put('/users/profile', data);
    setUser(res.data.user);
    return res.data;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    loadUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
