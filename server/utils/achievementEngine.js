/**
 * achievementEngine.js
 * Analyzes user stats and streak to award badges.
 */

const BADGES = [
  {
    id: 'FIRST_PROBLEM',
    title: 'First Step',
    icon: '🎯',
    description: 'Solve your first DSA problem.',
    condition: (user) => user.stats?.totalDSASolved >= 1
  },
  {
    id: 'TEN_PROBLEMS',
    title: 'Novice Coder',
    icon: '🥉',
    description: 'Solve 10 DSA problems.',
    condition: (user) => user.stats?.totalDSASolved >= 10
  },
  {
    id: 'FIFTY_PROBLEMS',
    title: 'Algorithm Enthusiast',
    icon: '🥈',
    description: 'Solve 50 DSA problems.',
    condition: (user) => user.stats?.totalDSASolved >= 50
  },
  {
    id: 'HUNDRED_PROBLEMS',
    title: 'Code Master',
    icon: '🏆',
    description: 'Solve 100 DSA problems.',
    condition: (user) => user.stats?.totalDSASolved >= 100
  },
  {
    id: 'FIRST_TASK',
    title: 'Task Master Init',
    icon: '📝',
    description: 'Complete your first study task.',
    condition: (user) => user.stats?.totalTasksDone >= 1
  },
  {
    id: 'TEN_TASKS',
    title: 'Consistent Planner',
    icon: '📅',
    description: 'Complete 10 study tasks.',
    condition: (user) => user.stats?.totalTasksDone >= 10
  },
  {
    id: 'STREAK_3',
    title: 'On a Roll',
    icon: '🔥',
    description: 'Achieve a 3-day active streak.',
    condition: (user) => user.streak?.currentStreak >= 3
  },
  {
    id: 'STREAK_7',
    title: 'Unstoppable',
    icon: '☄️',
    description: 'Achieve a 7-day active streak.',
    condition: (user) => user.streak?.currentStreak >= 7
  }
];

/**
 * Evaluates the user's stats and awards new achievements if conditions are met.
 * @param {Object} user - The mongoose User document.
 * @returns {boolean} - Returns true if new achievements were added (so we can save the user).
 */
const evaluateAchievements = (user) => {
  let newlyAwarded = false;
  
  if (!user.achievements) {
    user.achievements = [];
  }

  const earnedTitles = user.achievements.map(a => a.title);

  BADGES.forEach(badge => {
    // If user hasn't earned this badge yet, and they meet the condition
    if (!earnedTitles.includes(badge.title) && badge.condition(user)) {
      user.achievements.push({
        title: badge.title,
        icon: badge.icon,
        description: badge.description,
        unlockedAt: new Date()
      });
      newlyAwarded = true;
    }
  });

  return newlyAwarded;
};

module.exports = { evaluateAchievements, BADGES };
