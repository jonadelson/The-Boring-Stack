# The Boring Stack

A site for learning the boring technologies that quietly run everything —
HTML, CSS, plain JavaScript, Postgres, HTTP, and security — built *from*
those same technologies. Hand-written HTML and CSS, no framework, no build
step. The site is the curriculum: every feature it gains is a lesson about
the technology that provides it.

## Viewing it

Every page is a plain HTML file — open `index.html` in any browser, or run
the site's own server (no dependencies, phase 3):

    node server/server.js    # → http://localhost:3000

To read it on your phone, enable GitHub Pages: repository **Settings →
Pages → Deploy from a branch**, pick the default branch and the `/ (root)`
folder. The site appears at
`https://jonadelson.github.io/The-Boring-Stack/`.

## The plan

The site grows in phases. Each new layer of complexity is added only when
the current stack genuinely hurts — and the moment it hurts is itself the
lesson about what that layer buys.

1. **Static pages** — HTML and CSS fundamentals. *(complete)*
2. **Interactivity** — quizzes, spaced repetition, and a review queue with
   vanilla JavaScript and localStorage. *(complete)*
3. **A server and Postgres** — when localStorage's limits (no sync across
   devices) start to hurt. *(up next)*
4. **Authentication** — sessions, password hashing, CSRF; security learned
   by building it.
5. **Operations** — deployment, TLS, logs, backups.
6. **Electives** — SQLite, htmx, caching, full-text search, job queues,
   and one deliberate framework "island."

The lesson-by-lesson version lives on the site itself:
[roadmap.html](https://jonadelson.github.io/The-Boring-Stack/roadmap.html).

## Conventions

- Lessons live in `lessons/`, numbered, one HTML file each.
- All styling in `css/style.css`, which is written to be read as a lesson
  itself.
- Quizzes use `<details>`/`<summary>` — native tap-to-reveal, no
  JavaScript.
- `.nojekyll` tells GitHub Pages to serve the files as-is with no Jekyll
  processing.
