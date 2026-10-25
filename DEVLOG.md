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

## Day 7 – Oct 22, 2026

**Goal:** Let people log in, stay logged in, and log out, so the app knows who is using it.

**What I did:**
- Moved shared code into its own files:
  - `src/roles.js` – the role display names (used by more than one screen now)
  - `src/hours.js` – my shift hour calculations, saved for Week 2
- Built `src/Login.jsx` – email and password login with an error message on failure
- Built `src/Home.jsx` – loads the logged-in person's profile and shows
  "Welcome, [name]!" with their username, role, and a Log out button
- Rewrote `src/App.jsx` – it checks whether someone is logged in and shows
  either the Home screen or the Login/Sign up screens
- Tested: log in, refresh, close and reopen the tab, log out, wrong password,
  and signing up a new user (which logs them in automatically)

**How login works (the big picture):**
- A **session** is Supabase's proof that someone is logged in. Supabase saves it
  in the browser, which is how people stay logged in after refreshing.
- When the app opens, it checks for a saved session (`getSession`), showing
  "Loading..." until it knows, so the login screen doesn't flash.
- A **listener** (`onAuthStateChange`) tells the app every time someone logs in
  or out, and the app switches screens automatically. That's why the login
  form doesn't need a success message.

**New React concepts:**
- **`useEffect`** – runs code after the screen appears. Loading data goes here.
  - `[]` at the end = run once when it first appears
  - `[session]` = run again only when `session` changes
  - returning a function = cleanup when the component goes away
- **Props** – passing information into a component, like function arguments:
  `<Home session={session} />` → `function Home({ session })`
- **Ternary** – a one-line if/else: `condition ? a : b`
  (Python: `a if condition else b`)
- **`!`** flips true/false, so `setShowSignUp(!showSignUp)` toggles screens
- **Fragments** `<>...</>` – an invisible wrapper to group elements
- **Imports:** `export default` → `import Login from "./Login"` (no braces).
  A plain `export` → `import { roleNames } from "./roles"` (braces, exact name).

**Reading from the database in the app:**
`supabase.from("profiles").select("full_name, username, role").eq("id", ...).single()`
is the same as:
`select full_name, username, role from profiles where id = '...';`
`.single()` returns one object instead of an array.
This only works because of the Day 6 policy: logged-in users can read their own profile.

**Week 1 complete:** sign-up with invite codes, login, logout, and staying logged in.

**Next:** Week 2 – the manager's scheduling screen: creating and editing shifts.

## Day 8 – Oct 25, 2026

**Goal:** Start Week 2 by building the manager's scheduling screen, so a manager can
add shifts for employees and see the next two weeks.

**What I did:**
- Created a manager invite code (`MGR-2026`) and signed up as a manager
- Wrote access rules (policies) so that:
  - Managers can see everyone in their restaurant
  - Managers can create, read, change, and delete their restaurant's shifts
  - Employees can read their own shifts (the screen for this comes in Week 3)
- Added `timeToHours` to `src/hours.js` to turn "09:30" into 9.5
- Built `src/ManagerSchedule.jsx`:
  - A form to add a shift: employee dropdown, date, start time, end time
  - Checks store hours before saving (9–9 weekdays, 10–5 Saturday, closed Sunday)
  - A list of shifts for the next two weeks with each shift's hours
- Updated `Home.jsx` to show the schedule only to managers

**Why the policies needed helper functions:**
The rule "managers can read profiles" has to check the profiles table to find out
if you're a manager, which is a rule checking itself (infinite recursion).
The fix was two helpers, `my_restaurant_id()` and `is_manager()`, which use
`security definer` to look up my info, the same receptionist trick as `check_invite`.

**New SQL concepts:**
- `stable` – the function gives the same answer during one query, so Postgres runs it once
- `exists (select 1 ...)` – true if at least one row matches
- `for all` – a policy covering select, insert, update, and delete
- `using` decides which existing rows I can see or touch;
  `with check` decides which new or changed rows are allowed
- Multiple policies combine with OR, so each person gets exactly what they need

**New JavaScript / React concepts:**
- Joins in Supabase: `employee:profiles(full_name, role)` pulls the employee's
  name along with each shift, like a SQL join
- `.gte()` / `.lte()` = greater/less than or equal, my `BETWEEN` for two weeks
- `<select>` and `<option>` make a dropdown; the name shows, the ID gets saved
- `type="date"` and `type="time"` give built-in pickers, even on phones
- Destructuring: `const [hours, minutes] = ...` unpacks an array, like Python
- `getDay()` returns 0 (Sunday) to 6 (Saturday)
- Times like "09:00" can be compared as text because they're always two digits
- JavaScript's built-in date conversion uses UTC, which can turn late-night
  dates into tomorrow, so I format dates with my own `toDateString` helper

**Good to know:**
- Emails are stored in Supabase's built-in `auth.users` table, not in `profiles`.
  Passwords are stored scrambled (hashed), and the app can't read other people's emails.

**Problems & fixes:**
- `npm error Missing script: "dev"` → the terminal was in VS Code's program folder,
  not my project. Fix: `cd "$HOME\Desktop\shift-app"`, or open the folder first.
- Manager dropdown only showed the manager → I wrote the new SQL in `schema.sql`
  but never ran it in Supabase. Lesson: write it in the file, THEN run it in the
  SQL Editor. Nothing changes in the database until it's run there.

**Next:** Editing and deleting shifts, then the two-week view and the hours
summary with the overtime flag.

## Day 9 – Oct 25, 2026

**Goal:** Let the manager edit and delete shifts.

**What I did:**
- Rewrote `src/ManagerSchedule.jsx` so the same form handles adding AND editing
- Each shift in the list now has **Edit** and **Delete** buttons
- **Edit** fills the form with that shift's details, bolds it in the list, and
  switches the form to "Edit shift" with **Save changes** and **Cancel** buttons
- **Delete** asks "Are you sure?" before removing the shift
- Moved the store hours check into its own function, `validateShift`, so adding
  and editing both use it
- No database changes needed: the Day 8 "Managers can manage shifts" policy
  used `for all`, which already covers update and delete
- Tested: editing times, changing the employee, canceling an edit, moving a shift
  to Sunday (rejected), and deleting with both Cancel and OK

**Key ideas:**
- **DRY (Don't Repeat Yourself):** when the same logic is needed in two places,
  put it in one function. If store hours change, there's one place to update.
- **One state value can control a whole screen:** `editingId` is `null` in
  "add" mode or a shift's ID in "edit" mode. The heading, button text, and
  Cancel button all check it.
- **Update vs. insert:** a ternary picks which request to send:
  `editingId ? update(...) : insert(...)`
- `.update(shiftData).eq("id", editingId)` is SQL's
  `update shifts set ... where id = '...'`. The `.eq()` is critical; without it,
  I'd be asking to change every shift (Supabase blocks that as a safety net).
- `.delete().eq("id", shift.id)` works the same way.

**New JavaScript / React concepts:**
- **Spread operator:** `{ ...shiftData, restaurant_id: ... }` copies an object
  and adds to it (Python: `{**shift_data, "restaurant_id": ...}`)
- **`onClick={() => startEdit(shift)}`**, NOT `onClick={startEdit(shift)}`.
  The second one runs the function immediately while the list is drawn.
  If I need to pass something in, wrap it in `() =>`.
- **`type="button"`** on non-submit buttons, because buttons inside a form
  submit it by default (Cancel would have saved instead of canceling)
- **`window.confirm()`** shows an OK/Cancel popup and returns true or false
- **Inline styles:** `style={{ fontWeight: "bold" }}`. The outer braces mean
  "JavaScript here," the inner braces are an object. CSS's `font-weight`
  becomes `fontWeight`.

**Next:** A two-week view grouped by day, and an hours summary per employee
with the 40-hour overtime flag.