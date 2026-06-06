import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loginUser,
  sendOtp,
  verifyOtp as verifyOtpService,
  resendOtp as resendOtpService,
  logoutUser,
} from '../services/authService';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const saveSession = (data) => {
    const token = data.accessToken || data.token;
    if (token) {
      setAuthToken(token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    if (data.user) {
      localStorage.setItem('freshMartUser', JSON.stringify(data.user));
      setUser(data.user);
    }
  };

  const clearSession = async () => {
    setAuthToken(null);
    setUser(null);
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('freshMartUser');
  };

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    saveSession(response.data);
    return response.data;
  };

  const register = async (formData) => {
    const response = await sendOtp(formData);
    return response.data;
  };

  const verifyOtp = async (payload) => {
    const response = await verifyOtpService(payload);
    saveSession(response.data);
    return response.data;
  };

  const resendOtp = async (payload) => {
    const response = await resendOtpService(payload);
    return response.data;
  };

  const logout = async () => {
    await logoutUser();
    await clearSession();
    navigate('/login');
  };

 

  useEffect(() => {
    const initSession = async () => {
       const storedUser = localStorage.getItem('freshMartUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

     setLoading(false);
    };

    initSession();
  }, []);

  useEffect(() => {
    if (authToken) {
      api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
    }
  }, [authToken]);

 useEffect(() => {
  const interceptor = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await clearSession();
        navigate('/login');
      }

      return Promise.reject(error);
    }
  );

  return () => {
    api.interceptors.response.eject(interceptor);
  };
}, [navigate]);

  const value = useMemo(
    () => ({ user, loading, login, register, verifyOtp, resendOtp, logout, setUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
