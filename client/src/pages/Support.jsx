import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldAlert, HeartPulse, Phone, MessageSquare, ArrowRight, ArrowLeft, CheckCircle, Activity, BookOpen, Shield } from 'lucide-react';
import { COPING_MECHANISMS } from '../data/copingMechanisms';

const CATEGORIES = [
  { id: 'depression', label: 'Depression & Wellbeing', themeColor: '#4fd1c5', bg: 'linear-gradient(135deg, #f4f9f9 0%, #e6f2f2 100%)' },
  { id: 'trauma', label: 'Trauma', themeColor: '#8fbc8f', bg: 'linear-gradient(135deg, #fdfbfb 0%, #f0f4f0 100%)' },
  { id: 'substance', label: 'Substance Use', themeColor: '#708090', bg: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' },
  { id: 'porn_addiction', label: 'Porn Addiction', themeColor: '#b19cd9', bg: 'linear-gradient(135deg, #fcfaff 0%, #f3eeff 100%)' },
  { id: 'self_love', label: 'Self-Love & Esteem', themeColor: '#fda085', bg: 'linear-gradient(135deg, #fffcf9 0%, #fff3e6 100%)' },
  { id: 'other', label: 'Other Topics', themeColor: '#667eea', bg: 'linear-gradient(120deg, #f8faff 0%, #edf2f7 100%)' },
];

const Support = () => {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || 'depression';
  
  const [activeCategory, setActiveCategory] = useState(
    CATEGORIES.find(c => c.id === initialTopic) || CATEGORIES[0]
  );
  
  // Interactive Exercise State
  const [activeExercise, setActiveExercise] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  useEffect(() => {
    const topicFromUrl = searchParams.get('topic');
    if (topicFromUrl) {
      const found = CATEGORIES.find(c => c.id === topicFromUrl);
      if (found) setActiveCategory(found);
    }
  }, [searchParams]);

  // Lock body scroll when in immersive full-screen mode
  useEffect(() => {
    if (activeExercise) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeExercise]);

  const handleStartExercise = (strategy) => {
    setActiveExercise(strategy);
    setCurrentStep(0);
    setExerciseCompleted(false);
  };

  const handleNextStep = () => {
    if (activeExercise && activeExercise.steps && currentStep < activeExercise.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setExerciseCompleted(true);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem', maxWidth: '1400px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <BookOpen size={36} color="var(--primary-color)" /> Wellness Center
        </h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          A curated library of interactive, evidence-based coping mechanisms and exercises. 
          Select a category below to explore.
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-full)',
              background: activeCategory.id === category.id ? category.themeColor : 'var(--card-solid)',
              color: activeCategory.id === category.id ? 'white' : 'var(--text-secondary)',
              border: activeCategory.id === category.id ? 'none' : '1px solid #e2e8f0',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: activeCategory.id === category.id ? `0 4px 15px ${category.themeColor}66` : 'none',
              transition: 'all 0.2s'
            }}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Exercises Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        {COPING_MECHANISMS[activeCategory.id]?.map((strategy, idx) => (
          <button 
            key={idx} 
            className="coping-card" 
            onClick={() => handleStartExercise(strategy)}
            style={{ 
              padding: '2rem', 
              background: 'white', 
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${activeCategory.themeColor}33`, 
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>{strategy.icon}</div>
              <div style={{ background: `${activeCategory.themeColor}15`, color: activeCategory.themeColor, padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {strategy.exerciseType === 'breathing' ? 'Breathing' : 'Guided Exercise'}
              </div>
            </div>
            
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.3rem' }}>{strategy.title}</h3>
            <p style={{ fontSize: '1rem', margin: '0 0 2rem 0', lineHeight: '1.6', color: 'var(--text-secondary)', flex: 1 }}>{strategy.description}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: activeCategory.themeColor, fontSize: '0.95rem', fontWeight: '600', marginTop: 'auto' }}>
              {strategy.exerciseType === 'breathing' ? <Activity size={18} /> : <ArrowRight size={18} />} 
              Start Exercise
            </div>
          </button>
        ))}
      </div>

      {/* Emergency Contacts */}
      <div className="premium-glass-panel" style={{ padding: '2.5rem', background: 'var(--card-solid)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <ShieldAlert size={28} color="var(--mood-stressed)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Emergency Contacts</h2>
        </div>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          If you are in immediate distress, please reach out to professional help immediately. You are not alone.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <a href="tel:988" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(229, 62, 62, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(229, 62, 62, 0.2)', transition: 'transform 0.2s', color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform='scale(1)'}>
            <div style={{ background: 'var(--mood-stressed)', padding: '1rem', borderRadius: '50%', color: 'white' }}>
              <Phone size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--mood-stressed)', fontSize: '1.3rem' }}>988</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Suicide & Crisis Lifeline</div>
            </div>
          </a>

          <a href="sms:741741" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(102, 126, 234, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(102, 126, 234, 0.2)', transition: 'transform 0.2s', color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform='scale(1)'}>
            <div style={{ background: 'var(--secondary-color)', padding: '1rem', borderRadius: '50%', color: 'white' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--secondary-color)', fontSize: '1.3rem' }}>Text HOME to 741741</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Crisis Text Line</div>
            </div>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ background: '#cbd5e0', padding: '1rem', borderRadius: '50%', color: 'white' }}>
              <HeartPulse size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.3rem' }}>0800-UNI-CARE</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Campus Safety & Health</div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- IMMERSIVE EXERCISE OVERLAY ---------------- */}
      {activeExercise && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10000, 
          background: activeCategory.bg,
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.4s ease forwards'
        }}>
          {/* Minimalist Floating Header */}
          <div style={{ 
            position: 'absolute',
            top: 0, left: 0, right: 0,
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}>
            <button 
              onClick={() => setActiveExercise(null)} 
              style={{ 
              background: 'var(--card-solid)', 
              border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-md)', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform='translateY(0)'}}
            >
              <ArrowLeft size={18} /> Close Exercise
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            
            <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'slideUpFade 0.5s ease' }}>{activeExercise.icon}</div>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem', animation: 'slideUpFade 0.6s ease' }}>{activeExercise.title}</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '3rem', animation: 'slideUpFade 0.7s ease' }}>{activeExercise.description}</p>
              
              {!exerciseCompleted ? (
                <>
                  {/* Progress Indicator */}
                  {activeExercise.steps && activeExercise.exerciseType !== 'breathing' && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem', animation: 'fadeIn 1s ease' }}>
                      {activeExercise.steps.map((_, idx) => (
                        <div key={idx} style={{ 
                          width: idx === currentStep ? '24px' : '8px', 
                          height: '8px', 
                          borderRadius: '4px', 
                          background: idx === currentStep ? activeCategory.themeColor : 'rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease'
                        }} />
                      ))}
                    </div>
                  )}

                  <div className="premium-glass-panel" style={{ 
                    padding: '3rem', 
                    background: 'var(--card-solid)', 
                    borderRadius: '2rem', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                    minHeight: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    animation: 'scaleIn 0.5s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    
                    {/* Breathing specific animation */}
                    {activeExercise.exerciseType === 'breathing' ? (
                      <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="animate-breathe" style={{ 
                          position: 'absolute', 
                          width: '100%', 
                          height: '100%', 
                          borderRadius: '50%', 
                          background: `${activeCategory.themeColor}33`,
                        }} />
                        <div style={{ 
                          position: 'relative', 
                          zIndex: 2, 
                          color: activeCategory.themeColor, 
                          fontWeight: '600', 
                          fontSize: '1.2rem',
                          textAlign: 'center'
                        }}>
                          Breathe in...<br/>Breathe out...
                        </div>
                      </div>
                    ) : (
                      /* Guided Step Text */
                      <div key={currentStep} className="exercise-step-enter" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: '1.6', fontWeight: '500' }}>
                        {activeExercise.steps ? activeExercise.steps[currentStep] : activeExercise.description}
                      </div>
                    )}

                  </div>

                  <div style={{ marginTop: '3rem', animation: 'fadeIn 1s ease 0.5s both' }}>
                    {activeExercise.exerciseType === 'breathing' ? (
                      <button 
                        onClick={() => setExerciseCompleted(true)}
                        className="btn-primary"
                        style={{ background: activeCategory.themeColor, padding: '15px 40px', fontSize: '1.2rem', borderRadius: 'var(--radius-full)', boxShadow: `0 10px 20px ${activeCategory.themeColor}44` }}
                      >
                        I feel calmer
                      </button>
                    ) : (
                      <button 
                        onClick={handleNextStep}
                        className="btn-primary"
                        style={{ background: activeCategory.themeColor, padding: '15px 40px', fontSize: '1.2rem', borderRadius: 'var(--radius-full)', boxShadow: `0 10px 20px ${activeCategory.themeColor}44` }}
                      >
                        {currentStep < (activeExercise.steps?.length - 1) ? 'Next Step' : 'Finish Exercise'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Completion Screen */
                <div style={{ animation: 'scaleIn 0.5s ease', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CheckCircle size={80} color={activeCategory.themeColor} style={{ marginBottom: '1.5rem' }} />
                  <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Great job.</h3>
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>Taking time for yourself is a massive step forward. Your mind and body thank you.</p>
                  
                  <button 
                    onClick={() => setActiveExercise(null)}
                    className="btn-primary"
                    style={{ background: activeCategory.themeColor, padding: '15px 40px', fontSize: '1.2rem', borderRadius: 'var(--radius-full)', boxShadow: `0 10px 20px ${activeCategory.themeColor}44` }}
                  >
                    Return to Library
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Support;
