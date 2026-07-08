import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export const AuthContext = createContext();

// #18 Token Storage: sessionStorage is used instead of localStorage.
// sessionStorage clears automatically when the browser tab/window is closed,
// which is critical on shared devices (university computer labs).
// Tokens are still accessible to JS on the page (same as localStorage),
// but do not persist across sessions.
const SESSION_USER_KEY = 'mentalHealthUser';
const SESSION_TOKEN_KEY = 'mentalHealthToken';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from sessionStorage
    const storedUser = sessionStorage.getItem(SESSION_USER_KEY);
    const storedToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);

    // Listen to Supabase OAuth / Sign In changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        try {
          const res = await fetch('/api/auth/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: session.access_token })
          });
          const data = await res.json();
          if (res.ok) {
            login(data.user, data.token);
          }
        } catch (err) {
          // Intentionally silent — user will stay on login page if Google sync fails
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
    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(userData));
    if (userToken) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, userToken);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem(SESSION_USER_KEY);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    await supabase.auth.signOut().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
