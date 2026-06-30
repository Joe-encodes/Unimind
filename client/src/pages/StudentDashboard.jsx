import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Smile, Meh, Frown, AlertCircle, Heart, ShieldCheck, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MoodIcon = ({ mood, size = 24 }) => {
  switch(mood) {
    case 'Happy': return <Smile size={size} color="var(--mood-happy)" />;
    case 'Neutral': return <Meh size={size} color="var(--mood-neutral)" />;
    case 'Sad': return <Frown size={size} color="var(--mood-sad)" />;
    case 'Stressed': return <AlertCircle size={size} color="var(--mood-stressed)" />;
    default: return <Meh size={size} />;
  }
};

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [moods, setMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    fetchMoods();
  }, [user.id]);

  const fetchMoods = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/moods/${user.id}`);
      const data = await res.json();
      setMoods(data);
    } catch (err) {
      console.error('Failed to fetch moods', err);
    }
  };

  const handleLogMood = async (e) => {
    e.preventDefault();
    if (!selectedMood) return; // Prevent empty submission

    try {
      const res = await fetch('http://localhost:5000/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, mood: selectedMood, notes })
      });
      const data = await res.json();
      
      if (data.alert) {
        setShowAlert(true);
      }
      
      setSelectedMood(null);
      setNotes('');
      fetchMoods(); // Refresh history
    } catch (err) {
      console.error('Error logging mood', err);
    }
  };

  // Total logs logic if needed elsewhere, otherwise clean it up
  const hasMoods = moods.length > 0;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* 1. Hero / Profile Integration */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="animate-slide-up text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
          Welcome back, {user.name}
        </h1>
        <p className="animate-slide-up" style={{ fontSize: '1.2rem', animationDelay: '0.1s', marginBottom: '1.5rem' }}>
          "Every day is a fresh start. Take a deep breath and begin again."
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* 2. Redesigned Mood Logger */}
        <div className="premium-glass-panel animate-slide-up" style={{ padding: '2.5rem', animationDelay: '0.3s' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>How are you feeling?</h2>
          <p style={{ marginBottom: '2rem' }}>Log your mood to track your emotional journey.</p>
          
          <form onSubmit={handleLogMood}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {['Happy', 'Neutral', 'Sad', 'Stressed'].map(m => {
                const isSelected = selectedMood === m;
                return (
                  <div 
                    key={m}
                    onClick={() => setSelectedMood(m)}
                    className={isSelected ? 'animate-pulse-soft' : ''}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '1.5rem 1rem', 
                      borderRadius: 'var(--radius-lg)',
                      border: isSelected ? '2px solid var(--primary-color)' : '1px solid rgba(226, 232, 240, 0.6)',
                      background: isSelected ? 'linear-gradient(135deg, rgba(79,209,197,0.15) 0%, rgba(102,126,234,0.05) 100%)' : 'var(--card-solid)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      transform: isSelected ? 'scale(1.05) translateY(-5px)' : 'scale(1)',
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)'
                    }}
                  >
                    <MoodIcon mood={m} size={40} />
                    <span style={{ fontSize: '1rem', fontWeight: isSelected ? '600' : '500', color: isSelected ? 'var(--primary-hover)' : 'var(--text-primary)' }}>{m}</span>
                  </div>
                )
              })}
            </div>

            <div className="input-group">
              <label className="input-label" style={{ fontSize: '1rem' }}>Add some notes (Optional)</label>
              <textarea 
                className="input-field" 
                rows="3" 
                placeholder="What's been happening today?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ resize: 'none', borderRadius: 'var(--radius-md)' }}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', fontSize: '1.1rem', padding: '14px', opacity: selectedMood ? 1 : 0.6 }}
              disabled={!selectedMood}
            >
              Log My Mood
            </button>
          </form>
        </div>

        {/* 3. Mood History & Insights */}
        <div className="premium-glass-panel animate-slide-up" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', animationDelay: '0.4s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Recent Check-ins</h2>
            <Link to="/support" style={{ fontSize: '0.875rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', fontWeight: '500' }}>
              View insights <ChevronRight size={16} />
            </Link>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '450px', paddingRight: '0.5rem' }}>
            {moods.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0', background: 'rgba(255,255,255,0.4)', borderRadius: 'var(--radius-md)' }}>
                <Calendar size={48} color="#cbd5e0" style={{ margin: '0 auto 1rem' }} />
                <p>Your timeline is empty.</p>
                <p style={{ fontSize: '0.875rem' }}>Start logging your mood to see history.</p>
              </div>
            ) : (
              moods.slice(0, 5).map((m, idx) => (
                <div 
                  key={m.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.25rem', 
                    padding: '1.25rem', 
                    background: 'var(--card-solid)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid #edf2f7',
                    transition: 'transform 0.2s ease',
                    boxShadow: 'var(--shadow-sm)',
                    animation: `fadeIn 0.5s ease ${idx * 0.1}s forwards`,
                    opacity: 0,
                    transform: 'translateY(10px)'
                  }}
                >
                  <div style={{ padding: '0.75rem', background: 'var(--bg-color)', borderRadius: '50%' }}>
                    <MoodIcon mood={m.mood} size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{m.mood}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {new Date(m.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {m.notes && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', maxWidth: '35%', borderLeft: '2px solid #e2e8f0', paddingLeft: '1rem' }}>
                      "{m.notes.length > 40 ? m.notes.substring(0, 40) + '...' : m.notes}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Trust & Safety Signals */}
      <div className="animate-slide-up" style={{ marginTop: '4rem', textAlign: 'center', animationDelay: '0.5s' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-full)', border: 'var(--glass-border)', boxShadow: 'var(--shadow-sm)' }}>
          <ShieldCheck size={20} color="var(--primary-color)" />
          <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Your entries are encrypted, private, and strictly confidential.
          </span>
        </div>
      </div>

      {/* Crisis Alert Modal - Preserved logic, upgraded visuals */}
      {showAlert && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease' }}>
          <div className="premium-glass-panel" style={{ padding: '3.5rem', maxWidth: '550px', textAlign: 'center', background: 'var(--card-solid)' }}>
            <div style={{ background: 'rgba(229, 62, 62, 0.1)', width: '96px', height: '96px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Heart size={48} color="var(--mood-stressed)" className="animate-pulse-soft" />
            </div>
            <h2 style={{ color: 'var(--mood-stressed)', fontSize: '2rem', marginBottom: '1rem' }}>We're here for you</h2>
            <p style={{ marginBottom: '2.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Our system noticed you've been feeling down or stressed recently. It's completely okay to feel this way, but you don't have to go through it alone.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/support" className="btn-primary" onClick={() => setShowAlert(false)} style={{ flex: 1, textAlign: 'center', padding: '16px' }}>
                View Coping Strategies
              </Link>
              <button className="btn-secondary" onClick={() => setShowAlert(false)} style={{ flex: 0.5, padding: '16px' }}>
                Close
              </button>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
              A counsellor has been notified and may reach out to offer support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
