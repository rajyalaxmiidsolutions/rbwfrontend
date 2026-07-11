import { createContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rbw_token'));
  const [adminToken, setAdminToken] = useState(localStorage.getItem('rbw_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { data } = await getProfile();
          setUser(data);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const loginUser = (tokenValue, userData) => {
    localStorage.setItem('rbw_token', tokenValue);
    setToken(tokenValue);
    setUser(userData);
  };

  const loginAdmin = (tokenValue) => {
    localStorage.setItem('rbw_admin_token', tokenValue);
    setAdminToken(tokenValue);
  };

  const logout = () => {
    localStorage.removeItem('rbw_token');
    setToken(null);
    setUser(null);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('rbw_admin_token');
    setAdminToken(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, adminToken, loading,
      loginUser, loginAdmin, logout, logoutAdmin,
      setUser,
      isAuthenticated: !!token && !!user,
      isAdmin: !!adminToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
