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