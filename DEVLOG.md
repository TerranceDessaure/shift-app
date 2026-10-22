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

## Day 5 – Oct 8, 2026

**Goal:** Connect the React app to Supabase and check a manager's invite code from the app.

**What I did:**
- Installed Supabase's library: `npm install @supabase/supabase-js`
- Saved my Project URL and publishable key in `.env.local` (never pushed to GitHub)
- Created `src/supabaseClient.js`, the one place the app connects to the database
- Wrote a database function, `check_invite`, that returns a code's role if it
  exists, is unused, and hasn't expired
- Added my restaurant and test invite codes (`TEST-1234` valid, `OLD-1234` expired)
- Built `src/InviteCheck.jsx`: type a code, the app asks the database, and it shows the result
- Challenges: friendly role names with a lookup object, and codes now work in any capitals

**How it works (the big picture):**
- The database is a filing cabinet, and every drawer (table) is locked with Row Level Security
- A new hire isn't signed up yet, so they can't open the invite codes drawer
- `check_invite` is like a receptionist: it has the key, looks up the one code,
  and only returns the answer, so visitors never see the table itself
- `security definer` gives the function the owner's permissions
- `grant execute ... to anon, authenticated` lets the app call it, even before login

**New React concepts:**
- `useState` lets a component remember values that change, like typed text;
  the screen redraws automatically when they change
- `async` / `await` waits for the database to answer (same idea as Python)
- `supabase.rpc("function_name", {...})` calls a database function
- Supabase always returns `{ data, error }`, so check for the error first
- `event.preventDefault()` stops a form from reloading the page

**My workflow:**
- Supabase runs the SQL; `supabase/schema.sql` is the written record,
  backed up through VS Code and GitHub
- If SQL changes the database, it goes in schema.sql. If it only reads data, it doesn't.
- Clear the SQL Editor box (Ctrl + A, Delete) before pasting new code

**Problems & fixes:**
- "Failed to resolve import @supabase/supabase-js" → the library wasn't installed.
  Run `npm install` from the project folder and check package.json.
- Blank page, "supabaseUrl is required" (found with F12 → Console) → the variable
  names in `.env.local` didn't match the code. Found it by adding
  `console.log(import.meta.env)` to see what the app was actually receiving.
- `.env.local` changes only load after restarting the server (Ctrl + C, then `npm run dev`)
- "null value in column restaurant_id violates not-null constraint" → the restaurants
  table was empty. The "Failing row" detail showed which column was empty.
- Valid code showed as invalid → old and new SQL were pasted together; the old
  code errored first, so the new code never ran.
- Codes were case-sensitive → fixed with `.trim().toUpperCase()`

**What I learned:**
- Read error messages carefully; they usually name the exact problem
- Print what the code sees (`console.log`) instead of guessing
- Never put the secret/service_role key in the app

**Next:** Day 6 – build the sign-up form and create real user accounts.
## Day 6 – Oct 21, 2026

**Goal:** Build the sign-up form and create real user accounts.

**What I did:**
- First I went into Supabase and changed one setting. Today's goal was to get real
  user accounts working, and Supabase sends every new user a confirmation email by
  default. Its free email service only sends a few per hour and rejects fake emails,
  so I turned **Confirm email** off for testing. (Turn it back on before real users join!)
- Next I walked through how the database handles sign-up:
  - The app sends the person's email, password, details (full name, username, phone),
    and their invite code to Supabase all at once.
  - Supabase creates their login in its own `auth.users` table.
  - That fires a **trigger** (an automatic "when X happens, do Y" rule), which runs my
    `handle_new_user` function. It checks the invite code again, creates their row in
    `profiles`, and marks the code as used.
  - If the code is bad, the function raises an error and the whole sign-up is cancelled,
    so no account gets created.
- Added my first access rule (policy): logged-in users can read their own profile, and only theirs.
- Built `src/SignUp.jsx`, which replaced `InviteCheck.jsx`. Step 1 checks the code,
  then step 2 shows the details form.
- Tested it: created a test user, confirmed their profile has the right role, and
  confirmed the used code gets rejected the second time.

**Why the role comes from the code:**
The role is set by the invite code the manager made, never by what the person types.
That way nobody can make themselves a manager.

**New SQL concepts:**
- `language plpgsql`: a function with steps and logic (variables, `if`), not just one query
- `new`: inside a trigger, the row that was just created
- `raw_user_meta_data ->> 'username'`: pulls one value out of the extra details,
  like `data["username"]` in Python
- `raise exception`: stops everything and undoes the sign-up
- `auth.uid()`: the ID of whoever is logged in

**New React concepts:**
- One component can show two screens: `if (!role)` returns the code form; once the
  code is valid, `setRole` fills it in and React redraws with the details form
- `supabase.auth.signUp()` creates the login, and `options.data` holds the extra details
- `type="email"`, `type="password"`, `type="tel"` and `required` get the browser
  to check and format inputs for me
- Always re-check on the server. The screen alone can be tampered with.

**Problems & fixes:**
- My Supabase project may get paused after about a week of no activity.
  Fix: click **Restore project** on the dashboard; the data is kept.
- White screen, error on `import SignUp from "./SignUp"` → I created `SignUp.jsx`
  as a folder again. Fix: right-click `src` → **New File** (the menu says it in words).
- "Email address is invalid" and then a rate-limit error → Supabase was still trying to
  send confirmation emails because I never clicked **Save** after turning it off.
- Testing tip: Gmail `+` addresses (`myname+test1@gmail.com`) give me unlimited
  real test emails that all land in my inbox.

**Next:** Day 7 – login screen, staying logged in, and logging out. 