import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Heart, ArrowLeft, ArrowRight, X, User, Search } from 'lucide-react';
import { COPING_STORIES } from '../data/copingStories';

const CATEGORIES = [
  { id: 'all', label: 'All Stories', icon: '🌍' },
  { id: 'depression', label: 'Depression', icon: '🌧️' },
  { id: 'trauma', label: 'Trauma', icon: '🫂' },
  { id: 'substance', label: 'Substance Use', icon: '🛑' },
  { id: 'porn_addiction', label: 'Porn Addiction', icon: '🧠' },
  { id: 'self_love', label: 'Self-Love', icon: '✨' },
  { id: 'other', label: 'Other', icon: '💭' }
];

const CopingStories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query parameter to see if we came from a specific chat topic
  const queryParams = new URLSearchParams(location.search);
  const initialTopic = queryParams.get('topic') || 'all';

  const [activeCategory, setActiveCategory] = useState(initialTopic);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);
  const [readingProgress, setReadingProgress] = useState(0);

  // Filter stories based on active category and search query
  const filteredStories = COPING_STORIES.filter(story => {
    const matchesCategory = activeCategory === 'all' || story.categoryId === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      story.title.toLowerCase().includes(searchLower) ||
      story.author.toLowerCase().includes(searchLower) ||
      story.content.toLowerCase().includes(searchLower) ||
      story.quote.toLowerCase().includes(searchLower);
    
    return matchesCategory && matchesSearch;
  });

  // Get related stories for the bottom of the reading view
  const getRelatedStories = () => {
    if (!selectedStory) return [];
    return COPING_STORIES
      .filter(s => s.categoryId === selectedStory.categoryId && s.id !== selectedStory.id)
      .slice(0, 2); // Get up to 2 related stories
  };

  // Scroll to top when opening a story
  useEffect(() => {
    if (selectedStory) {
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedStory]);

  // Handle scroll progress for reading modal
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setReadingProgress(progress);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', overflow: 'hidden', padding: '3rem 0', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(79, 209, 197, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <BookOpen size={40} color="var(--primary-color)" /> Stories of Hope
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Real journeys of healing, resilience, and reclaiming life. You are not alone on this path.
        </p>
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <Heart size={14} color="var(--mood-stressed)" />
          <span>Disclaimer: These stories are for inspirational purposes and do not replace professional therapy.</span>
        </div>
      </div>

      {/* Search and Filters Container */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Search Bar */}
        <div style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search stories by keywords, titles, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '1.25rem 1.25rem 1.25rem 3.5rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(0,0,0,0.1)',
              background: 'var(--card-solid)',
              fontSize: '1.05rem',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => { e.target.style.boxShadow = 'var(--shadow-md)'; e.target.style.borderColor = 'var(--primary-color)'; }}
            onBlur={(e) => { e.target.style.boxShadow = 'var(--shadow-sm)'; e.target.style.borderColor = 'rgba(0,0,0,0.1)'; }}
          />
        </div>

        {/* Category Filters */}
        <div className="horizontal-scroll" style={{ padding: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                background: activeCategory === category.id ? 'var(--primary-color)' : 'var(--card-solid)',
                color: activeCategory === category.id ? 'white' : 'var(--text-primary)',
                border: `1px solid ${activeCategory === category.id ? 'transparent' : 'rgba(0,0,0,0.1)'}`,
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                boxShadow: activeCategory === category.id ? '0 4px 10px rgba(79, 209, 197, 0.3)' : 'none'
              }}
              onMouseOver={(e) => { if(activeCategory !== category.id) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={(e) => { if(activeCategory !== category.id) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <Search size={48} opacity={0.2} style={{ margin: '0 auto 1rem auto' }} />
          <h3>No stories found</h3>
          <p>Try adjusting your search terms or category filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {filteredStories.map((story, index) => (
            <div 
              key={story.id} 
              className="premium-glass-panel animate-slide-up"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                overflow: 'hidden',
                borderTop: `4px solid ${story.themeColor}`
              }}
              onClick={() => setSelectedStory(story)}
            >
              {/* Card Header (Quote Preview) */}
              <div style={{ 
                padding: '2rem', 
                background: story.bgGradient || 'linear-gradient(to right bottom, var(--card-solid), var(--card-bg))',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                flex: 1
              }}>
                <BookOpen size={24} color={story.themeColor} style={{ marginBottom: '1rem', opacity: 0.7 }} />
                <h3 style={{ fontSize: '1.4rem', lineHeight: '1.4', marginBottom: '1rem', color: '#1a202c' }}>
                  "{story.quote}"
                </h3>
              </div>
              
              {/* Card Footer (Author Info & Title) */}
              <div style={{ padding: '1.5rem', background: 'var(--card-solid)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{story.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <User size={14} />
                    <span>{story.author}, {story.age}</span>
                    <span style={{ fontSize: '0.7rem', color: story.themeColor }}>•</span>
                    <span>{story.background}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: story.themeColor, fontWeight: '600', fontSize: '0.9rem', marginTop: 'auto' }}>
                  Read Full Story <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Reading Modal */}
      {selectedStory && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: selectedStory.bgGradient || 'var(--bg-color)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.4s ease forwards',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Progress Bar Header */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
            <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)' }}>
              <div style={{ height: '100%', background: selectedStory.themeColor, width: `${readingProgress}%`, transition: 'width 0.1s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, transparent 100%)' }}>
              <button 
                onClick={() => { setSelectedStory(null); setReadingProgress(0); }}
                style={{ background: 'var(--card-solid)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 'var(--radius-full)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '500', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <ArrowLeft size={18} /> Back to Stories
              </button>
            </div>
          </div>

          {/* Reading Content */}
          <div 
            onScroll={handleScroll}
            style={{ flex: 1, overflowY: 'auto', padding: '6rem 2rem 4rem 2rem' }}
          >
            <div className="animate-slide-up" style={{ maxWidth: '850px', margin: '0 auto', background: 'var(--card-solid)', padding: '4rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(255,255,255,0.5)' }}>
              
              {/* Story Header */}
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: `${selectedStory.themeColor}15`, color: selectedStory.themeColor, borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {CATEGORIES.find(c => c.id === selectedStory.categoryId)?.icon} 
                  {CATEGORIES.find(c => c.id === selectedStory.categoryId)?.label}
                </div>
                <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '2rem', color: '#1a202c' }}>{selectedStory.title}</h1>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: selectedStory.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: `0 4px 10px ${selectedStory.themeColor}40` }}>
                      {selectedStory.author.charAt(0)}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{selectedStory.author}</div>
                      <div style={{ fontSize: '0.9rem' }}>{selectedStory.age} years old • {selectedStory.background}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Highlight Quote */}
              <div style={{ padding: '2.5rem', background: `${selectedStory.themeColor}08`, borderRadius: 'var(--radius-md)', borderLeft: `6px solid ${selectedStory.themeColor}`, marginBottom: '3.5rem', fontSize: '1.6rem', fontStyle: 'italic', color: '#2d3748', lineHeight: '1.5' }}>
                "{selectedStory.quote}"
              </div>

              {/* Story Body */}
              <div style={{ fontSize: '1.2rem', lineHeight: '2.1', color: '#2d3748', letterSpacing: '0.3px' }}>
                {selectedStory.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} style={{ marginBottom: '2rem' }}>{paragraph}</p>
                ))}
              </div>
              
              {/* Connect with AI Support Call To Action */}
              <div style={{ marginTop: '5rem', padding: '3rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                <Heart size={32} color={selectedStory.themeColor} style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Need Someone to Talk To?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
                  Our AI Support companion is available 24/7 to listen and provide personalized coping strategies without judgment.
                </p>
                <button 
                  onClick={() => navigate('/chat')}
                  style={{ background: selectedStory.themeColor, color: 'white', border: 'none', borderRadius: 'var(--radius-full)', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', boxShadow: `0 10px 20px ${selectedStory.themeColor}40`, transition: 'transform 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                   Start an AI Chat Session <ArrowRight size={20} />
                </button>
              </div>

            </div>

            {/* Recommendations Section */}
            {getRelatedStories().length > 0 && (
              <div style={{ maxWidth: '850px', margin: '4rem auto', animation: 'fadeIn 1s ease' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a202c' }}>
                  <BookOpen size={24} color={selectedStory.themeColor} /> 
                  More Stories About {CATEGORIES.find(c => c.id === selectedStory.categoryId)?.label}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                  {getRelatedStories().map(story => (
                    <div 
                      key={story.id} 
                      className="premium-glass-panel"
                      style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        background: 'var(--card-solid)'
                      }}
                      onClick={() => {
                        setSelectedStory(story);
                        setReadingProgress(0);
                        // Scroll up the modal container instead of the window
                        const scrollContainer = document.querySelector('[style*="overflow-y: auto"]');
                        if (scrollContainer) scrollContainer.scrollTop = 0;
                      }}
                    >
                      <div style={{ padding: '1.5rem', background: story.bgGradient || 'var(--card-bg)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#1a202c', lineHeight: '1.4' }}>{story.title}</h4>
                      </div>
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{story.quote}"
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: story.themeColor, fontWeight: '600', fontSize: '0.9rem', marginTop: 'auto' }}>
                          Read Story <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default CopingStories;
