import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) return setLoading(false);
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password,rollNumber) => {
    const { data } = await api.post('/auth/register', { name, email, password ,rollNumber});
    // localStorage.setItem('token', data.token);
    // setUser(data.user);
    return data.user;
  };
  const verifyOtp =async(email,otp)=>{
     const { data } = await api.post('/auth/verify-otp', {
      email,
      otp,
    });
     localStorage.setItem('token', data.token);
    setUser(data.user);

    return data;
  }
  const resendOtp = async (email) => {
    const { data } = await api.post('/auth/resend-otp', {
      email,
    });

    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register,verifyOtp,resendOtp, logout }}>{children}</AuthContext.Provider>;
}
