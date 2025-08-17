import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await axios.get('/auth/profile');
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      
      const me = await axios.get('/auth/profile');
      setUser(me.data);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      const { data } = await axios.post('/auth/register', {
        name,
        email,
        password,
        role: 'CITIZEN',
      });
      if (data?.token) localStorage.setItem('token', data.token);
      const me = await axios.get('/auth/profile');
      setUser(me.data);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try { await axios.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    setUser(null);
  };

  const setUserAfterAuth = (data) => {
    if (data?.token) localStorage.setItem("token", data.token);
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      address: data.address,
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUserAfterAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
