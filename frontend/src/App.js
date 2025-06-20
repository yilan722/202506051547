import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import {
  ZenCoinDisplay,
  AchievementNotification,
  MoodDiary,
  CoursesModal,
  AchievementGallery,
  Leaderboard,
  ZenCoinMenu
} from './ZenCoinSystem';

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

// Multi-language translations
const TRANSLATIONS = {
  zh: {
    title: "心灵绿洲",
    subtitle: "呼吸与绽放",
    description: "您的呼吸创造您的个人绿洲。回到您通过每次会话成长的圣地。",
    howHelp: "今天我们如何帮助您找到内心的平静？",
    supportMission: "支持我们的神圣使命",
    supportDescription: "帮助我们保持心灵绿洲无广告并持续改进，为世界上更多灵魂带来平静与安宁。",
    supportWork: "支持我们的工作",
    sessions: "会话",
    elements: "禅币",
    zenCoins: "禅币",
    totalZenCoins: "总禅币",
    earnedCoins: "获得",
    intentions: {
      'calm-before-event': { title: '重要时刻前的平静', subtitle: '演讲、面试或重要时刻' },
      'sharpen-focus': { title: '提高专注力', subtitle: '工作、学习或创作任务' },
      'soothe-mind': { title: '抚慰心灵', subtitle: '感到焦虑、沮丧或不知所措' },
      'drift-to-sleep': { title: '安然入睡', subtitle: '为宁静的睡眠做准备' },
      'just-breathe': { title: '简单呼吸', subtitle: '片刻的平静与平衡' }
    },
    breathing: {
      inhale: '吸气',
      hold: '保持憋气',
      exhale: '呼气',
      pressHold: '按住',
      release: '放开',
      keepHolding: '保持憋气',
      cycle: '周期'
    }
  },
  ja: {
    title: "癒しの大地",
    subtitle: "呼吸と花開き",
    description: "あなたの呼吸があなただけのオアシスを創造します。セッションを重ねるごとに成長する聖地に戻りましょう。",
    howHelp: "今日はどのように心の平静を見つけるお手伝いをしましょうか？",
    supportMission: "私たちの神聖な使命を支援",
    supportDescription: "癒しの大地を広告なしで保ち、継続的に改善し、世界中のより多くの魂に平静と安らぎをもたらすことを支援してください。",
    supportWork: "私たちの活動を支援",
    sessions: "セッション",
    elements: "生命要素",
    intentions: {
      'calm-before-event': { title: '重要な瞬間前の落ち着き', subtitle: 'プレゼンテーション、面接、重要な瞬間' },
      'sharpen-focus': { title: '集中力を高める', subtitle: '仕事、勉強、創造的なタスク' },
      'soothe-mind': { title: '心を癒す', subtitle: '不安、落ち込み、圧倒された気持ち' },
      'drift-to-sleep': { title: '安らかな眠りへ', subtitle: '安らかな眠りの準備' },
      'just-breathe': { title: 'ただ呼吸する', subtitle: '平静とバランスのひととき' }
    },
    breathing: {
      inhale: '吸息',
      hold: '息止め',
      exhale: '呼息',
      pressHold: '押し続ける',
      release: '離す',
      keepHolding: '息止め続行',
      cycle: 'サイクル'
    }
  },
  ko: {
    title: "회복의 땅",
    subtitle: "호흡과 꽃피움",
    description: "당신의 호흡이 개인적인 오아시스를 만듭니다. 각 세션을 통해 성장한 성역으로 돌아가세요.",
    howHelp: "오늘 어떻게 마음의 평정을 찾도록 도와드릴까요？",
    supportMission: "우리의 신성한 사명 지원",
    supportDescription: "회복의 땅을 광고 없이 유지하고 지속적으로 개선하여 전 세계 더 많은 영혼에게 평화와 고요를 가져다주는 것을 도와주세요.",
    supportWork: "우리의 작업 지원",
    sessions: "세션",
    elements: "생명 요소",
    intentions: {
      'calm-before-event': { title: '중요한 순간 전 평정', subtitle: '발표, 면접, 중요한 순간' },
      'sharpen-focus': { title: '집중력 향상', subtitle: '업무, 학습, 창작 과제' },
      'soothe-mind': { title: '마음 달래기', subtitle: '불안, 우울, 압도된 기분' },
      'drift-to-sleep': { title: '잠들기', subtitle: '편안한 잠을 위한 준비' },
      'just-breathe': { title: '단순히 호흡하기', subtitle: '평화와 균형의 순간' }
    },
    breathing: {
      inhale: '들이쉬기',
      hold: '숨 참기',
      exhale: '내쉬기',
      pressHold: '누르고 있기',
      release: '놓기',
      keepHolding: '계속 참기',
      cycle: '주기'
    }
  },
  en: {
    title: "Restorative Lands",
    subtitle: "Breathe & Bloom",
    description: "Your breath creates your personal oasis. Return to the sanctuary you've grown with each mindful session.",
    howHelp: "How may we guide your journey today?",
    supportMission: "Support Our Sacred Mission",
    supportDescription: "Help us keep Restorative Lands ad-free and continuously improving, bringing peace and calm to more souls around the world.",
    supportWork: "Support Our Work",
    sessions: "sessions",
    elements: "Zen Coins",
    zenCoins: "Zen Coins",
    totalZenCoins: "Total Zen Coins",
    earnedCoins: "earned",
    intentions: {
      'calm-before-event': { title: 'Calm Before an Event', subtitle: 'Presentation, interview, or important moment' },
      'sharpen-focus': { title: 'Sharpen My Focus', subtitle: 'Work, study, or creative tasks' },
      'soothe-mind': { title: 'Soothe My Mind', subtitle: 'Feeling anxious, down, or overwhelmed' },
      'drift-to-sleep': { title: 'Drift to Sleep', subtitle: 'Preparing for restful slumber' },
      'just-breathe': { title: 'Just Breathe', subtitle: 'A moment of peace and balance' }
    },
    breathing: {
      inhale: 'Breathe In',
      hold: 'Hold Breath',
      exhale: 'Breathe Out',
      pressHold: 'Press & Hold',
      release: 'Release',
      keepHolding: 'Keep Holding',
      cycle: 'Cycle'
    }
  }
};
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
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Default to English
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
  
  // Zen Coin System State
  const [userProfile, setUserProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showZenCoinMenu, setShowZenCoinMenu] = useState(false);
  const [showMoodDiary, setShowMoodDiary] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [achievementNotification, setAchievementNotification] = useState(null);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const breathButtonRef = useRef(false); // Add ref for real-time button state

  // Get current translations
  const t = TRANSLATIONS[currentLanguage];

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



  // Load Zen Coin system data
  const loadZenCoinData = async () => {
    try {
      const [achievementsRes, coursesRes, leaderboardRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/achievements`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/courses`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/leaderboard`)
      ]);

      if (achievementsRes.ok) setAchievements(await achievementsRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (leaderboardRes.ok) setLeaderboard(await leaderboardRes.json());

      if (userProfile) {
        const userAchievementsRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/achievements/${userProfile.id}`);
        if (userAchievementsRes.ok) setUserAchievements(await userAchievementsRes.json());
      }
    } catch (error) {
      console.error('Failed to load Zen Coin data:', error);
    }
  };

  // Submit mood diary entry
  const submitMoodDiary = async (moodData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/mood-diary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moodData)
      });
      
      if (response.ok) {
        // Refresh user profile to get updated Zen Coins
        await refreshUserProfile();
        setShowMoodDiary(false);
      }
    } catch (error) {
      console.error('Failed to submit mood diary:', error);
    }
  };

  // Complete course
  const completeCourse = async (courseId, userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/courses/${courseId}/complete?user_id=${userId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await refreshUserProfile();
        setShowCourses(false);
      }
    } catch (error) {
      console.error('Failed to complete course:', error);
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (userProfile) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${userProfile.id}`);
        if (response.ok) {
          const updatedProfile = await response.json();
          setUserProfile(updatedProfile);
        }
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    }
  };

  // Record breathing session
  const recordBreathingSession = async (sessionData) => {
    if (!userProfile) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/breathing-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userProfile.id,
          ...sessionData
        })
      });
      
      if (response.ok) {
        await refreshUserProfile();
      }
    } catch (error) {
      console.error('Failed to record breathing session:', error);
    }
  };

  // Initialize system on mount
  useEffect(() => {
    const initializeSystem = async () => {
      const profile = await initializeUserProfile();
      if (profile) {
        await loadZenCoinData();
      }
    };
    initializeSystem();
  }, []);

  // Load user achievements when profile changes
  useEffect(() => {
    if (userProfile) {
      loadZenCoinData();
    }
  }, [userProfile]);

  // Initialize or get user profile
  const initializeUserProfile = async () => {
    const savedUserId = localStorage.getItem('zenUserId');
    if (savedUserId) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${savedUserId}`);
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          return profile;
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    }
    
    // Create new user profile
    const username = `ZenUser${Date.now()}`;
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        localStorage.setItem('zenUserId', profile.id);
        return profile;
      }
    } catch (error) {
      console.error('Failed to create user profile:', error);
    }
    return null;
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
          shouldProgress = currentButtonState; // Must be pressing
          break;
        case 'hold':
        case 'holdAfter':
          shouldProgress = true; // Auto-progress during hold phases - no button needed
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
        return t.breathing.pressHold;
      case 'hold':
      case 'holdAfter':
        return t.breathing.hold; // Just show "Hold Breath" - no button action needed
      case 'exhale':
        return t.breathing.release;
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
    const shouldProgress = getShouldProgressTime(currentPhase);
    
    if (!shouldProgress) {
      switch (currentPhase) {
        case 'inhale':
          return `⏸️ ${t.breathing.pressHold} to start inhaling and advance time`;
        case 'hold':
        case 'holdAfter':
          return `✅ ${t.breathing.hold} - time progresses automatically`;
        case 'exhale':
          return `⏸️ ${t.breathing.release} to start exhaling`;
        default:
          return '';
      }
    }
    
    switch (currentPhase) {
      case 'inhale':
        return `✅ Perfect! Keep breathing in while holding`;
      case 'hold':
      case 'holdAfter':
        return `✅ Great! ${t.breathing.hold} - time flows naturally`;
      case 'exhale':
        return `✅ Excellent! Breathe out slowly`;
      default:
        return '';
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
    
    // Record breathing session for Zen Coins
    const pattern = BREATHING_PATTERNS[selectedIntention];
    recordBreathingSession({
      intention: selectedIntention,
      pattern_name: pattern.name,
      cycles_completed: pattern.cycles,
      duration_seconds: pattern.cycles * (pattern.inhale + pattern.hold + pattern.exhale + pattern.holdAfter)
    });
    
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
    const phaseNames = {
      inhale: t.breathing.inhale,
      hold: t.breathing.hold,
      exhale: t.breathing.exhale,
      holdAfter: t.breathing.hold
    };
    return `${phaseNames[currentPhase]} • ${Math.ceil(timeRemaining)}s`;
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
        {/* Language Selector */}
        <div className="absolute top-6 right-6 z-20">
          <select 
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40 transition-all duration-300"
          >
            <option value="en" className="bg-slate-800">English</option>
            <option value="zh" className="bg-slate-800">中文</option>
            <option value="ja" className="bg-slate-800">日本語</option>
            <option value="ko" className="bg-slate-800">한국어</option>
          </select>
        </div>

        {/* Zen Coin Display */}
        {userProfile && (
          <div className="absolute top-6 left-6 z-20">
            <button
              onClick={() => setShowZenCoinMenu(true)}
              className="bg-black/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl px-4 py-2 hover:bg-black/30 transition-all duration-300"
            >
              <ZenCoinDisplay zenCoins={userProfile.zen_coins} className="text-sm" />
            </button>
          </div>
        )}

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
                {t.title}
              </h1>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto mb-6"></div>
              <p className="text-2xl text-purple-200 mb-4 font-light tracking-wide">{t.subtitle}</p>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
                {t.description}
              </p>
            </div>
            
            {/* Progress indicator with elegant styling */}
            {oasisState.totalSessions > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-900/30 via-teal-900/30 to-cyan-900/30 rounded-3xl backdrop-blur-xl border border-emerald-700/20 inline-block shadow-2xl">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-emerald-200 font-light text-lg">
                    🌱 Your sanctuary flourishes with <span className="font-medium text-emerald-100">{oasisState.elements.length}</span> {t.elements} from <span className="font-medium text-emerald-100">{oasisState.totalSessions}</span> sacred {t.sessions}
                  </p>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Intention selection with refined cards */}
          <div className="mb-16">
            <h2 className="text-3xl font-light text-white mb-12 tracking-wide">{t.howHelp}</h2>
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
                    <h3 className="text-xl font-medium mb-3 tracking-wide">{t.intentions[intention.id].title}</h3>
                    <p className="text-sm opacity-90 font-light leading-relaxed">{t.intentions[intention.id].subtitle}</p>
                  </div>
                  
                  {/* Subtle border accent */}
                  <div className="absolute inset-0 rounded-3xl border border-white/20 group-hover:border-white/40 transition-colors duration-500"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Support section with elegant button */}
          <div className="mt-16 pt-8 border-t border-slate-700/30">
            <div className="flex flex-col items-center space-y-8">
              <h3 className="text-xl font-light text-slate-300 tracking-wide">{t.supportMission}</h3>
              <p className="text-sm text-slate-400 max-w-2xl text-center leading-relaxed font-light">
                {t.supportDescription}
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
                    <span className="font-light tracking-wide">{t.supportWork}</span>
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

  // Render different screens based on currentScreen state
  const renderScreen = () => {
    if (currentScreen === 'welcome') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Enhanced ambient effects */}
          <div className="absolute inset-0">
            {/* Dynamic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800/30 via-indigo-800/20 to-slate-900/40 animate-pulse"></div>
            
            {/* Floating orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
            
            {/* Enhanced particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className={`absolute rounded-full opacity-20 ${i % 3 === 0 ? 'bg-purple-400' : i % 3 === 1 ? 'bg-indigo-400' : 'bg-cyan-400'}`}
                  style={{
                    width: `${Math.random() * 4 + 1}px`,
                    height: `${Math.random() * 4 + 1}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 10}s`,
                    animationDuration: `${4 + Math.random() * 6}s`,
                    animation: `twinkle ${4 + Math.random() * 6}s ease-in-out infinite`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Language Selector with enhanced styling */}
          <div className="absolute top-6 right-6 z-20">
            <select 
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="bg-black/30 backdrop-blur-xl border border-white/30 rounded-2xl px-6 py-3 text-white text-sm focus:outline-none focus:border-purple-400/60 transition-all duration-500 shadow-xl hover:bg-black/40"
            >
              <option value="en" className="bg-slate-800">🇺🇸 English</option>
              <option value="zh" className="bg-slate-800">🇨🇳 中文</option>
              <option value="ja" className="bg-slate-800">🇯🇵 日本語</option>
              <option value="ko" className="bg-slate-800">🇰🇷 한국어</option>
            </select>
          </div>

          {/* Enhanced Zen Coin Display */}
          {userProfile && (
            <div className="absolute top-6 left-6 z-20">
              <button
                onClick={() => setShowZenCoinMenu(true)}
                className="group bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-600/20 backdrop-blur-xl border border-yellow-400/40 rounded-2xl px-6 py-3 hover:from-yellow-500/30 hover:via-orange-500/30 hover:to-yellow-600/30 transition-all duration-500 shadow-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <ZenCoinDisplay zenCoins={userProfile.zen_coins} className="text-sm font-semibold" />
                </div>
              </button>
            </div>
          )}

          <div className="max-w-5xl w-full text-center relative z-10">
            {/* Header with elegant styling */}
            <div className="mb-16">
              <div className="mb-8">
                <h1 className="text-7xl font-extralight text-white mb-6 tracking-widest leading-tight">
                  {t.title}
                </h1>
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto mb-6"></div>
                <p className="text-2xl text-purple-200 mb-4 font-light tracking-wide">{t.subtitle}</p>
                <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
                  {t.description}
                </p>
              </div>
              
              {/* Progress indicator with elegant styling - Show Zen Coins instead of elements */}
              {(userProfile?.zen_coins > 0 || oasisState.totalSessions > 0) && (
                <div className="mt-8 p-8 bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-cyan-900/20 rounded-3xl backdrop-blur-2xl border border-emerald-500/30 inline-block shadow-2xl relative overflow-hidden">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-cyan-400/10 animate-pulse"></div>
                  <div className="relative z-10 flex items-center justify-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse shadow-lg"></div>
                      <span className="text-2xl">🪙</span>
                      <div className="text-emerald-200 font-light text-lg">
                        <span className="font-semibold text-emerald-100">{userProfile?.zen_coins || 0}</span> {t.zenCoins || t.elements} {t.earnedCoins || "earned"}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent"></div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🧘</span>
                      <div className="text-emerald-200 font-light text-lg">
                        <span className="font-semibold text-emerald-100">{oasisState.totalSessions}</span> sacred {t.sessions}
                      </div>
                      <div className="w-4 h-4 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Intention selection with refined cards */}
            <div className="mb-16">
              <h2 className="text-3xl font-light text-white mb-12 tracking-wide">{t.howHelp}</h2>
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
                      <h3 className="text-xl font-medium mb-3 tracking-wide">{t.intentions[intention.id].title}</h3>
                      <p className="text-sm opacity-90 font-light leading-relaxed">{t.intentions[intention.id].subtitle}</p>
                    </div>
                    
                    {/* Subtle border accent */}
                    <div className="absolute inset-0 rounded-3xl border border-white/20 group-hover:border-white/40 transition-colors duration-500"></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Support section with elegant button */}
            <div className="mt-16 pt-8 border-t border-slate-700/30">
              <div className="flex flex-col items-center space-y-8">
                <h3 className="text-xl font-light text-slate-300 tracking-wide">{t.supportMission}</h3>
                <p className="text-sm text-slate-400 max-w-2xl text-center leading-relaxed font-light">
                  {t.supportDescription}
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
                      <span className="font-light tracking-wide">{t.supportWork}</span>
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
    } else if (currentScreen === 'preparation') {
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
    } else if (currentScreen === 'breathing') {
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
              className="absolute top-8 right-8 w-14 h-14 rounded-full bg-black/20 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/40 transition-all duration-300 flex items-center justify-center z-30 border border-white/10"
            >
              ✕
            </button>
          </div>
        </div>
      );
    } else if (currentScreen === 'completion') {
      const message = COMPLETION_MESSAGES[selectedIntention];
      const intention = intentions.find(i => i.id === selectedIntention);
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Ambient particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-200 rounded-full opacity-30 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${5 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>

          <div className="max-w-3xl w-full text-center relative z-10">
            {/* Completion message */}
            <div className="mb-16">
              <div className="text-8xl mb-10 filter drop-shadow-2xl">{message.icon}</div>
              <h2 className="text-5xl font-extralight text-white mb-8 tracking-wider leading-tight">
                Practice Complete
              </h2>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto mb-8"></div>
              <p className="text-2xl text-purple-200 mb-6 font-light leading-relaxed">
                {message.english}
              </p>
              
              {/* Zen Coins earned notification */}
              <div className="mt-12 p-6 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 rounded-3xl backdrop-blur-xl border border-yellow-500/30 inline-block shadow-2xl">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <p className="text-yellow-200 font-light text-lg">
                    <span className="text-2xl">🪙</span> <span className="font-medium text-yellow-100">+10 Zen Coins</span> earned for completing your practice
                  </p>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="space-y-6">
              <button
                onClick={() => setCurrentScreen('welcome')}
                className="group relative w-full py-6 px-10 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-2xl font-light hover:scale-105 transform transition-all duration-500 shadow-2xl overflow-hidden tracking-wide"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center justify-center space-x-4">
                  <span>Return to Sanctuary</span>
                  <div className="w-3 h-3 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setCurrentScreen('preparation');
                }}
                className="w-full py-4 px-8 rounded-2xl bg-white/5 backdrop-blur-sm text-white border border-white/20 hover:bg-white/10 transition-all duration-300 font-light tracking-wide"
              >
                Practice Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Default return if no screen matches (should never happen)
    return null;
  };

  return (
    <>
      {/* Main App Content */}
      {renderScreen()}

      {/* Zen Coin System Modals */}
      {achievementNotification && (
        <AchievementNotification
          achievement={achievementNotification}
          onClose={() => setAchievementNotification(null)}
        />
      )}

      {showZenCoinMenu && (
        <ZenCoinMenu
          userProfile={userProfile}
          onMoodDiary={() => {
            setShowZenCoinMenu(false);
            setShowMoodDiary(true);
          }}
          onCourses={() => {
            setShowZenCoinMenu(false);
            setShowCourses(true);
          }}
          onAchievements={() => {
            setShowZenCoinMenu(false);
            setShowAchievements(true);
          }}
          onLeaderboard={() => {
            setShowZenCoinMenu(false);
            setShowLeaderboard(true);
          }}
          onClose={() => setShowZenCoinMenu(false)}
        />
      )}

      {showMoodDiary && (
        <MoodDiary
          userProfile={userProfile}
          onMoodSubmit={submitMoodDiary}
          onClose={() => setShowMoodDiary(false)}
        />
      )}

      {showCourses && (
        <CoursesModal
          userProfile={userProfile}
          courses={courses}
          onCourseComplete={completeCourse}
          onClose={() => setShowCourses(false)}
        />
      )}

      {showAchievements && (
        <AchievementGallery
          userProfile={userProfile}
          allAchievements={achievements}
          userAchievements={userAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          leaderboard={leaderboard}
          userProfile={userProfile}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </>
  );

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

  // Main screen rendering logic
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Language Selector */}
        <div className="absolute top-6 right-6 z-20">
          <select 
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40 transition-all duration-300"
          >
            <option value="en" className="bg-slate-800">English</option>
            <option value="zh" className="bg-slate-800">中文</option>
            <option value="ja" className="bg-slate-800">日本語</option>
            <option value="ko" className="bg-slate-800">한국어</option>
          </select>
        </div>

        {/* Zen Coin Display */}
        {userProfile && (
          <div className="absolute top-6 left-6 z-20">
            <button
              onClick={() => setShowZenCoinMenu(true)}
              className="bg-black/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl px-4 py-2 hover:bg-black/30 transition-all duration-300"
            >
              <ZenCoinDisplay zenCoins={userProfile.zen_coins} className="text-sm" />
            </button>
          </div>
        )}

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
                {t.title}
              </h1>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto mb-6"></div>
              <p className="text-2xl text-purple-200 mb-4 font-light tracking-wide">{t.subtitle}</p>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
                {t.description}
              </p>
            </div>
            
            {/* Progress indicator with elegant styling */}
            {oasisState.totalSessions > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-900/30 via-teal-900/30 to-cyan-900/30 rounded-3xl backdrop-blur-xl border border-emerald-700/20 inline-block shadow-2xl">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-emerald-200 font-light text-lg">
                    🌱 Your sanctuary flourishes with <span className="font-medium text-emerald-100">{oasisState.elements.length}</span> {t.elements} from <span className="font-medium text-emerald-100">{oasisState.totalSessions}</span> sacred {t.sessions}
                  </p>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Intention selection with refined cards */}
          <div className="mb-16">
            <h2 className="text-3xl font-light text-white mb-12 tracking-wide">{t.howHelp}</h2>
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
                    <h3 className="text-xl font-medium mb-3 tracking-wide">{t.intentions[intention.id].title}</h3>
                    <p className="text-sm opacity-90 font-light leading-relaxed">{t.intentions[intention.id].subtitle}</p>
                  </div>
                  
                  {/* Subtle border accent */}
                  <div className="absolute inset-0 rounded-3xl border border-white/20 group-hover:border-white/40 transition-colors duration-500"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Support section with elegant button */}
          <div className="mt-16 pt-8 border-t border-slate-700/30">
            <div className="flex flex-col items-center space-y-8">
              <h3 className="text-xl font-light text-slate-300 tracking-wide">{t.supportMission}</h3>
              <p className="text-sm text-slate-400 max-w-2xl text-center leading-relaxed font-light">
                {t.supportDescription}
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
                    <span className="font-light tracking-wide">{t.supportWork}</span>
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

        {/* Zen Coin System Modals */}
        {achievementNotification && (
          <AchievementNotification
            achievement={achievementNotification}
            onClose={() => setAchievementNotification(null)}
          />
        )}

        {showZenCoinMenu && (
          <ZenCoinMenu
            userProfile={userProfile}
            onMoodDiary={() => {
              setShowZenCoinMenu(false);
              setShowMoodDiary(true);
            }}
            onCourses={() => {
              setShowZenCoinMenu(false);
              setShowCourses(true);
            }}
            onAchievements={() => {
              setShowZenCoinMenu(false);
              setShowAchievements(true);
            }}
            onLeaderboard={() => {
              setShowZenCoinMenu(false);
              setShowLeaderboard(true);
            }}
            onClose={() => setShowZenCoinMenu(false)}
          />
        )}

        {showMoodDiary && (
          <MoodDiary
            userProfile={userProfile}
            onMoodSubmit={submitMoodDiary}
            onClose={() => setShowMoodDiary(false)}
          />
        )}

        {showCourses && (
          <CoursesModal
            userProfile={userProfile}
            courses={courses}
            onCourseComplete={completeCourse}
            onClose={() => setShowCourses(false)}
          />
        )}

        {showAchievements && (
          <AchievementGallery
            userProfile={userProfile}
            allAchievements={achievements}
            userAchievements={userAchievements}
            onClose={() => setShowAchievements(false)}
          />
        )}

        {showLeaderboard && (
          <Leaderboard
            leaderboard={leaderboard}
            userProfile={userProfile}
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </div>
    );
  }

  // Main screen rendering logic
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Language Selector */}
        <div className="absolute top-6 right-6 z-20">
          <select 
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40 transition-all duration-300"
          >
            <option value="en" className="bg-slate-800">English</option>
            <option value="zh" className="bg-slate-800">中文</option>
            <option value="ja" className="bg-slate-800">日本語</option>
            <option value="ko" className="bg-slate-800">한국어</option>
          </select>
        </div>

        {/* Zen Coin Display */}
        {userProfile && (
          <div className="absolute top-6 left-6 z-20">
            <button
              onClick={() => setShowZenCoinMenu(true)}
              className="bg-black/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl px-4 py-2 hover:bg-black/30 transition-all duration-300"
            >
              <ZenCoinDisplay zenCoins={userProfile.zen_coins} className="text-sm" />
            </button>
          </div>
        )}

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
                {t.title}
              </h1>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-auto mb-6"></div>
              <p className="text-2xl text-purple-200 mb-4 font-light tracking-wide">{t.subtitle}</p>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
                {t.description}
              </p>
            </div>
            
            {/* Progress indicator with elegant styling */}
            {oasisState.totalSessions > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-900/30 via-teal-900/30 to-cyan-900/30 rounded-3xl backdrop-blur-xl border border-emerald-700/20 inline-block shadow-2xl">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-emerald-200 font-light text-lg">
                    🌱 Your sanctuary flourishes with <span className="font-medium text-emerald-100">{oasisState.elements.length}</span> {t.elements} from <span className="font-medium text-emerald-100">{oasisState.totalSessions}</span> sacred {t.sessions}
                  </p>
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Intention selection with refined cards */}
          <div className="mb-16">
            <h2 className="text-3xl font-light text-white mb-12 tracking-wide">{t.howHelp}</h2>
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
                    <h3 className="text-xl font-medium mb-3 tracking-wide">{t.intentions[intention.id].title}</h3>
                    <p className="text-sm opacity-90 font-light leading-relaxed">{t.intentions[intention.id].subtitle}</p>
                  </div>
                  
                  {/* Subtle border accent */}
                  <div className="absolute inset-0 rounded-3xl border border-white/20 group-hover:border-white/40 transition-colors duration-500"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Support section with elegant button */}
          <div className="mt-16 pt-8 border-t border-slate-700/30">
            <div className="flex flex-col items-center space-y-8">
              <h3 className="text-xl font-light text-slate-300 tracking-wide">{t.supportMission}</h3>
              <p className="text-sm text-slate-400 max-w-2xl text-center leading-relaxed font-light">
                {t.supportDescription}
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
                    <span className="font-light tracking-wide">{t.supportWork}</span>
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

        {/* Zen Coin System Modals */}
        {achievementNotification && (
          <AchievementNotification
            achievement={achievementNotification}
            onClose={() => setAchievementNotification(null)}
          />
        )}

        {showZenCoinMenu && (
          <ZenCoinMenu
            userProfile={userProfile}
            onMoodDiary={() => {
              setShowZenCoinMenu(false);
              setShowMoodDiary(true);
            }}
            onCourses={() => {
              setShowZenCoinMenu(false);
              setShowCourses(true);
            }}
            onAchievements={() => {
              setShowZenCoinMenu(false);
              setShowAchievements(true);
            }}
            onLeaderboard={() => {
              setShowZenCoinMenu(false);
              setShowLeaderboard(true);
            }}
            onClose={() => setShowZenCoinMenu(false)}
          />
        )}

        {showMoodDiary && (
          <MoodDiary
            userProfile={userProfile}
            onMoodSubmit={submitMoodDiary}
            onClose={() => setShowMoodDiary(false)}
          />
        )}

        {showCourses && (
          <CoursesModal
            userProfile={userProfile}
            courses={courses}
            onCourseComplete={completeCourse}
            onClose={() => setShowCourses(false)}
          />
        )}

        {showAchievements && (
          <AchievementGallery
            userProfile={userProfile}
            allAchievements={achievements}
            userAchievements={userAchievements}
            onClose={() => setShowAchievements(false)}
          />
        )}

        {showLeaderboard && (
          <Leaderboard
            leaderboard={leaderboard}
            userProfile={userProfile}
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </div>
    );
  }

  return null;
}

export default App;