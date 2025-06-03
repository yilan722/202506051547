import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BREATHING_PATTERNS = {
  'calm-before-event': {
    name: 'Box Breathing',
    description: 'Perfect for centering before important moments',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    cycles: 8,
    color: 'from-blue-400 to-blue-600'
  },
  'sharpen-focus': {
    name: '4-6 Breathing',
    description: 'Enhance mental clarity and concentration',
    inhale: 4,
    hold: 0,
    exhale: 6,
    holdAfter: 0,
    cycles: 10,
    color: 'from-green-400 to-green-600'
  },
  'soothe-mind': {
    name: '4-7-8 Breathing',
    description: 'Deep relaxation for troubled minds',
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfter: 0,
    cycles: 6,
    color: 'from-purple-400 to-purple-600'
  },
  'drift-to-sleep': {
    name: 'Extended Exhale',
    description: 'Prepare your body for restful sleep',
    inhale: 4,
    hold: 0,
    exhale: 8,
    holdAfter: 0,
    cycles: 8,
    color: 'from-indigo-400 to-indigo-600'
  },
  'just-breathe': {
    name: 'Coherence Breathing',
    description: 'Find your natural rhythm and balance',
    inhale: 5.5,
    hold: 0,
    exhale: 5.5,
    holdAfter: 0,
    cycles: 10,
    color: 'from-teal-400 to-teal-600'
  }
};

// Oasis element types for procedural generation
const ELEMENT_TYPES = {
  grass: { weight: 40, growTime: 1.5, colors: ['#4ade80', '#22c55e', '#16a34a'] },
  flower: { weight: 25, growTime: 2.5, colors: ['#f472b6', '#ec4899', '#db2777', '#fbbf24', '#f59e0b'] },
  tree: { weight: 15, growTime: 4, colors: ['#22c55e', '#16a34a', '#15803d'] },
  butterfly: { weight: 10, growTime: 1, colors: ['#f472b6', '#a855f7', '#3b82f6'] },
  crystal: { weight: 5, growTime: 3, colors: ['#06b6d4', '#0891b2', '#0e7490'] },
  mushroom: { weight: 5, growTime: 2, colors: ['#f87171', '#ef4444', '#dc2626'] }
};

// Oasis Canvas Component
const OasisCanvas = ({ oasisState, breathProgress, onElementGrown }) => {
  const canvasRef = useRef(null);
  const [animatingElements, setAnimatingElements] = useState([]);
  const lastProgressRef = useRef(0);

  // Generate new element when breathing progresses
  useEffect(() => {
    const progressMilestone = Math.floor(breathProgress / 12.5) * 12.5; // Every 12.5% progress
    const lastMilestone = Math.floor(lastProgressRef.current / 12.5) * 12.5;
    
    if (breathProgress > 0 && progressMilestone > lastMilestone && progressMilestone <= 100) {
      console.log('Generating element at progress:', breathProgress);
      const newElement = generateRandomElement();
      setAnimatingElements(prev => [...prev, newElement]);
      
      // After animation completes, add to permanent oasis
      const animationTime = newElement.type === 'tree' ? 4000 : newElement.type === 'flower' ? 2500 : 1500;
      setTimeout(() => {
        onElementGrown(newElement);
        setAnimatingElements(prev => prev.filter(el => el.id !== newElement.id));
      }, animationTime);
    }
    
    lastProgressRef.current = breathProgress;
  }, [breathProgress]); // Removed onElementGrown from dependencies

  const generateRandomElement = () => {
    const types = Object.keys(ELEMENT_TYPES);
    const weights = types.map(type => ELEMENT_TYPES[type].weight);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    let selectedType = types[0];
    
    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedType = types[i];
        break;
      }
    }

    const typeConfig = ELEMENT_TYPES[selectedType];
    return {
      id: Date.now() + Math.random(),
      type: selectedType,
      x: Math.random() * 80 + 10, // 10-90% of canvas width
      y: Math.random() * 60 + 30, // 30-90% of canvas height
      size: Math.random() * 0.5 + 0.5, // 0.5-1.0 scale
      color: typeConfig.colors[Math.floor(Math.random() * typeConfig.colors.length)],
      rotation: Math.random() * 360,
      growTime: typeConfig.growTime,
      birthTime: Date.now()
    };
  };

  const renderElement = (element, isAnimating = false) => {
    const { type, x, y, size, color, rotation, id, birthTime, growTime } = element;
    const animationProgress = isAnimating ? Math.min((Date.now() - birthTime) / (growTime * 1000), 1) : 1;
    const scale = animationProgress * size;
    const opacity = animationProgress;

    const baseProps = {
      key: id,
      style: {
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        transition: isAnimating ? `all ${growTime}s ease-out` : 'none'
      }
    };

    switch (type) {
      case 'grass':
        return (
          <div {...baseProps} className="grass-element">
            <svg width="12" height="20" viewBox="0 0 12 20">
              <path d="M6 20 Q2 15 6 0 Q10 15 6 20" fill={color} opacity="0.8"/>
            </svg>
          </div>
        );
      
      case 'flower':
        return (
          <div {...baseProps} className="flower-element">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" fill="#fbbf24"/>
              <circle cx="12" cy="6" r="4" fill={color} opacity="0.8"/>
              <circle cx="18" cy="12" r="4" fill={color} opacity="0.8"/>
              <circle cx="12" cy="18" r="4" fill={color} opacity="0.8"/>
              <circle cx="6" cy="12" r="4" fill={color} opacity="0.8"/>
            </svg>
          </div>
        );
      
      case 'tree':
        return (
          <div {...baseProps} className="tree-element">
            <svg width="40" height="60" viewBox="0 0 40 60">
              <rect x="18" y="45" width="4" height="15" fill="#8b4513"/>
              <circle cx="20" cy="35" r="15" fill={color} opacity="0.9"/>
              <circle cx="15" cy="30" r="10" fill={color} opacity="0.7"/>
              <circle cx="25" cy="30" r="10" fill={color} opacity="0.7"/>
            </svg>
          </div>
        );
      
      case 'butterfly':
        return (
          <div {...baseProps} className="butterfly-element animate-flutter">
            <svg width="20" height="16" viewBox="0 0 20 16">
              <ellipse cx="5" cy="6" rx="4" ry="5" fill={color} opacity="0.8"/>
              <ellipse cx="15" cy="6" rx="4" ry="5" fill={color} opacity="0.8"/>
              <line x1="10" y1="2" x2="10" y2="14" stroke="#333" strokeWidth="1"/>
            </svg>
          </div>
        );
      
      case 'crystal':
        return (
          <div {...baseProps} className="crystal-element animate-sparkle">
            <svg width="16" height="20" viewBox="0 0 16 20">
              <polygon points="8,0 12,6 8,20 4,6" fill={color} opacity="0.9"/>
              <polygon points="8,0 12,6 16,8 8,20" fill={color} opacity="0.6"/>
            </svg>
          </div>
        );
      
      case 'mushroom':
        return (
          <div {...baseProps} className="mushroom-element">
            <svg width="18" height="20" viewBox="0 0 18 20">
              <rect x="7" y="12" width="4" height="8" fill="#f5f5dc"/>
              <ellipse cx="9" cy="8" rx="8" ry="6" fill={color} opacity="0.9"/>
              <circle cx="6" cy="6" r="1.5" fill="white" opacity="0.8"/>
              <circle cx="12" cy="6" r="1.5" fill="white" opacity="0.8"/>
            </svg>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div ref={canvasRef} className="oasis-canvas absolute inset-0 overflow-hidden">
      {/* Base landscape */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-green-100 to-green-200 opacity-60"></div>
      
      {/* Permanent oasis elements */}
      {oasisState.elements.map(element => renderElement(element))}
      
      {/* Currently animating elements */}
      {animatingElements.map(element => renderElement(element, true))}
      
      {/* Breathing particles */}
      <div className="breathing-particles absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="particle absolute w-2 h-2 bg-white rounded-full opacity-60 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [selectedIntention, setSelectedIntention] = useState(null);
  const [breathingSession, setBreathingSession] = useState({
    isActive: false,
    currentCycle: 0,
    currentPhase: 'inhale',
    timeRemaining: 0,
    progress: 0
  });
  const [oasisState, setOasisState] = useState({ elements: [], totalSessions: 0 });
  const intervalRef = useRef(null);

  // Load user's oasis from localStorage
  useEffect(() => {
    const savedOasis = localStorage.getItem('userOasis');
    if (savedOasis) {
      setOasisState(JSON.parse(savedOasis));
    }
  }, []);

  // Save oasis to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userOasis', JSON.stringify(oasisState));
  }, [oasisState]);

  const intentions = [
    {
      id: 'calm-before-event',
      title: 'Calm Before an Event',
      subtitle: 'Presentation, interview, or important moment',
      icon: '🎯',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: 'sharpen-focus',
      title: 'Sharpen My Focus',
      subtitle: 'Work, study, or creative tasks',
      icon: '🧠',
      gradient: 'from-green-400 to-green-600'
    },
    {
      id: 'soothe-mind',
      title: 'Soothe My Mind',
      subtitle: 'Feeling anxious, down, or overwhelmed',
      icon: '🌸',
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      id: 'drift-to-sleep',
      title: 'Drift to Sleep',
      subtitle: 'Preparing for restful slumber',
      icon: '🌙',
      gradient: 'from-indigo-400 to-indigo-600'
    },
    {
      id: 'just-breathe',
      title: 'Just Breathe',
      subtitle: 'A moment of peace and balance',
      icon: '🍃',
      gradient: 'from-teal-400 to-teal-600'
    }
  ];

  const startBreathingSession = () => {
    const pattern = BREATHING_PATTERNS[selectedIntention];
    setCurrentScreen('breathing');
    setBreathingSession({
      isActive: true,
      currentCycle: 0,
      currentPhase: 'inhale',
      timeRemaining: pattern.inhale,
      progress: 0
    });
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    const pattern = BREATHING_PATTERNS[selectedIntention];
    let currentCycle = 0;
    let currentPhase = 'inhale';
    let timeRemaining = pattern.inhale;

    const updateSession = () => {
      setBreathingSession(prev => ({
        ...prev,
        currentCycle,
        currentPhase,
        timeRemaining: Math.ceil(timeRemaining),
        progress: (currentCycle / pattern.cycles) * 100
      }));

      timeRemaining -= 0.1;

      if (timeRemaining <= 0) {
        if (currentPhase === 'inhale') {
          if (pattern.hold > 0) {
            currentPhase = 'hold';
            timeRemaining = pattern.hold;
          } else {
            currentPhase = 'exhale';
            timeRemaining = pattern.exhale;
          }
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          timeRemaining = pattern.exhale;
        } else if (currentPhase === 'exhale') {
          if (pattern.holdAfter > 0) {
            currentPhase = 'holdAfter';
            timeRemaining = pattern.holdAfter;
          } else {
            currentCycle++;
            if (currentCycle >= pattern.cycles) {
              completeSession();
              return;
            }
            currentPhase = 'inhale';
            timeRemaining = pattern.inhale;
          }
        } else if (currentPhase === 'holdAfter') {
          currentCycle++;
          if (currentCycle >= pattern.cycles) {
            completeSession();
            return;
          }
          currentPhase = 'inhale';
          timeRemaining = pattern.inhale;
        }
      }
    };

    intervalRef.current = setInterval(updateSession, 100);
  };

  const completeSession = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setBreathingSession(prev => ({ ...prev, isActive: false, progress: 100 }));
    
    // Add completion bonus elements to oasis
    setOasisState(prev => ({
      elements: prev.elements,
      totalSessions: prev.totalSessions + 1
    }));
    
    setCurrentScreen('completion');
  };

  const handleElementGrown = (newElement) => {
    setOasisState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  const resetApp = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentScreen('welcome');
    setSelectedIntention(null);
    setBreathingSession({
      isActive: false,
      currentCycle: 0,
      currentPhase: 'inhale',
      timeRemaining: 0,
      progress: 0
    });
  };

  const getBreathingGuideSize = () => {
    if (!breathingSession.isActive) return 'scale-100';
    
    const { currentPhase } = breathingSession;
    if (currentPhase === 'inhale') return 'scale-150';
    if (currentPhase === 'exhale') return 'scale-75';
    return 'scale-125';
  };

  const getPhaseInstruction = () => {
    const { currentPhase, timeRemaining } = breathingSession;
    const instructions = {
      inhale: 'Breathe In',
      hold: 'Hold',
      exhale: 'Breathe Out',
      holdAfter: 'Hold'
    };
    return `${instructions[currentPhase]} • ${Math.ceil(timeRemaining)}s`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center">
          <div className="mb-12">
            <h1 className="text-6xl font-light text-white mb-4 tracking-wide">
              Restorative Lands
            </h1>
            <p className="text-xl text-slate-300 mb-2">Breathe & Bloom</p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Your breath creates your personal oasis. Return to the sanctuary you've grown with each session.
            </p>
            {oasisState.totalSessions > 0 && (
              <div className="mt-4 p-4 bg-green-900 bg-opacity-30 rounded-lg inline-block">
                <p className="text-green-300">🌱 Your oasis has {oasisState.elements.length} living elements from {oasisState.totalSessions} sessions</p>
              </div>
            )}
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl text-white mb-8">How can we help you find your calm today?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {intentions.map((intention) => (
                <button
                  key={intention.id}
                  onClick={() => {
                    setSelectedIntention(intention.id);
                    setCurrentScreen('preparation');
                  }}
                  className={`group p-6 rounded-2xl bg-gradient-to-br ${intention.gradient} hover:scale-105 transform transition-all duration-300 text-white shadow-xl hover:shadow-2xl`}
                >
                  <div className="text-4xl mb-4">{intention.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{intention.title}</h3>
                  <p className="text-sm opacity-90">{intention.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'preparation') {
    const pattern = BREATHING_PATTERNS[selectedIntention];
    const intention = intentions.find(i => i.id === selectedIntention);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">{intention.icon}</div>
            <h2 className="text-4xl font-light text-white mb-4">{intention.title}</h2>
            <p className="text-xl text-slate-300 mb-8">{pattern.description}</p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 mb-8">
            <h3 className="text-2xl text-white mb-6">{pattern.name}</h3>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-3xl text-blue-300 font-bold">{pattern.inhale}s</div>
                <div className="text-slate-300">Inhale</div>
              </div>
              {pattern.hold > 0 && (
                <div>
                  <div className="text-3xl text-green-300 font-bold">{pattern.hold}s</div>
                  <div className="text-slate-300">Hold</div>
                </div>
              )}
              <div>
                <div className="text-3xl text-purple-300 font-bold">{pattern.exhale}s</div>
                <div className="text-slate-300">Exhale</div>
              </div>
              {pattern.holdAfter > 0 && (
                <div>
                  <div className="text-3xl text-indigo-300 font-bold">{pattern.holdAfter}s</div>
                  <div className="text-slate-300">Hold</div>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-white border-opacity-20">
              <div className="text-lg text-slate-300">
                {pattern.cycles} breath cycles • Each breath grows your oasis
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={startBreathingSession}
              className={`w-full py-4 px-8 rounded-2xl bg-gradient-to-r ${pattern.color} text-white text-xl font-semibold hover:scale-105 transform transition-all duration-300 shadow-xl`}
            >
              {oasisState.totalSessions > 0 ? 'Return to Your Oasis' : 'Begin Your Journey'}
            </button>
            <button
              onClick={() => setCurrentScreen('welcome')}
              className="w-full py-3 px-8 rounded-2xl bg-white bg-opacity-10 text-white hover:bg-opacity-20 transition-all duration-300"
            >
              Choose Different Intention
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'breathing') {
    const pattern = BREATHING_PATTERNS[selectedIntention];
    const intention = intentions.find(i => i.id === selectedIntention);
    
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Living Oasis Canvas */}
        <OasisCanvas 
          oasisState={oasisState}
          breathProgress={breathingSession.progress}
          onElementGrown={handleElementGrown}
        />
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-black bg-opacity-30 z-10">
          <div 
            className={`h-full bg-gradient-to-r ${pattern.color} transition-all duration-300`}
            style={{ width: `${breathingSession.progress}%` }}
          />
        </div>

        <div className="text-center z-20">
          {/* Breathing Guide Circle */}
          <div className="mb-12">
            <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${pattern.color} opacity-90 transform transition-transform duration-1000 ease-in-out ${getBreathingGuideSize()}`}>
              <div className="w-full h-full rounded-full border-4 border-white border-opacity-50 flex items-center justify-center">
                <div className="text-white text-lg font-semibold">
                  {Math.ceil(breathingSession.timeRemaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h2 className="text-4xl font-light text-white mb-2 drop-shadow-lg">
              {getPhaseInstruction()}
            </h2>
            <p className="text-xl text-white opacity-90 drop-shadow-lg">
              Cycle {breathingSession.currentCycle + 1} of {pattern.cycles}
            </p>
          </div>

          {/* Pattern Info */}
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto">
            <div className="text-white mb-2">
              <span className="text-2xl mr-2">{intention.icon}</span>
              {pattern.name}
            </div>
            <div className="text-white opacity-80">
              Your breath is growing your personal oasis
            </div>
          </div>

          {/* Exit Button */}
          <button
            onClick={resetApp}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black bg-opacity-30 text-white hover:bg-opacity-50 transition-colors duration-300 flex items-center justify-center z-30"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'completion') {
    const pattern = BREATHING_PATTERNS[selectedIntention];
    const intention = intentions.find(i => i.id === selectedIntention);
    
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Show completed oasis */}
        <OasisCanvas 
          oasisState={oasisState}
          breathProgress={100}
          onElementGrown={() => {}}
        />
        
        <div className="max-w-2xl w-full text-center z-10">
          <div className="mb-8">
            <div className="text-8xl mb-6">🌸</div>
            <h2 className="text-5xl font-light text-white mb-4 drop-shadow-lg">Your Oasis Grows</h2>
            <p className="text-2xl text-white opacity-90 mb-8 leading-relaxed drop-shadow-lg">
              Beautiful work! Your breathing has added new life to your personal sanctuary. 
              Each session makes it more magical.
            </p>
          </div>

          <div className="bg-black bg-opacity-40 backdrop-blur-lg rounded-3xl p-8 mb-8">
            <h3 className="text-2xl text-white mb-6">Session Complete</h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl text-green-300 font-bold">{intention.icon}</div>
                <div className="text-white mt-2">{intention.title}</div>
              </div>
              <div>
                <div className="text-3xl text-blue-300 font-bold">{oasisState.elements.length}</div>
                <div className="text-white mt-2">Living Elements</div>
              </div>
              <div>
                <div className="text-3xl text-purple-300 font-bold">{oasisState.totalSessions}</div>
                <div className="text-white mt-2">Total Sessions</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={resetApp}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-green-400 to-green-600 text-white text-xl font-semibold hover:scale-105 transform transition-all duration-300 shadow-xl"
            >
              Return to Your Garden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;