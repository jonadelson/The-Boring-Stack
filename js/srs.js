/* Spaced-repetition core, shared by quiz.js, review.js, and home.js.
 *
 * Loaded before them via its own script tag — plain deferred scripts run
 * in document order, the boring pre-modules way to share code. (ES modules
 * are the modern answer; they arrive when a build-free reason does.)
 *
 * Lesson 14 walks through the scheduler.
 */

const SRS_KEY = 'boring-stack:quiz';
const STREAK_KEY = 'boring-stack:streak';
const DAY_MS = 24 * 60 * 60 * 1000;

function srsLoad() {
  try {
    return JSON.parse(localStorage.getItem(SRS_KEY)) ?? {};
  } catch {
    return {}; // corrupted storage should never break the page
  }
}

function srsSave(progress) {
  localStorage.setItem(SRS_KEY, JSON.stringify(progress));
}

/* The scheduler — a two-button simplification of SM-2, the 1987 SuperMemo
 * algorithm that still powers Anki. Every success stretches the next gap
 * by the card's ease factor; every failure makes the card due again now
 * and lowers its ease, so a hard card's gaps grow more slowly forever.
 * The ?? defaults also quietly migrate phase-2 entries recorded before
 * scheduling existed: no interval yet reads as "brand new card". */
function srsSchedule(previous, result) {
  const ease = previous?.ease ?? 2.5;
  const interval = previous?.interval ?? 0;

  if (result === 'wrong') {
    return { interval: 0, ease: Math.max(1.3, ease - 0.2) };
  }
  return {
    interval: interval === 0 ? 1 : interval === 1 ? 6 : Math.round(interval * ease),
    ease: ease + 0.05,
  };
}

function srsRecord(progress, key, result) {
  const next = srsSchedule(progress[key], result);
  progress[key] = {
    result,
    at: new Date().toISOString(),
    due: new Date(Date.now() + next.interval * DAY_MS).toISOString(),
    ...next,
  };
  srsSave(progress);
  srsBumpStreak();
  return progress[key];
}

function srsIsDue(entry) {
  if (!entry) return false;
  /* Entries from before scheduling existed have no due date — treat them
   * as due, so old progress flows into the queue instead of stranding. */
  return new Date(entry.due ?? entry.at) <= new Date();
}

/* Streak: consecutive calendar days with at least one graded answer. */
function srsStreak() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY)) ?? null;
  } catch {
    return null;
  }
}

function srsBumpStreak() {
  const today = new Date().toDateString();
  const current = srsStreak();
  if (current?.day === today) return current;

  const yesterday = new Date(Date.now() - DAY_MS).toDateString();
  const next = { day: today, count: current?.day === yesterday ? current.count + 1 : 1 };
  localStorage.setItem(STREAK_KEY, JSON.stringify(next));
  return next;
}
