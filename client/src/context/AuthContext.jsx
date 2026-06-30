import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for user simulation session
    const storedUser = localStorage.getItem('mentalHealthUser');
    const storedToken = localStorage.getItem('mentalHealthToken');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('mentalHealthUser', JSON.stringify(userData));
    if (userToken) {
      localStorage.setItem('mentalHealthToken', userToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mentalHealthUser');
    localStorage.removeItem('mentalHealthToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
