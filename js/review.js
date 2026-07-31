/* The review queue (phase 2 finale).
 *
 * Collects every question the scheduler says is due, fetches its lesson
 * page, and lifts the question straight out of the HTML. The lessons ARE
 * the flashcard database — one source of truth, nothing duplicated. This
 * is also the site's first taste of rung 3: fetching HTML over the wire
 * and swapping it into the page. Lesson 14 walks through it.
 */

const progress = srsLoad();

const due = Object.entries(progress)
  .filter(([, entry]) => srsIsDue(entry))
  .map(([key, entry]) => {
    const [path, anchor] = key.split('#');
    return { key, path, index: Number(anchor.slice(1)), entry };
  });

const intro = document.getElementById('review-intro');
const area = document.getElementById('review-area');
const status = document.getElementById('review-status');

function renderStatus() {
  const remaining = area.querySelectorAll('.review-card').length;
  const streak = srsStreak();
  status.textContent = [
    remaining
      ? `${remaining} question${remaining === 1 ? '' : 's'} to go.`
      : 'Nothing due. Come back tomorrow.',
    streak ? `Streak: ${streak.count} day${streak.count === 1 ? '' : 's'}.` : '',
  ].filter(Boolean).join(' ');
}

/* Fetch a lesson page and parse it into a detached document. Scripts in
 * a DOMParser document never run, so the questions we lift out are the
 * pristine HTML — no injected grading buttons to strip. */
async function fetchLesson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${response.status} for ${path}`);
  const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
  return {
    title: doc.querySelector('h1')?.textContent ?? path,
    questions: [...doc.querySelectorAll('.quiz details')],
  };
}

function buildCard(item, lesson) {
  const details = lesson.questions[item.index];
  if (!details) return null; // the lesson changed shape; skip gracefully

  const card = document.createElement('article');
  card.className = 'review-card';

  const source = document.createElement('p');
  source.className = 'review-source';
  const link = document.createElement('a');
  link.href = item.path;
  link.textContent = lesson.title;
  source.append('From: ', link);

  const controls = document.createElement('p');
  controls.className = 'quiz-controls';
  controls.append('Did you have it? ');
  for (const [label, result] of [['Got it', 'right'], ['Not yet', 'wrong']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      srsRecord(progress, item.key, result);
      card.remove();
      renderStatus();
    });
    controls.append(button);
  }

  details.append(controls);
  card.append(source, details);
  return card;
}

(async () => {
  intro.hidden = true;
  area.hidden = false;

  const paths = [...new Set(due.map(item => item.path))];
  for (const path of paths) {
    let lesson;
    try {
      lesson = await fetchLesson(path);
    } catch {
      continue; // a page that won't load shouldn't sink the whole queue
    }
    for (const item of due.filter(d => d.path === path)) {
      const card = buildCard(item, lesson);
      if (card) area.append(card);
    }
  }
  renderStatus();
})();
