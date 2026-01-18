type MessageContext = {
  streak: number;
  remaining: number;
  completed: number;
  total: number;
};

const FIRST_COMPLETION_MESSAGES = [
  "First one! Every streak starts somewhere!",
  "HECK YEAH. Day 1. You absolute legend.",
  "The journey of a thousand days begins with one checkbox.",
  "And so it begins... your transformation starts NOW.",
  "First step: CRUSHED. Only infinity more to go!",
];

const SHORT_STREAK_MESSAGES = [
  "Look at you go! {streak} days strong!",
  "{streak} days?! Who even ARE you anymore?!",
  "Your past self would be proud. {streak} days and counting.",
  "{streak} days in a row! You're building momentum!",
  "Day {streak}. The streak is alive and THRIVING.",
];

const MEDIUM_STREAK_MESSAGES = [
  "A whole week! You're unstoppable!",
  "{streak} DAYS. This is getting ridiculous (in the best way).",
  "At this point, the habit is scared of YOU.",
  "{streak} days! Your brain is literally changing shape right now.",
  "Neuroscientists HATE this one weird trick: {streak} days of consistency.",
];

const LONG_STREAK_MESSAGES = [
  "30 DAYS! You've literally rewired your brain!",
  "{streak} days. You're not building habits, you're building a LEGACY.",
  "Scientists want to study you. {streak} days is elite.",
  "{streak} DAYS?! Are you even human anymore?!",
  "At {streak} days, this isn't a habit. It's WHO YOU ARE.",
];

const ALL_COMPLETE_MESSAGES = [
  "You crushed it today! Everything's done!",
  "100% completion rate. Touch grass, you've earned it.",
  "All habits complete. You are the main character today.",
  "Perfect score! Your future self is doing a happy dance.",
  "ALL DONE! The productivity gods smile upon you.",
];

const ENCOURAGEMENT_MESSAGES = [
  "Just {remaining} more to go. You got this!",
  "{remaining} left. That's basically nothing for someone like you.",
  "Future you is going to be SO grateful. {remaining} to go.",
  "{completed}/{total} done. Keep that momentum rolling!",
  "Already {completed} down! {remaining} more and you're golden.",
];

const MORNING_MESSAGES = [
  "New day, new opportunities. Let's do this!",
  "Rise and grind! (But like, in a healthy way.)",
  "Today's a fresh start. What habit are we crushing first?",
  "Good morning, future habit master!",
];

const NOT_STARTED_MESSAGES = [
  "Ready when you are! Let's knock one out.",
  "Your habits are waiting. Time to shine!",
  "Today's still young. Let's get after it!",
  "The best time to start was yesterday. The second best time is NOW.",
  "Those habits won't complete themselves! (Unfortunately.)",
];

const NO_HABITS_MESSAGES = [
  "No habits yet? Let's change that!",
  "Your habit journey is about to begin...",
  "Ready to become a better you? Add your first habit!",
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function interpolate(message: string, context: MessageContext): string {
  return message
    .replace(/{streak}/g, String(context.streak))
    .replace(/{remaining}/g, String(context.remaining))
    .replace(/{completed}/g, String(context.completed))
    .replace(/{total}/g, String(context.total));
}

export function getStreakMessage(streak: number): string {
  const context: MessageContext = { streak, remaining: 0, completed: 0, total: 0 };

  if (streak === 1) {
    return interpolate(randomPick(FIRST_COMPLETION_MESSAGES), context);
  }
  if (streak <= 6) {
    return interpolate(randomPick(SHORT_STREAK_MESSAGES), context);
  }
  if (streak <= 29) {
    return interpolate(randomPick(MEDIUM_STREAK_MESSAGES), context);
  }
  return interpolate(randomPick(LONG_STREAK_MESSAGES), context);
}

export function getDashboardMessage(
  completed: number,
  remaining: number,
  total: number,
  highestStreak: number
): string {
  const context: MessageContext = {
    streak: highestStreak,
    remaining,
    completed,
    total,
  };

  if (total === 0) {
    return randomPick(NO_HABITS_MESSAGES);
  }

  if (remaining === 0 && completed > 0) {
    return interpolate(randomPick(ALL_COMPLETE_MESSAGES), context);
  }

  if (completed === 0) {
    // Check time of day for appropriate message
    const hour = new Date().getHours();
    if (hour < 12) {
      return randomPick(MORNING_MESSAGES);
    }
    return randomPick(NOT_STARTED_MESSAGES);
  }

  return interpolate(randomPick(ENCOURAGEMENT_MESSAGES), context);
}

export function getCompletionCelebration(streak: number): string {
  if (streak === 1) {
    return randomPick([
      "First one down!",
      "You did it!",
      "That's one!",
      "Boom! Started!",
    ]);
  }
  if (streak <= 6) {
    return randomPick([
      `${streak} days! Nice!`,
      `Day ${streak}!`,
      `${streak} and counting!`,
      "Keep it going!",
    ]);
  }
  if (streak <= 29) {
    return randomPick([
      `${streak} days strong!`,
      `Unstoppable! ${streak}!`,
      `${streak} days!`,
      "You're on fire!",
    ]);
  }
  return randomPick([
    `${streak} DAYS!`,
    `LEGENDARY: ${streak}!`,
    `${streak}! Incredible!`,
    "You're a machine!",
  ]);
}
