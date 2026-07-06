import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, Flame, Trophy, Calendar, CheckCircle, XCircle, X, Heart, Brain, Pill, ArrowLeft } from 'lucide-react';
import Confetti from 'react-confetti';

// Theme configurations for the two different trackers
const THEMES = {
  porn: {
    primary: '#6b46c1', // Deep Purple
    primaryLight: 'rgba(107, 70, 193, 0.1)',
    primaryHover: '#553c9a',
    bgGradient: 'linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%)',
    icon: <Brain size={32} />,
    title: 'Porn Addiction Recovery',
    subtitle: 'Rewiring your brain for real connection and focus.'
  },
  substance: {
    primary: '#2c5282', // Dark Blue/Slate
    primaryLight: 'rgba(44, 82, 130, 0.1)',
    primaryHover: '#2a4365',
    bgGradient: 'linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%)',
    icon: <Pill size={32} />,
    title: 'Substance Use Recovery',
    subtitle: 'Building a clear, healthy, and resilient life.'
  }
};

const AbstinenceTracker = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection state
  const [selectedChallenge, setSelectedChallenge] = useState(null); // 'porn' or 'substance'

  // Modals state
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCompassion, setShowCompassion] = useState(false);
  
  // Window size for Confetti
  const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);
  const fetchLogs = async () => {
    try {
      const response = await fetch(`/api/tracker/${user.id}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const logDay = async (status) => {
    try {
      const response = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status, challengeType: selectedChallenge })
      });
      
      if (response.ok) {
        const result = await response.json();
        setLogs([result.log, ...logs].sort((a, b) => new Date(b.date) - new Date(a.date)));
        
        if (status === 'clean') {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 5000); // Hide after 5s
        } else {
          setShowCompassion(true);
        }
      }
    } catch (error) {
      console.error('Error logging day:', error);
    }
  };

  // Filter logs for the currently selected challenge
  const activeLogs = logs.filter(log => log.challengeType === selectedChallenge);

  // Analytics Calculations based on activeLogs
  const calculateStreak = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const logMap = {};
    activeLogs.forEach(log => {
      const d = new Date(log.date);
      const dateKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      // Relapse overrides clean on the same day
      if (!logMap[dateKey] || log.status === 'relapse') {
        logMap[dateKey] = { status: log.status, date: log.date };
      }
    });

    const sortedDates = Object.keys(logMap).sort((a, b) => new Date(b) - new Date(a));
    
    // Max Streak
    sortedDates.reverse().forEach(date => {
      if (logMap[date]?.status === 'clean') {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    // Current Streak
    let checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dateKey = checkDate.getFullYear() + '-' + String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + String(checkDate.getDate()).padStart(2, '0');
      
      if (logMap[dateKey]?.status === 'clean') {
        currentStreak++;
      } else if (logMap[dateKey]?.status === 'relapse') {
        break; // streak broken
      } else if (i > 0 && currentStreak > 0) {
        break; // missed a day while on a streak
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { currentStreak, maxStreak, logMap };
  };

  const { currentStreak, maxStreak, logMap } = selectedChallenge ? calculateStreak() : { currentStreak: 0, maxStreak: 0, logMap: {} };

  const totalLoggedDays = Object.keys(logMap).length;
  const cleanDays = Object.values(logMap).filter(log => log?.status === 'clean').length;
  const successRate = totalLoggedDays === 0 ? 0 : Math.round((cleanDays / totalLoggedDays) * 100);

  // Calendar rendering
  const renderCalendar = () => {
    const days = [];
    let date = new Date();
    date.setDate(date.getDate() - 27); // start 28 days ago

    for (let i = 0; i < 28; i++) {
      const dateKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      const logData = logMap[dateKey];
      const status = logData?.status;
      const logDate = logData?.date ? new Date(logData.date) : null;
      
      let bgColor = 'var(--card-solid)';
      let borderColor = 'rgba(0,0,0,0.05)';
      if (status === 'clean') {
        bgColor = 'var(--mood-happy)';
        borderColor = 'var(--mood-happy)';
      } else if (status === 'relapse') {
        bgColor = 'var(--mood-stressed)';
        borderColor = 'var(--mood-stressed)';
      }

      const dayNumber = parseInt(dateKey.split('-')[2], 10);
      const timeStr = logDate ? logDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

      days.push(
        <div 
          key={dateKey} 
          style={{ 
            aspectRatio: '1', 
            background: bgColor, 
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: status ? 'white' : 'var(--text-secondary)',
            opacity: status ? 1 : 0.4,
            position: 'relative',
            padding: '4px'
          }}
          title={dateKey + (status ? ` - ${status}` : '')}
        >
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{dayNumber}</span>
          {timeStr && <span style={{ fontSize: '0.7rem', marginTop: '2px', opacity: 0.9 }}>{timeStr}</span>}
          {!timeStr && <span style={{ fontSize: '0.7rem', marginTop: '2px', opacity: 0.3 }}>--:--</span>}
        </div>
      );
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading Tracker...</div>;

  // ----------------------------------------------------------------------
  // VIEW 1: SELECTION SCREEN
  // ----------------------------------------------------------------------
  if (!selectedChallenge) {
    return (
      <div className="animate-fade-in" style={{ paddingBottom: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem', padding: '3rem 0' }}>
          <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Your Recovery Journey</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Select the path you are tracking today. Each space is uniquely designed to support you without judgment.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          
          {/* Porn Addiction Card */}
          <div 
            className="premium-glass-panel"
            onClick={() => setSelectedChallenge('porn')}
            style={{ 
              padding: '3rem 2rem', 
              textAlign: 'center', 
              cursor: 'pointer', 
              borderTop: `6px solid ${THEMES.porn.primary}`,
              background: 'var(--card-solid)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          >
            <div style={{ display: 'inline-flex', background: THEMES.porn.primaryLight, padding: '1.5rem', borderRadius: '50%', color: THEMES.porn.primary, marginBottom: '1.5rem' }}>
              {THEMES.porn.icon}
            </div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>{THEMES.porn.title}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{THEMES.porn.subtitle}</p>
          </div>

          {/* Substance Abuse Card */}
          <div 
            className="premium-glass-panel"
            onClick={() => setSelectedChallenge('substance')}
            style={{ 
              padding: '3rem 2rem', 
              textAlign: 'center', 
              cursor: 'pointer', 
              borderTop: `6px solid ${THEMES.substance.primary}`,
              background: 'var(--card-solid)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          >
            <div style={{ display: 'inline-flex', background: THEMES.substance.primaryLight, padding: '1.5rem', borderRadius: '50%', color: THEMES.substance.primary, marginBottom: '1.5rem' }}>
              {THEMES.substance.icon}
            </div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>{THEMES.substance.title}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{THEMES.substance.subtitle}</p>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW 2: TRACKER DASHBOARD
  // ----------------------------------------------------------------------
  const theme = THEMES[selectedChallenge];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
      {showCelebration && <Confetti width={windowDimensions.width} height={windowDimensions.height} style={{ zIndex: 10000 }} recycle={false} numberOfPieces={600} gravity={0.15} colors={[theme.primary, '#48bb78', '#38a169', '#f6e05e']} />}

      {/* Back Navigation */}
      <button 
        onClick={() => setSelectedChallenge(null)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem', fontWeight: '500', transition: 'color 0.2s' }}
        onMouseOver={(e) => e.currentTarget.style.color = theme.primary}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={18} /> Switch Journey
      </button>

      {/* Themed Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '3rem', background: theme.bgGradient, borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: 'var(--shadow-sm)' }}>
        <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', color: '#1a202c' }}>
          <span style={{ color: theme.primary }}>{theme.icon}</span> {theme.title}
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#4a5568', maxWidth: '600px', margin: '0 auto' }}>
          Every day is a new opportunity. Track your progress without judgment and celebrate every victory, no matter how small.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Current Streak */}
        <div className="premium-glass-panel animate-slide-up" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', animationDelay: '0s', background: 'var(--card-solid)' }}>
          <div style={{ background: theme.primaryLight, padding: '1rem', borderRadius: '50%', color: theme.primary }}>
            <Flame size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px', marginBottom: '0.25rem' }}>Current Streak</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1' }}>
              {currentStreak} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>days</span>
            </div>
          </div>
        </div>

        {/* Best Streak */}
        <div className="premium-glass-panel animate-slide-up" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', animationDelay: '0.1s', background: 'var(--card-solid)' }}>
          <div style={{ background: 'rgba(246, 211, 101, 0.15)', padding: '1rem', borderRadius: '50%', color: '#d69e2e' }}>
            <Trophy size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px', marginBottom: '0.25rem' }}>Best Streak</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1' }}>
              {maxStreak} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>days</span>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="premium-glass-panel animate-slide-up" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', animationDelay: '0.2s', background: 'var(--card-solid)' }}>
          <div style={{ background: 'rgba(72, 187, 120, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--mood-happy)' }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '1px', marginBottom: '0.25rem' }}>Success Rate</div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1' }}>
              {successRate}%
            </div>
          </div>
        </div>

      </div>

      {/* Action Zone */}
      <div className="premium-glass-panel" style={{ padding: '4rem 3rem', textAlign: 'center', marginBottom: '3rem', borderTop: `4px solid ${theme.primary}`, background: 'var(--card-solid)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>Today's Check-in</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Clean Day Button */}
          <button 
            onClick={() => logDay('clean')}
            style={{ 
              background: 'var(--mood-happy)', 
              color: 'white', 
              border: 'none', 
              padding: '1.5rem 3rem', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '1.2rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 25px rgba(72, 187, 120, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(72, 187, 120, 0.5)' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(72, 187, 120, 0.4)' }}
          >
            <CheckCircle size={24} /> Log Clean Day
          </button>

          {/* Relapse Day Button */}
          <button 
            onClick={() => logDay('relapse')}
            style={{ 
              background: 'transparent', 
              color: 'var(--mood-stressed)', 
              border: '2px solid var(--mood-stressed)', 
              padding: '1.5rem 3rem', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '1.2rem', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(229, 62, 62, 0.05)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <XCircle size={24} /> Log Relapse Day
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="premium-glass-panel" style={{ padding: '3rem', background: 'var(--card-solid)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Calendar size={24} color={theme.primary} />
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Recent History (Last 28 Days)</h2>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '1rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {renderCalendar()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--mood-happy)', borderRadius: '3px' }}></div> Clean</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--mood-stressed)', borderRadius: '3px' }}></div> Relapse</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--card-bg)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }}></div> Unlogged</div>
        </div>
      </div>


      {/* Celebratory Modal */}
      {showCelebration && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, animation: 'fadeIn 0.2s' }}>
          <div className="premium-glass-panel" style={{ padding: '4rem 3rem', textAlign: 'center', maxWidth: '450px', borderTop: '6px solid var(--mood-happy)', background: 'var(--card-solid)' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(72, 187, 120, 0.1)', padding: '1.5rem', borderRadius: '50%', color: 'var(--mood-happy)', marginBottom: '1.5rem', animation: 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <Flame size={56} />
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Incredible Job!</h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
              You're doing wonderfully. Every single clean day is a massive, profound victory for your brain and your future. Keep that fire burning!
            </p>
            <button 
              onClick={() => setShowCelebration(false)}
              style={{ background: 'var(--mood-happy)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: 'var(--radius-full)', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Compassionate Modal */}
      {showCompassion && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, animation: 'fadeIn 0.2s' }}>
          <div className="premium-glass-panel" style={{ padding: '4rem 3rem', textAlign: 'center', maxWidth: '450px', borderTop: '6px solid var(--mood-stressed)', background: 'var(--card-solid)' }}>
            <button 
              onClick={() => setShowCompassion(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={24} />
            </button>
            <div style={{ display: 'inline-flex', background: 'rgba(229, 62, 62, 0.1)', padding: '1.5rem', borderRadius: '50%', color: 'var(--mood-stressed)', marginBottom: '1.5rem', animation: 'scaleIn 0.5s' }}>
              <Heart size={56} />
            </div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Be Kind to Yourself.</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
              Every meaningful journey has setbacks. A relapse does not erase the progress you've made, the days you fought hard, or your inherent worth. 
              <br/><br/>
              Take a deep breath. Forgive yourself. Tomorrow is a new opportunity, and you are still moving forward.
            </p>
            <button 
              onClick={() => setShowCompassion(false)}
              style={{ 
                background: 'var(--bg-color)', 
                color: 'var(--text-primary)', 
                border: '1px solid rgba(0,0,0,0.1)', 
                padding: '1rem 2rem', 
                borderRadius: 'var(--radius-full)', 
                width: '100%', 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
            >
              I will try again tomorrow
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AbstinenceTracker;
