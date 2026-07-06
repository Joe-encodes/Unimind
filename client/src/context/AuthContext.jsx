import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

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

    // Listen to Supabase OAuth / Sign In changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        try {
          const res = await fetch('http://localhost:5000/api/auth/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: session.access_token })
          });
          const data = await res.json();
          if (res.ok) {
            login(data.user, data.token);
          }
        } catch (err) {
          console.error('Failed to sync Google user with backend:', err);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('mentalHealthUser', JSON.stringify(userData));
    if (userToken) {
      localStorage.setItem('mentalHealthToken', userToken);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mentalHealthUser');
    localStorage.removeItem('mentalHealthToken');
    await supabase.auth.signOut().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

