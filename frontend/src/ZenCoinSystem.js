import React, { useState, useEffect } from 'react';

// Zen Coin System Components

// Zen Coin Display Component
export const ZenCoinDisplay = ({ zenCoins, className = "" }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="text-2xl">🪙</div>
      <div className="text-lg font-semibold text-yellow-300">
        {zenCoins.toLocaleString()} Zen Coins
      </div>
    </div>
  );
};

// Achievement Notification Component
export const AchievementNotification = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-2xl animate-bounce max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="text-3xl">{achievement.icon}</div>
        <div>
          <div className="font-bold text-lg">Achievement Unlocked!</div>
          <div className="font-medium">{achievement.name}</div>
          <div className="text-sm opacity-90">{achievement.description}</div>
          <div className="text-yellow-200 font-bold">+{achievement.zen_coin_reward} 🪙</div>
        </div>
      </div>
    </div>
  );
};

// Mood Diary Component
export const MoodDiary = ({ userProfile, onMoodSubmit, onClose }) => {
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    { value: 'very_happy', label: 'Very Happy', emoji: '😁' },
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'calm', label: 'Calm', emoji: '😌' },
    { value: 'peaceful', label: 'Peaceful', emoji: '🕯️' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'stressed', label: 'Stressed', emoji: '😤' },
    { value: 'sad', label: 'Sad', emoji: '😢' }
  ];

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    try {
      await onMoodSubmit({
        user_id: userProfile.id,
        mood: selectedMood,
        notes: notes.trim() || null
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit mood diary:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-700">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-light text-white mb-2">How are you feeling?</h3>
          <p className="text-slate-300 text-sm">Reflect on your current state and earn 5 🪙</p>
        </div>

        {/* Mood Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood.value)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedMood === mood.value
                  ? 'border-purple-400 bg-purple-400/20 scale-105'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-white text-sm font-medium">{mood.label}</div>
            </button>
          ))}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share your thoughts (optional)..."
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
            rows="3"
            maxLength="200"
          />
          <div className="text-xs text-slate-400 mt-1">{notes.length}/200</div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedMood || isSubmitting}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Submit</span>
                <span>+5 🪙</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Courses Component
export const CoursesModal = ({ userProfile, courses, onCourseComplete, onClose }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'from-green-400 to-green-600';
      case 'intermediate': return 'from-blue-400 to-blue-600';
      case 'advanced': return 'from-purple-400 to-purple-600';
      case 'master': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🌿';
      case 'advanced': return '🌳';
      case 'master': return '🏆';
      default: return '📚';
    }
  };

  const handleCourseStart = async (course) => {
    try {
      await onCourseComplete(course.id, userProfile.id);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Failed to complete course:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-3xl font-light text-white mb-2">Breathing Courses</h3>
            <p className="text-slate-300">Deepen your practice and earn Zen Coins</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600 hover:border-slate-500 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`text-2xl p-2 rounded-lg bg-gradient-to-r ${getLevelColor(course.level)}`}>
                  {getLevelIcon(course.level)}
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">+{course.zen_coin_reward} 🪙</div>
                  <div className="text-slate-400 text-sm">{course.duration_minutes} min</div>
                </div>
              </div>

              <h4 className="text-xl font-semibold text-white mb-2">{course.name}</h4>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">{course.description}</p>

              <div className="flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getLevelColor(course.level)} text-white`}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </div>
                <button
                  onClick={() => handleCourseStart(course)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm rounded-lg transition-all font-medium"
                >
                  Start Course
                </button>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <div className="text-xl text-slate-300 mb-2">No courses available</div>
            <div className="text-slate-400">Complete prerequisites to unlock more courses</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Achievement Gallery Component
export const AchievementGallery = ({ userProfile, allAchievements, userAchievements, onClose }) => {
  const unlockedIds = userAchievements.map(a => a.id);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-3xl font-light text-white mb-2">Achievements</h3>
            <p className="text-slate-300">
              {userAchievements.length} of {allAchievements.length} unlocked
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400/50'
                    : 'bg-slate-700/30 border-slate-600'
                }`}
              >
                <div className={`text-4xl mb-3 ${isUnlocked ? '' : 'filter grayscale'}`}>
                  {achievement.icon}
                </div>
                <h4 className={`font-semibold mb-2 ${isUnlocked ? 'text-yellow-300' : 'text-slate-400'}`}>
                  {achievement.name}
                </h4>
                <p className={`text-sm mb-3 ${isUnlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                  {achievement.description}
                </p>
                <div className={`text-sm font-medium ${isUnlocked ? 'text-yellow-400' : 'text-slate-500'}`}>
                  {achievement.zen_coin_reward} 🪙
                </div>
                {isUnlocked && (
                  <div className="mt-2 text-xs text-green-400 flex items-center">
                    ✓ Unlocked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Leaderboard Component
export const Leaderboard = ({ leaderboard, userProfile, onClose }) => {
  const userRank = leaderboard.findIndex(entry => entry.username === userProfile?.username) + 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-3xl font-light text-white mb-2">🏆 Zen Leaderboard</h3>
            <p className="text-slate-300">
              {userRank > 0 ? `You are ranked #${userRank}` : 'Join the practice to appear on the leaderboard'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.username}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                entry.username === userProfile?.username
                  ? 'bg-purple-500/20 border-purple-400'
                  : 'bg-slate-700/50 border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500 text-yellow-900' :
                  index === 1 ? 'bg-gray-400 text-gray-900' :
                  index === 2 ? 'bg-amber-600 text-amber-100' :
                  'bg-slate-600 text-slate-200'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="text-white font-medium">{entry.username}</div>
                  <div className="text-slate-400 text-sm">
                    {entry.total_sessions} sessions • {entry.consecutive_days} day streak
                  </div>
                </div>
              </div>
              <div className="text-yellow-400 font-bold flex items-center space-x-1">
                <span>{entry.zen_coins.toLocaleString()}</span>
                <span>🪙</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Zen Coin Menu Component
export const ZenCoinMenu = ({ 
  userProfile, 
  onMoodDiary, 
  onCourses, 
  onAchievements, 
  onLeaderboard,
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-700">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-light text-white mb-2">Zen Coin Hub</h3>
          <ZenCoinDisplay zenCoins={userProfile?.zen_coins || 0} className="justify-center" />
        </div>

        <div className="space-y-3">
          <button
            onClick={onMoodDiary}
            className="w-full p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-left transition-colors border border-slate-600 hover:border-slate-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💝</span>
                <div>
                  <div className="text-white font-medium">Mood Diary</div>
                  <div className="text-slate-400 text-sm">Reflect and earn +5 🪙</div>
                </div>
              </div>
              <span className="text-slate-400">→</span>
            </div>
          </button>

          <button
            onClick={onCourses}
            className="w-full p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-left transition-colors border border-slate-600 hover:border-slate-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📚</span>
                <div>
                  <div className="text-white font-medium">Breathing Courses</div>
                  <div className="text-slate-400 text-sm">Learn and earn 30-100 🪙</div>
                </div>
              </div>
              <span className="text-slate-400">→</span>
            </div>
          </button>

          <button
            onClick={onAchievements}
            className="w-full p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-left transition-colors border border-slate-600 hover:border-slate-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="text-white font-medium">Achievements</div>
                  <div className="text-slate-400 text-sm">View your progress</div>
                </div>
              </div>
              <span className="text-slate-400">→</span>
            </div>
          </button>

          <button
            onClick={onLeaderboard}
            className="w-full p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-left transition-colors border border-slate-600 hover:border-slate-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌟</span>
                <div>
                  <div className="text-white font-medium">Leaderboard</div>
                  <div className="text-slate-400 text-sm">See how you rank</div>
                </div>
              </div>
              <span className="text-slate-400">→</span>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 px-4 bg-slate-600 hover:bg-slate-500 text-white rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};