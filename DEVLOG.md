## Day 2 - October 2, 2026
** Goal: ** Learn JavaScript basics by comparing them to Pyhton.
** What I did:** Wrote shiftHours() and a weekly overtime check.
** Problems & fixes: ** "Cannot find module" error. I had created day2.js 
as a folder, not a file. `ls` shows `d` in the Mode column for folders
** What I learned: ** const vs let, template strings, === vs ==.
** Next:** Day 3

## Day 3 – Oct 2, 2026

**Goal:** Create the real React app, show my weekly shifts on screen, and put the project on GitHub.

**What I did:**
- Created the project with Vite (`npm create vite@latest shift-app -- --template react`)
- Ran it locally with `npm run dev` at http://localhost:5173 (Ctrl+C to stop)
- Rewrote `src/App.jsx` to show my week of shifts with regular hours,
  hours with a break (30 min off only for shifts over 6 hours), a weekly total,
  and an overtime warning over 40 hours
- Created a private GitHub repo and pushed my first commit

**Key files:**
- `package.json` – the project's libraries (like requirements.txt)
- `node_modules/` – installed libraries, never edit
- `src/App.jsx` – the main screen
- `.gitignore` – files Git doesn't save

**What I learned:**
- A React component is a function that returns what shows on screen
- JSX looks like HTML, but anything inside `{ }` is JavaScript
- `.map()` turns each item in an array into something on the page
  (like a Python list comprehension), and each item needs a unique `key`
- Calculations go above the `return`; the `return` describes the screen
- `{condition && <p>...</p>}` shows something only when the condition is true

**Problems & fixes:**
- Blank page: I named the loop variable `shif` but used `shift` inside the loop.
  Lesson: press F12 → Console to see the error and line number.
- Used `shiftHoursWithBreak` where I meant `shiftHours`, so both numbers matched.
- A stray `)` showed up on screen because text in JSX displays as-is.

**Saving to GitHub (every time):**
`git add .` → `git commit -m "message"` → `git push`

**Next:** Day 4 – set up Supabase and design the database.

## Day 4 October 7, 2026

Notes for SQL Editor:

`create table name(...)` makes the able. Each line inside is a column: its name, hten its type

Types: `uuid` is a long random ID, `text is a string`, `date` is a calendar date,   `time` is a time of day, and `timestamptz` is an exact moment (date + time + timezone)

`primary key` marks the unique ID. `default gen_random_uuid()` creates one automatically, and `default now()` fill in th eusrrent time.

`not null` means the column is required. `unique` means no two rows can match, so no duplicate usernames.

` reference restaurant(id)` is a foriegn key. `on delete cascade` mean if an employee us deleted, their shifts are deleted too.

`check (...)` is a rule the database enforces. Here, a role must be one of your three, and a shift can't end before it starts. Even if the app has a bug. bad data can't get in.

The last four lines turn on Row Level Security. Right now no one can read or cahnge anything through the app; the doors are locked. Later  we'll add rules like "employees can only see thier onw shifts and that day's coworkers," which is how we enforce the privacy you asked for. (The SQL Editor has damin access, so it still works for the dev.)