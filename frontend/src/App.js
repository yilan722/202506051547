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

const LANDSCAPE_IMAGES = {
  barren: 'https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg',
  transition: 'https://images.unsplash.com/photo-1463595373836-6e0b0a8ee322',
  blooming: 'https://images.unsplash.com/photo-1561788098-26b72c5368b3'
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [selectedIntention, setSelectedIntention] = useState(null);
  const [breathingSession, setBreathingSession] = useState({
    isActive: false,
    currentCycle: 0,
    currentPhase: 'inhale', // inhale, hold, exhale, holdAfter
    timeRemaining: 0,
    progress: 0
  });
  const [landscapeProgress, setLandscapeProgress] = useState(0);
  const intervalRef = useRef(null);

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
    setLandscapeProgress(0);
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

      // Update landscape progress
      setLandscapeProgress((currentCycle / pattern.cycles) * 100);

      timeRemaining -= 0.1;

      if (timeRemaining <= 0) {
        // Move to next phase
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
            // Complete cycle
            currentCycle++;
            if (currentCycle >= pattern.cycles) {
              completeSession();
              return;
            }
            currentPhase = 'inhale';
            timeRemaining = pattern.inhale;
          }
        } else if (currentPhase === 'holdAfter') {
          // Complete cycle
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
    setBreathingSession(prev => ({ ...prev, isActive: false }));
    setLandscapeProgress(100);
    setCurrentScreen('completion');
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
    setLandscapeProgress(0);
  };

  const getBreathingGuideSize = () => {
    if (!breathingSession.isActive) return 'scale-100';
    
    const { currentPhase } = breathingSession;
    if (currentPhase === 'inhale') return 'scale-150';
    if (currentPhase === 'exhale') return 'scale-75';
    return 'scale-125'; // hold phases
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

  const getCurrentLandscapeImage = () => {
    if (landscapeProgress < 33) return LANDSCAPE_IMAGES.barren;
    if (landscapeProgress < 66) return LANDSCAPE_IMAGES.transition;
    return LANDSCAPE_IMAGES.blooming;
  };

  const getLandscapeOpacity = () => {
    const progress = landscapeProgress / 100;
    return Math.max(0.3, Math.min(1, 0.3 + (progress * 0.7)));
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
              Your breath is a powerful tool for both inner calm and outer creation. 
              Let your breathing bring life to the world around you.
            </p>
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
                {pattern.cycles} breath cycles • ~{Math.ceil(pattern.cycles * (pattern.inhale + pattern.hold + pattern.exhale + pattern.holdAfter) / 60)} minutes
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={startBreathingSession}
              className={`w-full py-4 px-8 rounded-2xl bg-gradient-to-r ${pattern.color} text-white text-xl font-semibold hover:scale-105 transform transition-all duration-300 shadow-xl`}
            >
              Begin Your Journey
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
      <div 
        className="min-h-screen relative flex items-center justify-center p-4 transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${getCurrentLandscapeImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: getLandscapeOpacity()
        }}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-black bg-opacity-30">
          <div 
            className={`h-full bg-gradient-to-r ${pattern.color} transition-all duration-300`}
            style={{ width: `${breathingSession.progress}%` }}
          />
        </div>

        <div className="text-center z-10">
          {/* Breathing Guide Circle */}
          <div className="mb-12">
            <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${pattern.color} opacity-80 transform transition-transform duration-1000 ease-in-out ${getBreathingGuideSize()}`}>
              <div className="w-full h-full rounded-full border-4 border-white border-opacity-50 flex items-center justify-center">
                <div className="text-white text-lg font-semibold">
                  {Math.ceil(breathingSession.timeRemaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h2 className="text-4xl font-light text-white mb-2">
              {getPhaseInstruction()}
            </h2>
            <p className="text-xl text-white opacity-80">
              Cycle {breathingSession.currentCycle + 1} of {pattern.cycles}
            </p>
          </div>

          {/* Pattern Info */}
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto">
            <div className="text-white mb-2">
              <span className="text-2xl mr-2">{intention.icon}</span>
              {pattern.name}
            </div>
            <div className="text-white opacity-80">
              Your breath is bringing life to this land
            </div>
          </div>

          {/* Exit Button */}
          <button
            onClick={resetApp}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black bg-opacity-30 text-white hover:bg-opacity-50 transition-colors duration-300 flex items-center justify-center"
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
      <div 
        className="min-h-screen relative flex items-center justify-center p-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${LANDSCAPE_IMAGES.blooming})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-2xl w-full text-center z-10">
          <div className="mb-8">
            <div className="text-8xl mb-6">🌸</div>
            <h2 className="text-5xl font-light text-white mb-4">Well Done</h2>
            <p className="text-2xl text-white opacity-90 mb-8 leading-relaxed">
              You've brought life back to this land, and calm to your mind. 
              Feel the peace you've cultivated.
            </p>
          </div>

          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 mb-8">
            <h3 className="text-2xl text-white mb-6">Session Complete</h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl text-green-300 font-bold">{intention.icon}</div>
                <div className="text-white mt-2">{intention.title}</div>
              </div>
              <div>
                <div className="text-3xl text-blue-300 font-bold">{pattern.cycles}</div>
                <div className="text-white mt-2">Breath Cycles</div>
              </div>
              <div>
                <div className="text-3xl text-purple-300 font-bold">
                  {Math.ceil(pattern.cycles * (pattern.inhale + pattern.hold + pattern.exhale + pattern.holdAfter) / 60)}m
                </div>
                <div className="text-white mt-2">Duration</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={resetApp}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-green-400 to-green-600 text-white text-xl font-semibold hover:scale-105 transform transition-all duration-300 shadow-xl"
            >
              Return to Garden
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;