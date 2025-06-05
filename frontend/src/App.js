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

// Media sources for different intentions
const INTENTION_MEDIA = {
  'calm-before-event': {
    type: 'video',
    url: 'https://raw.githubusercontent.com/yilan722/yilan722/main/grow_elements_in_a_dessert_that_makes_it_a_garden_finally%2C_multiple_elements_seed2226346197%20(1).mp4',
    duration: 10, // Original video duration in seconds
    audio: 'https://raw.githubusercontent.com/yilan722/yilan722/main/black-box-cozy-forest-122347.mp3'
  },
  'sharpen-focus': {
    type: 'video',
    url: 'https://raw.githubusercontent.com/yilan722/yilan722/main/_Restorative_Lands__(Healing_a_Barren_Landscape)__Concept__Users_start_with_a_small_patch_of_barren__seed3658657357.mp4',
    duration: 10, // Estimate video duration
    audio: 'https://raw.githubusercontent.com/yilan722/yilan722/main/just-relax-11157.mp3'
  },
  'soothe-mind': {
    type: 'video',
    url: 'https://raw.githubusercontent.com/yilan722/yilan722/main/grow_elements_in_a_dessert_that_makes_it_a_garden_finally%2C_multiple_elements_seed1563560480.mp4',
    duration: 10,
    audio: 'https://raw.githubusercontent.com/yilan722/yilan722/main/time-to-relax-11152.mp3'
  },
  'drift-to-sleep': {
    type: 'video',
    url: 'https://raw.githubusercontent.com/yilan722/yilan722/main/Generated%20File%20June%2005%2C%202025%20-%2011_31AM.mp4',
    duration: 10,
    audio: 'https://raw.githubusercontent.com/yilan722/yilan722/main/meditation-relax-sleep-music-346733.mp3'
  },
  'just-breathe': {
    type: 'video',
    url: 'https://raw.githubusercontent.com/yilan722/yilan722/main/Generated%20File%20June%2005%2C%202025%20-%2011_31AM%20(1).mp4',
    duration: 10,
    audio: 'https://raw.githubusercontent.com/yilan722/yilan722/main/buddha-healing-flute-music-calming-relaxing-music-for-body-souls-161796.mp3'
  }
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

// Oasis Canvas Component - Smooth slow video playback
const OasisCanvas = ({ oasisState, breathProgress, onElementGrown, selectedIntention }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  
  // Get media and pattern for current intention
  const media = INTENTION_MEDIA[selectedIntention];
  const pattern = BREATHING_PATTERNS[selectedIntention];
  
  // Calculate total session duration
  const totalSessionTime = pattern.cycles * (pattern.inhale + pattern.hold + pattern.exhale + pattern.holdAfter);
  
  // Ultra slow and smooth playback rate (consistent slow speed)
  const getSlowPlaybackRate = () => {
    // Always very slow - between 0.1x to 0.3x for smooth, meditative pace
    return 0.15; // Fixed slow rate for consistent smooth playback
  };

  useEffect(() => {
    if (videoRef.current && breathProgress >= 0) {
      const video = videoRef.current;
      const slowRate = getSlowPlaybackRate();
      
      // Set consistent slow playback rate
      video.playbackRate = slowRate;
      
      // Start playing smoothly if not already
      if (video.paused && breathProgress > 0) {
        video.play().catch(console.log);
      }
      
      // Let video play naturally at slow speed, no time jumping
      console.log(`Smooth slow playback at ${slowRate}x speed`);
    }
  }, [breathProgress]); // Minimal dependencies to prevent stuttering

  return (
    <div ref={canvasRef} className="oasis-canvas absolute inset-0 overflow-hidden">
      {/* Smooth slow video playback */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: `brightness(${0.7 + (breathProgress / 100) * 0.4}) contrast(${0.9 + (breathProgress / 100) * 0.3})`
        }}
        muted
        playsInline
        preload="auto"
        loop={false}
      >
        <source src={media.url} type="video/mp4" />
      </video>
      
      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
      
      {/* Breathing particles synchronized with session */}
      <div className="breathing-particles absolute inset-0 pointer-events-none">
        {Array.from({ length: Math.floor(breathProgress / 12.5) }, (_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-yellow-300 rounded-full opacity-70 animate-float"
            style={{
              left: `${48 + Math.cos(i * 0.785) * 15}%`,
              top: `${65 + Math.sin(i * 0.785) * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + Math.random() * 2}s`
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
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(15);
  const [isProcessingDonation, setIsProcessingDonation] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const breathButtonRef = useRef(false); // Add ref for real-time button state

  // Initialize audio context on user interaction
  const initializeAudio = async () => {
    if (!audioContext) {
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        if (context.state === 'suspended') {
          await context.resume();
        }
        setAudioContext(context);
        console.log('Audio context initialized successfully:', context.state);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    }
  };

  // Play audio effects and background sounds
  const playAudioEffect = (type) => {
    try {
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

  // Create intention-specific audio for background
  const createIntentionAudio = (intention) => {
    const media = INTENTION_MEDIA[intention];
    if (!media || !media.audio) return null;
    
    try {
      const audio = new Audio(media.audio);
      audio.loop = true;
      audio.volume = 0.3; // Set comfortable volume
      return audio;
    } catch (error) {
      console.log('Failed to create intention audio:', error);
      return null;
    }
  };

  // Create synthesized ambient sound (original Om-based music)
  const createSynthesizedAmbientSound = () => {
    if (!audioContext) return null;
    
    try {
      const oscillators = [];
      const gainNodes = [];
      const filters = [];
      
      // 1. Deep meditation drone (Om frequency)
      const omTone = audioContext.createOscillator();
      const omGain = audioContext.createGain();
      const omFilter = audioContext.createBiquadFilter();
      
      omTone.frequency.setValueAtTime(136.1, audioContext.currentTime); // Om frequency in Hz
      omTone.type = 'sine';
      omFilter.type = 'lowpass';
      omFilter.frequency.setValueAtTime(200, audioContext.currentTime);
      omGain.gain.setValueAtTime(0.08, audioContext.currentTime);
      
      omTone.connect(omFilter);
      omFilter.connect(omGain);
      omGain.connect(audioContext.destination);
      
      // 2. Gentle wind-like texture
      const windOsc = audioContext.createOscillator();
      const windGain = audioContext.createGain();
      const windFilter = audioContext.createBiquadFilter();
      const windModulator = audioContext.createOscillator();
      const windModGain = audioContext.createGain();
      
      windOsc.frequency.setValueAtTime(80, audioContext.currentTime);
      windOsc.type = 'triangle';
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(150, audioContext.currentTime);
      windFilter.Q.setValueAtTime(0.5, audioContext.currentTime);
      
      // Very slow modulation for wind-like effect
      windModulator.frequency.setValueAtTime(0.1, audioContext.currentTime);
      windModGain.gain.setValueAtTime(20, audioContext.currentTime);
      windModulator.connect(windModGain);
      windModGain.connect(windOsc.frequency);
      
      windGain.gain.setValueAtTime(0.03, audioContext.currentTime);
      
      windOsc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(audioContext.destination);
      
      // 3. Gentle harmonic overtone (perfect fifth)
      const harmonic = audioContext.createOscillator();
      const harmonicGain = audioContext.createGain();
      const harmonicFilter = audioContext.createBiquadFilter();
      
      harmonic.frequency.setValueAtTime(204.15, audioContext.currentTime); // Perfect fifth of Om
      harmonic.type = 'sine';
      harmonicFilter.type = 'lowpass';
      harmonicFilter.frequency.setValueAtTime(300, audioContext.currentTime);
      harmonicGain.gain.setValueAtTime(0.04, audioContext.currentTime);
      
      harmonic.connect(harmonicFilter);
      harmonicFilter.connect(harmonicGain);
      harmonicGain.connect(audioContext.destination);
      
      // 4. Subtle water-like trickling (high frequency gentle noise)
      const waterOsc = audioContext.createOscillator();
      const waterGain = audioContext.createGain();
      const waterFilter = audioContext.createBiquadFilter();
      const waterMod = audioContext.createOscillator();
      const waterModGain = audioContext.createGain();
      
      waterOsc.frequency.setValueAtTime(800, audioContext.currentTime);
      waterOsc.type = 'triangle';
      waterFilter.type = 'highpass';
      waterFilter.frequency.setValueAtTime(1200, audioContext.currentTime);
      waterFilter.Q.setValueAtTime(2, audioContext.currentTime);
      
      // Very gentle modulation for water effect
      waterMod.frequency.setValueAtTime(0.3, audioContext.currentTime);
      waterModGain.gain.setValueAtTime(100, audioContext.currentTime);
      waterMod.connect(waterModGain);
      waterModGain.connect(waterOsc.frequency);
      
      waterGain.gain.setValueAtTime(0.015, audioContext.currentTime);
      
      waterOsc.connect(waterFilter);
      waterFilter.connect(waterGain);
      waterGain.connect(audioContext.destination);
      
      // 5. Gentle breathing rhythm enhancer
      const breathOsc = audioContext.createOscillator();
      const breathGain = audioContext.createGain();
      const breathLFO = audioContext.createOscillator();
      const breathLFOGain = audioContext.createGain();
      
      breathOsc.frequency.setValueAtTime(272.2, audioContext.currentTime); // Octave of Om
      breathOsc.type = 'sine';
      
      // Very slow LFO to mimic breathing (4 breaths per minute)
      breathLFO.frequency.setValueAtTime(0.067, audioContext.currentTime);
      breathLFOGain.gain.setValueAtTime(0.02, audioContext.currentTime);
      breathLFO.connect(breathLFOGain);
      breathLFOGain.connect(breathGain.gain);
      
      breathGain.gain.setValueAtTime(0.02, audioContext.currentTime);
      
      breathOsc.connect(breathGain);
      breathGain.connect(audioContext.destination);
      
      // Start all oscillators
      omTone.start();
      windOsc.start();
      windModulator.start();
      harmonic.start();
      waterOsc.start();
      waterMod.start();
      breathOsc.start();
      breathLFO.start();
      
      // Add gentle fade-in
      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0, audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 3); // 3 second fade-in
      
      return {
        stop: () => {
          // Gentle fade-out before stopping
          const fadeOutTime = audioContext.currentTime + 2;
          omGain.gain.linearRampToValueAtTime(0, fadeOutTime);
          windGain.gain.linearRampToValueAtTime(0, fadeOutTime);
          harmonicGain.gain.linearRampToValueAtTime(0, fadeOutTime);
          waterGain.gain.linearRampToValueAtTime(0, fadeOutTime);
          breathGain.gain.linearRampToValueAtTime(0, fadeOutTime);
          
          setTimeout(() => {
            omTone.stop();
            windOsc.stop();
            windModulator.stop();
            harmonic.stop();
            waterOsc.stop();
            waterMod.stop();
            breathOsc.stop();
            breathLFO.stop();
          }, 2100);
        }
      };
    } catch (error) {
      console.log('Peaceful ambient sound creation failed:', error);
      return null;
    }
  };

  // Start intention-specific background audio
  const startAmbientSound = () => {
    console.log('Starting ambient sound for intention:', selectedIntention);
    if (backgroundAudio) {
      backgroundAudio.pause();
      backgroundAudio.currentTime = 0;
    }
    
    const intentionAudio = createIntentionAudio(selectedIntention);
    if (intentionAudio) {
      intentionAudio.play().catch(console.log);
      setBackgroundAudio(intentionAudio);
      console.log('Intention audio started successfully');
    } else {
      console.log('Failed to create intention audio, using fallback');
      // Fallback to synthesized audio if file audio fails
      if (audioContext && audioContext.state === 'running') {
        const ambient = createSynthesizedAmbientSound();
        setBackgroundAudio(ambient);
      }
    }
  };

  // Stop background ambient sound
  const stopAmbientSound = () => {
    if (backgroundAudio) {
      if (backgroundAudio.pause) {
        // HTML5 Audio element
        backgroundAudio.pause();
        backgroundAudio.currentTime = 0;
      } else if (backgroundAudio.stop) {
        // Web Audio API synthesized sound
        backgroundAudio.stop();
      }
      setBackgroundAudio(null);
      console.log('Background audio stopped');
    }
  };

  // Handle donation processing
  const handleDonation = async () => {
    setIsProcessingDonation(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/donations/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: donationAmount,
          origin_url: window.location.origin,
          donor_name: 'Anonymous Supporter',
          donor_email: null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create donation session');
      }

      const data = await response.json();
      
      // For demo purposes, simulate payment success
      setTimeout(async () => {
        try {
          await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/donations/confirm/${data.session_id}`, {
            method: 'POST'
          });
          
          setIsProcessingDonation(false);
          setShowDonationModal(false);
          
          // Show success message
          alert(`Thank you for your ${donationAmount === 5 ? 'Support' : donationAmount === 15 ? 'Growth' : 'Flourishing'} donation of $${donationAmount}! Your generosity helps keep Restorative Lands peaceful and ad-free. 🌱💖`);
          
        } catch (error) {
          console.error('Error confirming donation:', error);
          setIsProcessingDonation(false);
          alert('Donation completed but confirmation failed. Please contact support if needed.');
        }
      }, 2000); // Simulate 2 second processing time
      
    } catch (error) {
      console.error('Error processing donation:', error);
      setIsProcessingDonation(false);
      alert('Failed to process donation. Please try again later.');
    }
  };

  // Donation packages
  const donationPackages = [
    { amount: 5, name: 'Support Our Mission', description: 'Help keep the app ad-free', icon: '🌱' },
    { amount: 15, name: 'Nurture Growth', description: 'Support new features', icon: '🌿' },
    { amount: 30, name: 'Flourish Together', description: 'Help us reach more souls', icon: '🌳' }
  ];

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

  const startBreathingSession = async () => {
    const pattern = BREATHING_PATTERNS[selectedIntention];
    
    // Initialize audio and wait for it to be ready
    await initializeAudio();
    
    setCurrentScreen('breathing');
    setBreathingSession({
      isActive: true,
      currentCycle: 0,
      currentPhase: 'inhale',
      timeRemaining: pattern.inhale,
      progress: 0
    });
    
    // Start ambient background sound after a short delay to ensure audio context is ready
    setTimeout(() => {
      if (audioContext && audioContext.state === 'running') {
        startAmbientSound();
        console.log('Ambient sound started successfully');
      } else {
        console.log('Audio context not ready, retrying...');
        setTimeout(() => {
          startAmbientSound();
        }, 1000);
      }
    }, 1000); // Increased delay to 1 second
    
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    const pattern = BREATHING_PATTERNS[selectedIntention];
    let currentCycle = 0;
    let currentPhase = 'inhale';
    let timeRemaining = pattern.inhale;
    let totalElapsed = 0;
    const totalSessionTime = pattern.cycles * (pattern.inhale + pattern.hold + pattern.exhale + pattern.holdAfter);

    const updateSession = () => {
      // Use ref for real-time button state (avoids React closure issues)
      const currentButtonState = breathButtonRef.current;
      
      // Check if user is doing the correct breathing action
      let shouldProgress = false;
      switch (currentPhase) {
        case 'inhale':
        case 'hold':
        case 'holdAfter':
          shouldProgress = currentButtonState; // Must be pressing
          break;
        case 'exhale':
          shouldProgress = !currentButtonState; // Must be releasing
          break;
      }
      
      if (shouldProgress) {
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

  // Helper function to determine if time should progress based on user action
  const getShouldProgressTime = (phase) => {
    switch (phase) {
      case 'inhale':
        return isBreathButtonPressed; // User must press for inhale
      case 'hold':
      case 'holdAfter':
        return isBreathButtonPressed; // User must keep pressing for hold
      case 'exhale':
        return !isBreathButtonPressed; // User must release for exhale
      default:
        return false;
    }
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

  // Handle breath button press
  const handleBreathButtonPress = () => {
    setIsBreathButtonPressed(true);
    breathButtonRef.current = true; // Update ref immediately
    playAudioEffect('inhale');
  };

  // Handle breath button release
  const handleBreathButtonRelease = () => {
    setIsBreathButtonPressed(false);
    breathButtonRef.current = false; // Update ref immediately
    playAudioEffect('exhale');
  };

  // Get action guidance text
  const getActionGuidance = () => {
    const { currentPhase } = breathingSession;
    switch (currentPhase) {
      case 'inhale':
        return 'Press and hold the button to breathe in deeply';
      case 'hold':
      case 'holdAfter':
        return 'Keep holding the button to maintain your breath';
      case 'exhale':
        return 'Release the button to let your breath flow out';
      default:
        return 'Follow the breathing rhythm';
    }
  };

  const completeSession = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setBreathingSession(prev => ({ ...prev, isActive: false, progress: 100 }));
    
    // Stop ambient sound
    stopAmbientSound();
    
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
    
    // Stop ambient sound when leaving breathing session
    stopAmbientSound();
    
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

          {/* Support and Share section with elegant buttons */}
          <div className="mt-16 pt-8 border-t border-slate-700/30">
            <div className="flex flex-col items-center space-y-8">
              <h3 className="text-xl font-light text-slate-300 tracking-wide">Support Our Sacred Mission</h3>
              <p className="text-sm text-slate-400 max-w-2xl text-center leading-relaxed font-light">
                Help us keep Restorative Lands ad-free and continuously improving, bringing peace and calm to more souls around the world.
              </p>
              
              {/* Support section with donation button only */}
              <div className="flex justify-center w-full max-w-md mx-auto">
                {/* Real Payment Button */}
                <button 
                  onClick={() => {
                    // Open payment instruction dialog
                    const confirmed = window.confirm("💖 Support Restorative Lands Development\n\n🌱 Real Payment Options:\n\n1. PayPal: yilan722@example.com\n2. Venmo: @yilan722\n3. CashApp: $yilan722\n4. Crypto: BTC/ETH/USDT supported\n\nOr choose 'OK' to see integration guide for developers.\n\nCancel to return to meditation.");
                    
                    if (confirmed) {
                      // Show developer payment integration guide
                      const devGuide = `🚀 DEVELOPER PAYMENT INTEGRATION GUIDE\n\n💳 Option 1: Stripe Integration\n• Sign up at stripe.com\n• Get API keys (publishable + secret)\n• Install: npm install @stripe/stripe-js\n• Add to .env: REACT_APP_STRIPE_PUBLISHABLE_KEY\n• Backend: Add Stripe webhook endpoint\n\n💰 Option 2: PayPal Integration\n• Sign up at developer.paypal.com\n• Get Client ID and Secret\n• Install: npm install @paypal/react-paypal-js\n• Create PayPal Button component\n\n🏦 Option 3: Square Integration\n• Sign up at developer.squareup.com\n• Get Application ID\n• Install: npm install squareup\n• Implement Square Payment Form\n\n⚡ Quick Demo Implementation:\n1. Replace onClick handler\n2. Add payment provider SDK\n3. Configure webhook endpoints\n4. Handle success/failure states\n\n🔧 Need help? Contact: yilan722@email.com\n\nFor now, use manual payment methods above! 💝`;
                      
                      alert(devGuide);
                      
                      // Optional: Open PayPal direct link
                      if (window.confirm("Open PayPal payment link?")) {
                        window.open("https://www.paypal.me/yilan722/15", "_blank");
                      }
                    }
                  }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 border border-rose-400/30 rounded-2xl text-rose-200 hover:text-white transition-all duration-500 backdrop-blur-sm hover:shadow-lg hover:shadow-rose-500/20"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-lg">💖</span>
                    <span className="font-light tracking-wide">Support Our Work</span>
                    <div className="w-2 h-2 bg-rose-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  </div>
                  
                  {/* Button hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              </div>
              
              <p className="text-xs text-slate-500 font-light italic text-center">
                Your support helps cover development and server costs • Share your garden to inspire others on their mindfulness journey
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
          selectedIntention={selectedIntention}
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

          {/* Audio Control Button */}
          <button
            onClick={() => {
              if (backgroundAudio) {
                stopAmbientSound();
              } else {
                startAmbientSound();
              }
            }}
            className="absolute top-8 left-8 w-14 h-14 rounded-full bg-black/20 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/40 transition-all duration-300 flex items-center justify-center z-30 border border-white/10 text-xl"
          >
            {backgroundAudio ? '🔇' : '🎵'}
          </button>

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
          selectedIntention={selectedIntention}
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