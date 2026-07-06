import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, ShieldCheck, HeartPulse, Phone, Info, ShieldAlert, ArrowLeft, Lightbulb, X, ArrowRight, BookOpen } from 'lucide-react';

const TOPICS = [
  { id: 'depression', label: 'Depression & Wellbeing', icon: '🌧️', themeColor: '#4fd1c5', backgroundGradient: 'linear-gradient(135deg, #f4f9f9 0%, #e6f2f2 100%)', initialMessage: "I'm so glad you're here. Dealing with heavy emotions can be exhausting, and it takes courage to reach out. I'm here to listen without judgment. How are you feeling in this moment?" },
  { id: 'trauma', label: 'Trauma', icon: '🫂', themeColor: '#8fbc8f', backgroundGradient: 'linear-gradient(135deg, #fdfbfb 0%, #f0f4f0 100%)', initialMessage: "I'm here for you, and this is a safe space. It's incredibly brave to acknowledge what you've been through. Take your time, and share only what you feel comfortable with. How can I support you today?" },
  { id: 'substance', label: 'Substance Use', icon: '🛑', themeColor: '#708090', backgroundGradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', initialMessage: "You've taken a really important step by being here. I want you to know this is a completely judgment-free zone. How are things going, and what's on your mind right now?" },
  { id: 'porn_addiction', label: 'Porn Addiction', icon: '🧠', themeColor: '#b19cd9', backgroundGradient: 'linear-gradient(135deg, #fcfaff 0%, #f3eeff 100%)', initialMessage: "It takes a lot of strength to talk about this. Please know you are not alone, and many people navigate this challenge. I'm here to listen and support you without any judgment. How are you feeling about it today?" },
  { id: 'self_love', label: 'Self-Love & Esteem', icon: '✨', themeColor: '#fda085', backgroundGradient: 'linear-gradient(135deg, #fffcf9 0%, #fff3e6 100%)', initialMessage: "You deserve care and compassion, especially from yourself. Sometimes that's the hardest part. I'd love to help you explore those feelings. What’s one thing that’s been difficult to accept lately?" },
  { id: 'other', label: 'Other', icon: '💭', themeColor: '#667eea', backgroundGradient: 'linear-gradient(120deg, #f8faff 0%, #edf2f7 100%)', initialMessage: "I'm here to support you with whatever is on your mind. This is a safe, confidential space. What would you like to talk about today?" },
];

const ChatSupport = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (selectedTopic) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedTopic]);

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setMessages([
      {
        id: Date.now(),
        text: topic.initialMessage,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setMessages([]);
    setShowEmergencyModal(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          topic: selectedTopic.id 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: data.reply,
          sender: 'ai',
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please make sure the server is running and the API key is configured.",
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRequestCopingStrategies = () => {
    const userMsg = {
      id: Date.now(),
      text: "Can you show me some coping strategies?",
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I have an entire library of guided exercises and coping strategies tailored for what you're dealing with. Let's head over to the Wellness Center where you can explore them in a dedicated space.",
        sender: 'ai',
        timestamp: new Date(),
        isWellnessLink: true
      }]);
    }, 1500);
  };

  const handleRequestStories = () => {
    const userMsg = {
      id: Date.now(),
      text: "Can I read some success stories?",
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Of course. Hearing from others who have walked a similar path can be incredibly validating and inspiring. Here are some real stories from people who have faced similar challenges.",
        sender: 'ai',
        timestamp: new Date(),
        isStoryLink: true
      }]);
    }, 1500);
  };

  const renderEmergencyResources = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <a href="tel:988" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(229, 62, 62, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(229, 62, 62, 0.2)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform='scale(1)'}>
        <div style={{ background: 'var(--mood-stressed)', padding: '0.75rem', borderRadius: '50%', color: 'white' }}>
          <Phone size={20} />
        </div>
        <div>
          <div style={{ fontWeight: '700', color: 'var(--mood-stressed)', fontSize: '1.1rem' }}>988</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Suicide & Crisis Lifeline</div>
        </div>
      </a>

      <a href="sms:741741" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(102, 126, 234, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(102, 126, 234, 0.2)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform='scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform='scale(1)'}>
        <div style={{ background: 'var(--secondary-color)', padding: '0.75rem', borderRadius: '50%', color: 'white' }}>
          <MessageSquare size={20} />
        </div>
        <div>
          <div style={{ fontWeight: '700', color: 'var(--secondary-color)', fontSize: '1.1rem' }}>Text HOME to 741741</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Crisis Text Line</div>
        </div>
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--card-solid)', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
        <div style={{ background: '#cbd5e0', padding: '0.75rem', borderRadius: '50%', color: 'white' }}>
          <HeartPulse size={20} />
        </div>
        <div>
          <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.1rem' }}>0800-UNI-CARE</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Campus Safety & Health</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={!selectedTopic ? { paddingBottom: '2rem', maxWidth: '1400px', margin: '0 auto' } : {}}>
      
      {/* ---------------- STATE 1: TOPIC SELECTION (Windowed Mode) ---------------- */}
      {!selectedTopic && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <MessageSquare size={36} color="var(--primary-color)" /> AI Support Space
            </h1>
            <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              A private, empathetic, and judgment-free zone. 
              I'm here to listen whenever you need to talk.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
            
            <div className="premium-glass-panel" style={{ height: '75vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Info size={20} color="var(--secondary-color)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  This is an AI companion designed for emotional support, not a licensed therapist.
                </span>
              </div>

              <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', overflowY: 'auto' }}>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>What would you like to talk about today?</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%', maxWidth: '800px' }}>
                  {TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleSelectTopic(topic)}
                      style={{
                        padding: '1.5rem',
                        background: 'var(--card-solid)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1.05rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = topic.themeColor; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>{topic.icon}</span>
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Resources Sidebar (Visible in Topic Selection only) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="premium-glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--mood-stressed)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldAlert size={24} color="var(--mood-stressed)" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Need Immediate Help?</h3>
                </div>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  If you or someone you know is in crisis, please don't wait. Reach out to these free, confidential resources available 24/7.
                </p>
                {renderEmergencyResources()}
              </div>

              <div className="premium-glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <ShieldCheck size={28} color="var(--primary-color)" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>100% Confidential</h4>
                  <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>Your conversations with the AI are completely private and are never shared with the university or peers.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------------- STATE 2: IMMERSIVE FULL-SCREEN CHAT ---------------- */}
      {selectedTopic && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999, // Above navbar
          background: selectedTopic.backgroundGradient,
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.5s ease forwards'
        }}>
          
          {/* Minimalist Floating Header */}
          <div style={{ 
            position: 'absolute',
            top: 0, left: 0, right: 0,
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <button 
              onClick={handleBackToTopics} 
              style={{ background: 'var(--card-solid)', pointerEvents: 'auto', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 'var(--radius-full)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-md)', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform='translateY(0)'}}
            >
              <ArrowLeft size={18} /> Exit Session
            </button>

            <button 
              onClick={() => setShowEmergencyModal(true)}
              style={{ background: 'var(--mood-stressed)', pointerEvents: 'auto', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600', boxShadow: 'var(--shadow-md)', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform='translateY(0)'}
            >
              <ShieldAlert size={18} /> Emergency Help
            </button>
          </div>

          {/* Spacious Chat Messages Area */}
          <div style={{ flex: 1, padding: '6rem 2rem 10rem 2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Topic Indicator */}
            <div style={{ marginBottom: '3rem', textAlign: 'center', animation: 'fadeIn 1s ease 0.5s both' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{selectedTopic.icon}</div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{selectedTopic.label}</h2>
            </div>

            <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {messages.map(msg => (
                <div key={msg.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}>
                  
                  <div style={{
                    maxWidth: msg.isWellnessLink ? '100%' : '85%',
                    padding: msg.isWellnessLink ? '0' : '1.25rem 1.5rem',
                    borderRadius: '1.5rem',
                    borderBottomRightRadius: msg.sender === 'user' ? '0.25rem' : '1.5rem',
                    borderBottomLeftRadius: msg.sender === 'ai' ? '0.25rem' : '1.5rem',
                    background: msg.sender === 'user' ? selectedTopic.themeColor : (msg.isWellnessLink ? 'transparent' : 'var(--card-solid)'),
                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                    boxShadow: msg.isWellnessLink ? 'none' : '0 4px 15px rgba(0,0,0,0.03)',
                    fontSize: '1.1rem',
                    lineHeight: '1.7',
                    letterSpacing: '0.2px'
                  }}>
                    {!msg.isWellnessLink && !msg.isStoryLink && <div>{msg.text}</div>}
                    
                    {msg.isWellnessLink && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ padding: '1.25rem 1.5rem', background: 'var(--card-solid)', borderRadius: '1.5rem', borderBottomLeftRadius: '0.25rem', display: 'inline-block', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                          {msg.text}
                        </div>
                        
                        <button 
                          onClick={() => {
                            document.body.style.overflow = 'auto'; // release scroll lock
                            navigate(`/support?topic=${selectedTopic.id}`);
                          }}
                          style={{
                            background: selectedTopic.themeColor,
                            color: 'white',
                            border: 'none',
                            padding: '1.25rem 2rem',
                            borderRadius: '1rem',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            boxShadow: `0 10px 20px ${selectedTopic.themeColor}44`,
                            transition: 'all 0.2s',
                            marginTop: '0.5rem'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          Explore Exercises in Wellness Center <ArrowRight size={20} />
                        </button>
                      </div>
                    )}

                    {msg.isStoryLink && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ padding: '1.25rem 1.5rem', background: 'var(--card-solid)', borderRadius: '1.5rem', borderBottomLeftRadius: '0.25rem', display: 'inline-block', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                          {msg.text}
                        </div>
                        
                        <button 
                          onClick={() => {
                            document.body.style.overflow = 'auto'; // release scroll lock
                            navigate(`/coping-stories?topic=${selectedTopic.id}`);
                          }}
                          style={{
                            background: selectedTopic.themeColor,
                            color: 'white',
                            border: 'none',
                            padding: '1.25rem 2rem',
                            borderRadius: '1rem',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            boxShadow: `0 10px 20px ${selectedTopic.themeColor}44`,
                            transition: 'all 0.2s',
                            marginTop: '0.5rem'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          Read Inspiring Stories <ArrowRight size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', animation: 'fadeIn 0.3s' }}>
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '1.5rem',
                    background: 'var(--card-solid)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    gap: '6px'
                  }}>
                    <div className="animate-pulse-soft" style={{ width: '8px', height: '8px', background: selectedTopic.themeColor, borderRadius: '50%', animationDelay: '0s' }} />
                    <div className="animate-pulse-soft" style={{ width: '8px', height: '8px', background: selectedTopic.themeColor, borderRadius: '50%', animationDelay: '0.2s' }} />
                    <div className="animate-pulse-soft" style={{ width: '8px', height: '8px', background: selectedTopic.themeColor, borderRadius: '50%', animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Minimalist Floating Input Area */}
          <div style={{ 
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            padding: '2rem', 
            background: 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)', 
            pointerEvents: 'none',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center' 
          }}>
            
            <div style={{ marginBottom: '1rem', pointerEvents: 'auto', display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handleRequestCopingStrategies}
                disabled={isTyping}
                style={{ 
                  background: 'var(--card-solid)', 
                  border: `1px solid ${selectedTopic.themeColor}`, 
                  color: selectedTopic.themeColor,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: isTyping ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: isTyping ? 0.5 : 1
                }}
                onMouseOver={(e) => { if(!isTyping) { e.currentTarget.style.background = selectedTopic.themeColor; e.currentTarget.style.color = 'white'; } }}
                onMouseOut={(e) => { if(!isTyping) { e.currentTarget.style.background = 'var(--card-solid)'; e.currentTarget.style.color = selectedTopic.themeColor; } }}
              >
                <Lightbulb size={16} /> Suggest Coping Strategies
              </button>

              <button 
                onClick={handleRequestStories}
                disabled={isTyping}
                style={{ 
                  background: 'var(--card-solid)', 
                  border: `1px solid ${selectedTopic.themeColor}`, 
                  color: selectedTopic.themeColor,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: isTyping ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)',
                  opacity: isTyping ? 0.5 : 1
                }}
                onMouseOver={(e) => { if(!isTyping) { e.currentTarget.style.background = selectedTopic.themeColor; e.currentTarget.style.color = 'white'; } }}
                onMouseOut={(e) => { if(!isTyping) { e.currentTarget.style.background = 'var(--card-solid)'; e.currentTarget.style.color = selectedTopic.themeColor; } }}
              >
                <BookOpen size={16} /> Read Success Stories
              </button>
            </div>

            <div style={{ width: '100%', maxWidth: '750px', pointerEvents: 'auto' }}>
              <form onSubmit={handleSendMessage} style={{ 
                display: 'flex', 
                background: 'var(--card-solid)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                padding: '0.5rem'
              }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message UniMind AI...`}
                  style={{
                    flex: 1,
                    padding: '1rem 1.5rem',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '1.1rem',
                    outline: 'none',
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || isTyping}
                  style={{ 
                    borderRadius: 'var(--radius-md)', 
                    width: '48px', 
                    height: '48px', 
                    margin: '4px',
                    padding: '0', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    background: (!inputText.trim() || isTyping) ? '#e2e8f0' : selectedTopic.themeColor,
                    border: 'none',
                    cursor: (!inputText.trim() || isTyping) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if(!(!inputText.trim() || isTyping)) e.currentTarget.style.opacity = '0.9'; }}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Send size={20} color={(!inputText.trim() || isTyping) ? '#a0aec0' : 'white'} />
                </button>
              </form>
            </div>
          </div>

          {/* Emergency Resources Modal */}
          {showEmergencyModal && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, animation: 'fadeIn 0.2s' }}>
              <div className="premium-glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem', background: 'var(--card-solid)', position: 'relative' }}>
                <button 
                  onClick={() => setShowEmergencyModal(false)}
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <X size={24} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldAlert size={28} color="var(--mood-stressed)" />
                  <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Emergency Resources</h2>
                </div>
                <p style={{ fontSize: '1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                  You are not alone. Please reach out to these free, confidential resources right away.
                </p>
                {renderEmergencyResources()}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default ChatSupport;
