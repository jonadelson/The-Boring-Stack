/* Home-page progress badges (phase 2).
 *
 * This script changes no stored data. It reads the quiz results the
 * lesson pages stored and annotates the lesson list — possible because
 * localStorage is shared per origin: every page on this site sees the
 * same store. Lesson 12 explains the model.
 */

const progress = srsLoad();

/* Stored keys look like "/lessons/06-forms.html#q2" (plus any hosting
 * prefix). Fold them into per-page tallies, and count what's due. */
const byPath = {};
let dueCount = 0;
for (const [key, entry] of Object.entries(progress)) {
  const path = key.split('#')[0];
  const counts = (byPath[path] ??= { right: 0, wrong: 0 });
  if (entry && (entry.result === 'right' || entry.result === 'wrong')) {
    counts[entry.result] += 1;
  }
  if (srsIsDue(entry)) dueCount += 1;
}

/* anchor.pathname is the link's resolved absolute path — the same form
 * location.pathname had when the lesson page stored its keys, so the two
 * match without any path arithmetic. */
for (const link of document.querySelectorAll('.lesson-list a')) {
  const counts = byPath[link.pathname];
  if (!counts || (!counts.right && !counts.wrong)) continue;

  const badge = document.createElement('span');
  badge.className = 'lesson-progress';
  badge.textContent = [
    counts.right ? `${counts.right} ✓` : '',
    counts.wrong ? `${counts.wrong} ✗` : '',
  ].filter(Boolean).join(' ');
  link.closest('li').append(' ', badge);
}

const reviewLink = document.getElementById('review-link');
if (reviewLink && dueCount > 0) {
  reviewLink.textContent = `Review queue — ${dueCount} due`;
}
