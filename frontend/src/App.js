import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// Oasis element types for procedural generation - adapted from garden reference image
const ELEMENT_TYPES = {
  grass: { weight: 40, growTime: 1.5, colors: ['#22c55e', '#16a34a', '#15803d', '#84cc16'] },
  flower: { weight: 25, growTime: 2.5, colors: ['#f59e0b', '#eab308', '#d97706', '#dc2626', '#f472b6', '#ec4899'] },
  tree: { weight: 15, growTime: 4, colors: ['#16a34a', '#15803d', '#166534', '#064e3b'] },
  palmTree: { weight: 8, growTime: 5, colors: ['#16a34a', '#15803d', '#166534'] },
  succulent: { weight: 12, growTime: 3, colors: ['#84cc16', '#22c55e', '#65a30d'] },
  butterfly: { weight: 10, growTime: 1, colors: ['#f59e0b', '#eab308', '#f97316', '#3b82f6'] },
  crystal: { weight: 3, growTime: 3, colors: ['#06b6d4', '#0891b2', '#0e7490', '#0284c7'] },
  mushroom: { weight: 7, growTime: 2, colors: ['#dc2626', '#b91c1c', '#991b1b', '#f97316'] }
};

// Audio resources for immersive experience
const AUDIO_SOURCES = {
  desert: 'https://www.soundjay.com/misc/sounds/wind-desert.mp3', // Placeholder
  garden: 'https://www.soundjay.com/nature/sounds/forest-birds.mp3', // Placeholder
  inhale: 'https://www.soundjay.com/misc/sounds/bell-ringing.mp3', // Placeholder
  exhale: 'https://www.soundjay.com/misc/sounds/wind-chimes.mp3' // Placeholder
};

// Completion messages based on intention
const COMPLETION_MESSAGES = {
  'calm-before-event': {
    english: "You've found your calm center; you're ready to step forward with confidence.",
    icon: "🎯"
  },
  'drift-to-sleep': {
    english: "Release the day, and allow this gentle rhythm to guide you into peaceful, restorative sleep.",
    icon: "🌙"
  },
  'soothe-mind': {
    english: "You've created a moment of stillness for yourself; may this gentle space bring lightness to your spirit.",
    icon: "🌸"
  },
  'sharpen-focus': {
    english: "Your mind is now clearer, your breath steady; carry this focused calm into your next endeavor.",
    icon: "🧠"
  },
  'just-breathe': {
    english: "Well done for taking this time to connect with your breath; each one is a gift of presence to yourself.",
    icon: "🍃"
  }
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

    // Position elements to grow from the cracked earth areas
    // Focus on the central circular area and crack lines
    const isCentralGrowth = Math.random() < 0.7; // 70% chance to grow in center
    let x, y;
    
    if (isCentralGrowth) {
      // Central circular area (45-55% x, 55-75% y for the crater-like area)
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * 15 + 5; // 5-20% radius from center
      x = 50 + Math.cos(angle) * radius;
      y = 65 + Math.sin(angle) * radius * 0.6; // Slightly elliptical
    } else {
      // Along crack lines - more spread out
      x = Math.random() * 70 + 15; // 15-85% width
      y = Math.random() * 50 + 40; // 40-90% height (lower part of image)
    }

    const typeConfig = ELEMENT_TYPES[selectedType];
    return {
      id: Date.now() + Math.random(),
      type: selectedType,
      x: Math.max(5, Math.min(95, x)), // Ensure bounds
      y: Math.max(35, Math.min(95, y)), // Ensure bounds
      size: Math.random() * 0.6 + 0.8, // 0.8-1.4 scale (increased from 0.6-1.0)
      color: typeConfig.colors[Math.floor(Math.random() * typeConfig.colors.length)],
      rotation: Math.random() * 360,
      growTime: typeConfig.growTime,
      birthTime: Date.now(),
      isCentralGrowth
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
      
      case 'palmTree':
        return (
          <div {...baseProps} className="palm-tree-element">
            <svg width="35" height="70" viewBox="0 0 35 70">
              <rect x="16" y="40" width="3" height="30" fill="#8b4513"/>
              <path d="M17.5 40 Q5 25 15 15" stroke={color} strokeWidth="3" fill="none"/>
              <path d="M17.5 40 Q30 25 20 15" stroke={color} strokeWidth="3" fill="none"/>
              <path d="M17.5 40 Q10 20 25 20" stroke={color} strokeWidth="3" fill="none"/>
              <path d="M17.5 40 Q25 20 10 20" stroke={color} strokeWidth="3" fill="none"/>
            </svg>
          </div>
        );
      
      case 'succulent':
        return (
          <div {...baseProps} className="succulent-element">
            <svg width="20" height="25" viewBox="0 0 20 25">
              <ellipse cx="10" cy="20" rx="8" ry="5" fill={color} opacity="0.9"/>
              <ellipse cx="10" cy="15" rx="6" ry="4" fill={color} opacity="0.7"/>
              <ellipse cx="10" cy="11" rx="4" ry="3" fill={color} opacity="0.8"/>
              <circle cx="10" cy="8" r="2" fill="#f59e0b"/>
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
      {/* Use the provided barren landscape image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg)',
          filter: 'brightness(0.85) contrast(1.1)'
        }}
      ></div>
      
      {/* Subtle overlay to enhance element visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      
      {/* Permanent oasis elements */}
      {oasisState.elements.map(element => renderElement(element))}
      
      {/* Currently animating elements */}
      {animatingElements.map(element => renderElement(element, true))}
      
      {/* Breathing particles - positioned to emanate from the central crater */}
      <div className="breathing-particles absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-yellow-300 rounded-full opacity-70 animate-float"
            style={{
              left: `${48 + Math.cos(i * 0.785) * 10}%`, // Emanate from center crater
              top: `${65 + Math.sin(i * 0.785) * 6}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`
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
  const [isBreathButtonPressed, setIsBreathButtonPressed] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [backgroundAudio, setBackgroundAudio] = useState(null);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio context on user interaction
  const initializeAudio = () => {
    if (!audioContext) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);
    }
  };

  // Play audio effects
  const playAudioEffect = (type) => {
    try {
      // For now, we'll use a simple beep sound or web audio API
      if (audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different tones for different effects
        switch (type) {
          case 'inhale':
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A note
            break;
          case 'exhale':
            oscillator.frequency.setValueAtTime(330, audioContext.currentTime); // E note
            break;
          default:
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C note
        }
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  // Handle breath button interactions
  const handleBreathButtonPress = () => {
    setIsBreathButtonPressed(true);
    if (breathingSession.currentPhase === 'inhale') {
      playAudioEffect('inhale');
    }
  };

  const handleBreathButtonRelease = () => {
    setIsBreathButtonPressed(false);
    if (breathingSession.currentPhase === 'exhale') {
      playAudioEffect('exhale');
    }
  };

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
    initializeAudio(); // Initialize audio when session starts
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
    let totalElapsed = 0;
    let isPaused = false; // New: track if breathing is paused
    const totalSessionTime = pattern.cycles * (pattern.inhale + pattern.hold + pattern.exhale + pattern.holdAfter);

    const updateSession = () => {
      // Only progress time if user is doing the correct action
      const shouldProgress = getShouldProgressTime(currentPhase);
      
      if (shouldProgress && !isPaused) {
        totalElapsed += 0.1;
        timeRemaining -= 0.1;
      }
      
      const progressPercentage = Math.min((totalElapsed / totalSessionTime) * 100, 100);
      
      setBreathingSession(prev => ({
        ...prev,
        currentCycle,
        currentPhase,
        timeRemaining: Math.ceil(timeRemaining),
        progress: progressPercentage
      }));

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

  // Helper function to get breathing instruction for the unified button
  const getBreathingInstruction = () => {
    const { currentPhase } = breathingSession;
    switch (currentPhase) {
      case 'inhale':
        return 'Press & Hold';
      case 'hold':
      case 'holdAfter':
        return 'Keep Holding';
      case 'exhale':
        return 'Release';
      default:
        return 'Breathe';
    }
  };

  // Helper function to get action guidance
  const getActionGuidance = () => {
    const { currentPhase } = breathingSession;
    const shouldProgress = getShouldProgressTime(currentPhase);
    
    if (!shouldProgress) {
      switch (currentPhase) {
        case 'inhale':
          return '⏸️ Press the button to start inhaling and advance time';
        case 'hold':
        case 'holdAfter':
          return '⏸️ Keep holding the button to continue';
        case 'exhale':
          return '⏸️ Release the button to start exhaling';
        default:
          return '';
      }
    }
    
    switch (currentPhase) {
      case 'inhale':
        return '✅ Perfect! Keep breathing in while holding';
      case 'hold':
      case 'holdAfter':
        return '✅ Great! Hold your breath and keep pressing';
      case 'exhale':
        return '✅ Excellent! Breathe out slowly';
      default:
        return '';
    }
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

  const handleElementGrown = useCallback((newElement) => {
    setOasisState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${4 + Math.random() * 6}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl w-full text-center relative z-10">
          {/* Header with elegant styling */}
          <div className="mb-16">
            <div className="mb-8">
              <h1 className="text-7xl font-extralight text-white mb-6 tracking-widest leading-tight">
                Restorative Lands
              </h1>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto mb-6"></div>
              <p className="text-2xl text-purple-200 mb-4 font-light tracking-wide">Breathe & Bloom</p>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
                Your breath creates your personal oasis. Return to the sanctuary you've grown with each mindful session.
              </p>
            </div>
            
            {/* Progress indicator with elegant styling */}
            {oasisState.totalSessions > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-900/30 via-teal-900/30 to-cyan-900/30 rounded-3xl backdrop-blur-xl border border-emerald-700/20 inline-block shadow-2xl">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-emerald-200 font-light text-lg">
                    🌱 Your sanctuary flourishes with <span className="font-medium text-emerald-100">{oasisState.elements.length}</span> living elements from <span className="font-medium text-emerald-100">{oasisState.totalSessions}</span> sacred sessions
                  </p>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Intention selection with refined cards */}
          <div className="mb-16">
            <h2 className="text-3xl font-light text-white mb-12 tracking-wide">How may we guide your journey today?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {intentions.map((intention) => (
                <button
                  key={intention.id}
                  onClick={() => {
                    setSelectedIntention(intention.id);
                    setCurrentScreen('preparation');
                  }}
                  className={`group relative p-8 rounded-3xl bg-gradient-to-br ${intention.gradient} hover:scale-105 transform transition-all duration-500 text-white shadow-2xl hover:shadow-3xl overflow-hidden`}
                >
                  {/* Card glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="text-5xl mb-6 filter drop-shadow-lg">{intention.icon}</div>
                    <h3 className="text-xl font-medium mb-3 tracking-wide">{intention.title}</h3>
                    <p className="text-sm opacity-90 font-light leading-relaxed">{intention.subtitle}</p>
                  </div>
                  
                  {/* Subtle border accent */}
                  <div className="absolute inset-0 rounded-3xl border border-white/20 group-hover:border-white/40 transition-colors duration-500"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Support section with elegant donate button */}
          <div className="mt-16 pt-8 border-t border-slate-700/30">
            <div className="flex flex-col items-center space-y-6">
              <h3 className="text-xl font-light text-slate-300 tracking-wide">Support Our Sacred Mission</h3>
              <p className="text-sm text-slate-400 max-w-2xl text-center leading-relaxed font-light">
                Help us keep Restorative Lands ad-free and continuously improving, bringing peace and calm to more souls around the world.
              </p>
              <button className="group relative px-8 py-4 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 border border-rose-400/30 rounded-2xl text-rose-200 hover:text-white transition-all duration-500 backdrop-blur-sm hover:shadow-lg hover:shadow-rose-500/20">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">💖</span>
                  <span className="font-light tracking-wide">Support Our Work</span>
                  <div className="w-2 h-2 bg-rose-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                </div>
                
                {/* Button hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
              <p className="text-xs text-slate-500 font-light italic">
                Your support helps cover development and server costs, enabling new features and keeping our sanctuary peaceful.
              </p>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-purple-200 rounded-full opacity-30 animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-3xl w-full text-center relative z-10">
          {/* Header section */}
          <div className="mb-12">
            <div className="text-7xl mb-8 filter drop-shadow-2xl">{intention.icon}</div>
            <h2 className="text-5xl font-extralight text-white mb-6 tracking-wider leading-tight">{intention.title}</h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto mb-6"></div>
            <p className="text-xl text-purple-200 mb-12 font-light leading-relaxed">{pattern.description}</p>
          </div>

          {/* Breathing pattern card with elegant design */}
          <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-10 mb-12 border border-white/10 shadow-2xl">
            <h3 className="text-3xl font-light text-white mb-8 tracking-wide">{pattern.name}</h3>
            
            {/* Breathing pattern grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-8">
              <div className="group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-600/30 border border-blue-400/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl text-blue-300 font-light">{pattern.inhale}s</div>
                </div>
                <div className="text-blue-200 font-light tracking-wide">Inhale</div>
              </div>
              
              {pattern.hold > 0 && (
                <div className="group">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400/20 to-green-600/30 border border-green-400/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <div className="text-3xl text-green-300 font-light">{pattern.hold}s</div>
                  </div>
                  <div className="text-green-200 font-light tracking-wide">Hold</div>
                </div>
              )}
              
              <div className="group">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400/20 to-purple-600/30 border border-purple-400/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl text-purple-300 font-light">{pattern.exhale}s</div>
                </div>
                <div className="text-purple-200 font-light tracking-wide">Exhale</div>
              </div>
              
              {pattern.holdAfter > 0 && (
                <div className="group">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-400/20 to-indigo-600/30 border border-indigo-400/30 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <div className="text-3xl text-indigo-300 font-light">{pattern.holdAfter}s</div>
                  </div>
                  <div className="text-indigo-200 font-light tracking-wide">Hold</div>
                </div>
              )}
            </div>
            
            {/* Session details */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex items-center justify-center space-x-8 text-slate-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="font-light">{pattern.cycles} breath cycles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="font-light">Each breath grows your oasis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-6">
            <button
              onClick={startBreathingSession}
              className={`group relative w-full py-6 px-10 rounded-3xl bg-gradient-to-r ${pattern.color} text-white text-2xl font-light hover:scale-105 transform transition-all duration-500 shadow-2xl overflow-hidden tracking-wide`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex items-center justify-center space-x-4">
                <span>{oasisState.totalSessions > 0 ? 'Return to Your Oasis' : 'Begin Your Journey'}</span>
                <div className="w-3 h-3 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
              </div>
            </button>
            
            <button
              onClick={() => setCurrentScreen('welcome')}
              className="w-full py-4 px-8 rounded-2xl bg-white/5 backdrop-blur-sm text-white border border-white/20 hover:bg-white/10 transition-all duration-300 font-light tracking-wide"
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
          {/* Unified Breathing Guide Circle with Interaction */}
          <div className="mb-16">
            <div className="relative">
              {/* Outer ring effect */}
              <div className={`absolute inset-0 w-48 h-48 mx-auto rounded-full border-2 border-white/20 transition-all duration-1000 ${getBreathingGuideSize()} opacity-50`}></div>
              
              {/* Main breathing guide - now interactive */}
              <button
                onMouseDown={handleBreathButtonPress}
                onMouseUp={handleBreathButtonRelease}
                onTouchStart={handleBreathButtonPress}
                onTouchEnd={handleBreathButtonRelease}
                className={`breath-button-unified relative w-44 h-44 mx-auto rounded-full bg-gradient-to-br ${pattern.color} backdrop-blur-sm transform transition-all duration-1000 ease-in-out ${getBreathingGuideSize()} overflow-hidden shadow-2xl ${
                  isBreathButtonPressed ? 'shadow-3xl scale-105' : ''
                } border-4 border-white/40`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                
                {/* Center content */}
                <div className="w-full h-full flex flex-col items-center justify-center relative z-10 text-white">
                  <div className="text-3xl font-light drop-shadow-lg mb-2">
                    {Math.ceil(breathingSession.timeRemaining)}
                  </div>
                  <div className="text-sm opacity-80 font-light">
                    {getBreathingInstruction()}
                  </div>
                </div>
                
                {/* Inner pulse effect */}
                <div className="absolute inset-6 rounded-full bg-white/10 animate-pulse"></div>
                
                {/* Ripple effect when pressed */}
                <div className={`absolute inset-0 rounded-full bg-white/20 transition-all duration-300 ${
                  isBreathButtonPressed ? 'scale-150 opacity-0' : 'scale-100 opacity-0'
                }`}></div>
              </button>
            </div>
            
            {/* Progress ring around the button */}
            <div className="relative -mt-44 mx-auto w-44 h-44 pointer-events-none">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - breathingSession.progress / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
            </div>
          </div>

          {/* Refined Instructions */}
          <div className="mb-12">
            <h2 className="text-5xl font-extralight text-white mb-3 drop-shadow-2xl tracking-wide">
              {getPhaseInstruction()}
            </h2>
            <p className="text-xl text-white/80 drop-shadow-lg font-light">
              Cycle {breathingSession.currentCycle + 1} of {pattern.cycles}
            </p>
            
            {/* Action guidance */}
            <div className="mt-6 p-4 bg-black/20 backdrop-blur-sm rounded-2xl max-w-md mx-auto">
              <p className="text-white/90 text-sm font-light">
                {getActionGuidance()}
              </p>
            </div>
          </div>

          {/* Elegant Pattern Info */}
          <div className="bg-black/30 backdrop-blur-xl rounded-3xl p-8 max-w-md mx-auto border border-white/10 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl mr-3 filter drop-shadow-lg">{intention.icon}</span>
              <div className="text-white text-xl font-light tracking-wide">{pattern.name}</div>
            </div>
            <div className="text-white/80 font-light text-center leading-relaxed">
              Your breath controls the flow of time
            </div>
            
            {/* Progress indicator */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-200 text-sm font-light">
                  {Math.round(breathingSession.progress)}% Complete
                </span>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Refined Exit Button */}
          <button
            onClick={resetApp}
            className="absolute top-8 right-8 w-14 h-14 rounded-full bg-black/20 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/40 transition-all duration-300 flex items-center justify-center z-30 border border-white/10 text-xl font-light"
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
    const completionMessage = COMPLETION_MESSAGES[selectedIntention];
    
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Show completed oasis with video background placeholder */}
        <OasisCanvas 
          oasisState={oasisState}
          breathProgress={100}
          onElementGrown={() => {}}
        />
        
        <div className="max-w-2xl w-full text-center z-10">
          <div className="mb-8">
            <div className="text-8xl mb-6">{completionMessage.icon}</div>
            <h2 className="text-5xl font-light text-white mb-4 drop-shadow-lg">Your Oasis Grows</h2>
            
            {/* Personalized Completion Message */}
            <div className="bg-black bg-opacity-50 backdrop-blur-lg rounded-3xl p-8 mb-8">
              <h3 className="text-2xl text-white mb-6">Session Complete</h3>
              <div className="text-xl text-white leading-relaxed mb-6 font-light">
                "{completionMessage.english}"
              </div>
              
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