-- SQL from zero: the guided tour from lesson 16, runnable end to end.
--
--   createdb boringstack
--   psql -d boringstack -f server/db/sql-from-zero.sql
--
-- The domain is this site's own future: questions and their reviews,
-- the data the spaced-repetition engine will keep in Postgres once
-- phase 3 adds sync.

-- A table is a contract: every row will have this shape, and the
-- database ENFORCES it — unlike localStorage, which stored whatever
-- string we handed it.
CREATE TABLE questions (
  id     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lesson text NOT NULL,
  prompt text NOT NULL
);

CREATE TABLE reviews (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id integer NOT NULL REFERENCES questions (id),
  result      text NOT NULL CHECK (result IN ('right', 'wrong')),
  reviewed_at timestamptz NOT NULL,
  next_due    date NOT NULL
);

INSERT INTO questions (lesson, prompt) VALUES
  ('http',  'What does it mean that HTTP is stateless?'),
  ('http',  'What is the difference between HTTP and HTTPS?'),
  ('forms', 'Why does an unnamed input submit nothing?'),
  ('css',   'How does dark mode work without JavaScript?');

INSERT INTO reviews (question_id, result, reviewed_at, next_due) VALUES
  (1, 'right', '2026-07-25 09:12+00', '2026-07-26'),
  (1, 'right', '2026-07-26 08:40+00', '2026-08-01'),
  (2, 'wrong', '2026-07-26 08:44+00', '2026-07-26'),
  (3, 'right', '2026-07-28 21:03+00', '2026-07-29'),
  (2, 'wrong', '2026-07-30 07:55+00', '2026-07-30'),
  (4, 'right', '2026-07-30 08:01+00', '2026-08-05');

-- Reading: SELECT chooses columns, WHERE chooses rows.
SELECT prompt, lesson FROM questions WHERE lesson = 'http';

-- ORDER BY + LIMIT: the newest three reviews.
SELECT question_id, result, reviewed_at
FROM reviews
ORDER BY reviewed_at DESC
LIMIT 3;

-- Aggregation: collapse rows into answers about rows.
SELECT result, count(*) FROM reviews GROUP BY result;

-- The join: reviews store question IDs, not prompts — no duplication.
-- JOIN reunites them: everything due on or before August 1st.
SELECT q.prompt, r.next_due
FROM reviews AS r
JOIN questions AS q ON q.id = r.question_id
WHERE r.next_due <= '2026-08-01'
ORDER BY r.next_due;

-- Constraints earn their keep by SAYING NO. Both of these fail on
-- purpose; run them and read the errors.
--   INSERT INTO reviews (question_id, result, reviewed_at, next_due)
--     VALUES (99, 'right', now(), '2026-08-02');   -- no question 99
--   INSERT INTO reviews (question_id, result, reviewed_at, next_due)
--     VALUES (1, 'maybe', now(), '2026-08-02');    -- 'maybe' isn't allowed
