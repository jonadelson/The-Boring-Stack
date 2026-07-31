/* Quiz memory — this site's first JavaScript (phase 2).
 *
 * Progressive enhancement: this file ADDS grading buttons and check marks
 * to the quizzes. Without it, every quiz still works as a plain
 * <details> reveal-the-answer. Nothing in the HTML depends on this script.
 *
 * Lesson 10 walks through this file section by section — read them together.
 */

const STORAGE_KEY = 'boring-stack:quiz';

/* All progress lives under one localStorage key as a JSON object:
 *   { "/lessons/06-forms.html#q2": { result: "right", at: "2026-..." } }
 * localStorage only stores strings, so JSON.parse/stringify at the border. */
function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {}; // corrupted storage should never break the page
  }
}

function saveAll(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/* Each question's identity is the page's URL path plus its position.
 * The address bar as database key — lesson 7 said URLs are identifiers,
 * and here's the payoff. (Also a debt: when phase 3 redesigns the URLs,
 * this stored data will need migrating with them. Noted openly.) */
function keyFor(index) {
  return `${location.pathname}#q${index}`;
}

const progress = loadAll();
const quiz = document.querySelector('.quiz');
const questions = quiz ? [...quiz.querySelectorAll('details')] : [];

/* The score line under the quiz heading. Created from nothing:
 * it exists in the DOM but you won't find it in view-source. */
const tally = document.createElement('p');
tally.className = 'quiz-tally';

function renderQuestion(details, index) {
  /* data-result lands in the HTML as data-result="right" — CSS renders
   * the ✓/✗ from it. JS owns the state; CSS owns the appearance. */
  details.dataset.result = progress[keyFor(index)]?.result ?? '';
}

function renderTally() {
  const got = questions.filter(
    (_, index) => progress[keyFor(index)]?.result === 'right'
  ).length;
  tally.textContent = `${got} of ${questions.length} marked "got it".`;
}

questions.forEach((details, index) => {
  const controls = document.createElement('p');
  controls.className = 'quiz-controls';
  controls.append('Did you have it? ');

  for (const [label, result] of [['Got it', 'right'], ['Not yet', 'wrong']]) {
    const button = document.createElement('button');
    button.type = 'button'; // not inside a form, but a good habit: never submit by accident
    button.textContent = label;
    button.addEventListener('click', () => {
      progress[keyFor(index)] = { result, at: new Date().toISOString() };
      saveAll(progress);
      renderQuestion(details, index);
      renderTally();
    });
    controls.append(button);
  }

  details.append(controls);
  renderQuestion(details, index);
});

if (questions.length > 0) {
  quiz.querySelector('h2').after(tally);
  renderTally();
}
