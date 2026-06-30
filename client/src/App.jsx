import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Activity, LogOut, MessageSquare, Sun, Moon, BookOpen, Target } from 'lucide-react';
import { ThemeContext } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Support from './pages/Support';
import ChatSupport from './pages/ChatSupport';
import CopingStories from './pages/CopingStories';
import AbstinenceTracker from './pages/AbstinenceTracker';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Activity color="var(--primary-color)" size={28} />
        UniMind
      </div>
      <div className="nav-links">
        {user.role === 'student' ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/chat" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MessageSquare size={16} /> AI Support
            </Link>
            <Link to="/coping-stories" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={16} /> Stories
            </Link>
            <Link to="/tracker" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Target size={16} /> Tracker
            </Link>
            <Link to="/support">Support & Wellness</Link>
          </>
        ) : (
          <Link to="/">Admin Dashboard</Link>
        )}
        <button onClick={toggleTheme} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%' }} aria-label="Toggle Dark Mode">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={logout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'counsellor' ? <AdminDashboard /> : <StudentDashboard />}
            </ProtectedRoute>
          } />

          <Route path="/support" element={
            <ProtectedRoute role="student">
              <Support />
            </ProtectedRoute>
          } />
          
          <Route path="/chat" element={
            <ProtectedRoute role="student">
              <ChatSupport />
            </ProtectedRoute>
          } />

          <Route path="/coping-stories" element={
            <ProtectedRoute role="student">
              <CopingStories />
            </ProtectedRoute>
          } />

          <Route path="/tracker" element={
            <ProtectedRoute role="student">
              <AbstinenceTracker />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
