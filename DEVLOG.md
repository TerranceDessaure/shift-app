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

## Day 10 – Oct 27, 2026

**Goal:** Make the manager's schedule easier to read, with shifts grouped by day
and an hours summary per employee with a 40-hour overtime flag.

**What I did:**
- Changed the schedule to start on **Monday of the current week** and cover two
  full weeks (Monday–Saturday). Overtime is counted per week, and the old
  "today + 14 days" window could split a week in half. On Sundays, it starts
  with the upcoming Monday since the store is closed.
- Created `src/dates.js` for shared date helpers: `toDateString`, `addDays`,
  `getMonday`, and `formatDay` ("2026-10-27" → "Tue, Oct 27")
- Added `hoursForShift` to `src/hours.js` so one call replaces
  `shiftHours(timeToHours(...), timeToHours(...))`
- Built `src/WeekView.jsx`, used twice ("This week" and "Next week"):
  - Each day Monday–Saturday with its shifts, or "No shifts"
  - "Hours this week" for each employee, most hours first
  - **⚠ Overtime** next to anyone over 40 hours
- Edit and Delete still work from inside the week view

**Key ideas:**
- **Functions as props:** `ManagerSchedule` passes `onEdit={startEdit}` and
  `onDelete={handleDelete}` into `WeekView`. WeekView only displays shifts and
  calls those functions when a button is clicked, so all the database code
  stays in one place and WeekView can be reused for both weeks.
  - Pass the function itself (`onEdit={startEdit}`, no `() =>`); the
    component that attaches it to a button adds the `() =>`.
- **Totaling hours is GROUP BY + SUM in JavaScript:** an object keyed by
  employee ID, adding each shift's hours to that person's running total.
- `addDays` copies the date first with `new Date(date)`, because `setDate`
  changes a date in place and would otherwise change the original too.

**New JavaScript concepts:**
- `.filter()` keeps items that match a condition (Python: `[s for s in shifts if ...]`)
- `.includes()` checks if an array has a value (Python: `in`)
- `Object.values(obj)` gives a list of an object's values (Python: `dict.values()`)
- `.sort((a, b) => b.hours - a.hours)` sorts most hours first
- `.map((day) => { ... return (...); })` – braces let me calculate something
  before returning the JSX
- `Number(x.toFixed(2))` rounds to 2 decimals (7.666666 → 7.67)
- `toLocaleDateString("en-US", {...})` formats dates in a readable way

**Problems & fixes:**
- Page wouldn't load after updating `ManagerSchedule.jsx` → part of the old
  shift list was still there, including a `</ul>` with no opening `<ul>`, plus
  functions I had removed the import for. Fix: delete everything between the
  second `<WeekView />` and the closing `</div>`.
- `ReferenceError: date is not defined` at `dates.js:11` → the name in
  `addDays(...)`'s parentheses didn't match the name used inside the function.
- Lesson: "X is not defined" means the code uses a name that was never created
  there. The first line of the error gives the file and line number, and the
  lines under it show the chain of calls that led there
  (ManagerSchedule → getMonday → addDays).

**Challenge:** limit the date picker to the two-week window with `min` and `max`
- (note whether I tried it and how it went)

**Next:** Copying last week's schedule into the next week, the last big manager
feature before Week 3's employee screens and chat.

## Day 11 – Oct 28, 2026

**Goal:** Let the manager copy this week's schedule into next week with one click,
then adjust whatever's different.

**What I did:**
- Wrote a database function, `copy_week`, that clears next week's shifts and
  copies this week's shifts forward 7 days, then returns how many it copied
- Added a **Copy this week to next week** button to `ManagerSchedule.jsx`:
  - If next week is empty → "Copy this week's N shift(s) to next week?"
  - If next week has shifts → warns that copying will **replace** them
  - If this week is empty → refuses, so next week can't get wiped by accident
- Tested copying into an empty week, replacing a week, and canceling

**Why the copy happens in the database:**
"Replace next week" is two steps: delete, then insert. If the app sent them
as two separate requests and the second one failed, next week would be left
empty. Inside one database function, everything runs as a single
**transaction**: either every step succeeds, or none of them do.

**New SQL concepts:**
- **Transaction** – a group of steps that all succeed or all get undone
- **`insert ... select`** – the rows to insert come from a query instead of `values`
- **`shift_date + 7`** – adding a number to a date adds that many days
- **`between ... and ...`** – same as my SQL class
- **`get diagnostics v_count = row_count`** – how many rows the last statement affected
- **When to use `security definer`:** only when a function truly needs to get
  past the locks (like `check_invite` for people who aren't logged in).
  `copy_week` runs with the caller's permissions, so Row Level Security still
  applies, plus `is_manager()` gives a clear error. Two locks instead of one.

**New JavaScript concepts:**
- `.length` counts the items in an array (Python: `len()`)
- Dates in `YYYY-MM-DD` format can be compared as text, because alphabetical
  order matches date order (same reason "09:00" < "17:00" works for times)
- A ternary can pick between two messages: `nextWeekCount > 0 ? "replace..." : "copy..."`

**Interview answer to remember:**
"I moved the copy into a database function so a failure partway through
couldn't leave the schedule half-deleted."

**Next:** Day 12 – managers create invite codes inside the app, so adding a new
employee never needs the SQL Editor.

## Day 12 – Oct 28, 2026

**Goal:** Let managers create invite codes inside the app, so adding a new
employee never needs the SQL Editor.

**What I did:**
- Added a policy so managers can see, create, and delete their restaurant's
  invite codes (until now, that table was completely locked)
- Wrote a database function, `create_invite`, that makes a random code like
  `7F3A-B21C` and saves it with the role, restaurant, creator, and a 7-day expiration
- Built `src/InviteCodes.jsx` and added it to the manager's screen in `Home.jsx`:
  - Pick a role and click **Create code**
  - **Copy** button to paste the code into a text message
  - List of the 20 newest codes: **Active** (with expiration date),
    **Used by [name]**, or **Expired**
  - **Revoke** button on unused codes
- Tested the full loop: created a code, signed up a new user with it, and saw
  "Used by [name]" plus the new person in the schedule dropdown

**Why the database creates the code:**
The app only sends the role. The database fills in the restaurant
(`my_restaurant_id()`), the manager who made it (`auth.uid()`), and the
expiration, so none of it can be tampered with from the browser. A made-up
role still gets rejected by the table's `check` rule.

**New SQL concepts:**
- Building a random code, from the inside out:
  - `gen_random_uuid()` → a long random ID
  - `::text` → converts it to text (`::` changes a value's type)
  - `md5(...)` → scrambles it into letters a–f and digits
  - `substr(..., 1, 4)` → first 4 characters (Python: `text[0:4]`)
  - `||` → joins text together (Python: `+`)
  - `upper(...)` → all capitals
- Foreign keys are named automatically as `table_column_fkey`

**New JavaScript / Supabase concepts:**
- **Choosing which link to follow:** `invite_codes` points to `profiles` twice
  (`created_by` and `used_by`), so I name the exact foreign key:
  `profiles!invite_codes_used_by_fkey(full_name)`. In SQL terms, it's choosing
  which column to `JOIN ... ON`.
- **`?.` (optional chaining):** `invite.used_by_profile?.full_name` gets the name
  if it exists, instead of crashing when it doesn't
- **`??`:** use the right side if the left is empty
  (`name ?? "someone"`, similar to Python's `name or "someone"`)
- `.order("created_at", { ascending: false }).limit(20)` =
  `ORDER BY created_at DESC LIMIT 20`
- `navigator.clipboard.writeText(...)` copies text (only works on secure
  pages: `localhost` or `https`)
- A ternary side can only be one item, so two components need a fragment:
  `<><ManagerSchedule /><InviteCodes /></>`

**Good to know:**
- Emails are in **Authentication → Users** or `select email from auth.users;`
- Passwords are stored scrambled (hashed), so nobody can read them, not even me.
- For a forgotten TEST password, I can set a new one in the SQL Editor:
  `update auth.users set encrypted_password = extensions.crypt('new-password', extensions.gen_salt('bf')) where email = '...';`
  (Testing only. Real users will get a "Forgot password?" link later.)

**Problems & fixes:**
- Couldn't find `<ManagerSchedule profile={profile} />` in `ManagerSchedule.jsx`
  → it's in `Home.jsx`, the file that decides which screen to show.
  Tip: **Ctrl + Shift + F** searches every file in the project.
- Forgot a test account's password → passwords can't be looked up; reset it
  with the SQL above, or make a new test user with a fresh invite code.

**Next:** Day 13 – the employee schedule: my shifts, hours with and without
the break, and my weekly total.

## Day 13 – Nov 3, 2026

**Goal:** Give employees their schedule: their shifts, hours with and without
the break, and weekly totals.

**What I did:**
- Added shared helpers:
  - `dates.js`: `weekDays` (Monday–Saturday of a week) and `formatTime`
    ("17:30:00" → "5:30 PM")
  - `hours.js`: `hoursForShiftWithBreak` and `roundHours`
- Refactored `WeekView.jsx` to use `weekDays` instead of building the list itself
- Built `src/MySchedule.jsx`:
  - This week and next, Monday–Saturday, with "Off" on days I'm not working
  - "(today)" label, friendly times, hours per shift, and weekly totals
  - A **Compare with a 30-minute break** checkbox that shows both numbers
- Everyone gets My schedule (managers work shifts too); managers also get
  their tools below it
- No database changes: the Day 8 "Employees can read their own shifts"
  policy already allowed this

**Key ideas:**
- **Refactoring:** changing code without changing what it does. `weekDays`
  was needed in two places, so it became a shared function (DRY).
- My Day 2 function `shiftHoursWithBreak` now powers a real feature!
- `.eq("employee_id", profile.id)` is still needed even with RLS, because
  managers can read every shift, and this screen should show only mine.

**New JavaScript / React concepts:**
- `%` (modulo) gives the remainder: `17 % 12` = 5, so 17:00 → 5 PM.
  `12 % 12` = 0, so noon and midnight become 12.
- Checkboxes use `checked` (not `value`), and `event.target.checked` is true/false
- One true/false state (`showBreaks`) controls every "with break" number at once
- A list of objects (`weeks`) lets one `.map()` draw both weeks

**Problems & fixes:**
- "Identifier `formatDay` has already been declared" → I added a new import
  line instead of updating the existing one, so `formatDay` was imported twice.
  Lesson: when updating an import, change the existing line from that file.

---

## Day 14 – Nov 3, 2026

**Goal:** Show employees who they're working with, but only on days they work too.

**What I did:**
- Wrote a database function, `my_coworkers`, that returns coworkers' shifts on
  the days I'm working: just the date, name, role, and times
- Updated `MySchedule.jsx` to load coworkers and show "Working with:" under
  each day I work, with each person's role and shift times
- Tested with two employees: shared days show each other; days off show nothing

**Why a function instead of a policy:**
Policies control which ROWS someone can read, not which COLUMNS. A policy
letting employees read coworkers' profiles would also expose phone numbers.
The function returns exactly the six columns the screen needs and nothing else.
This is the **principle of least privilege**: give out only what's needed.

**New SQL concepts:**
- `returns table (...)` – a function that returns rows with exactly these columns
- `in (subquery)` – the subquery finds MY work dates, and `in` keeps only
  coworker shifts on those dates (Python: `if date in my_dates`)
- Using the same table twice with different aliases (`s` and `mine`)
- `<>` means "not equal" (same as `!=`)
- Testing it in the SQL Editor returns no rows, because the editor isn't
  logged in as an app user, so `auth.uid()` is empty. The real test is in the app.

**New React concepts:**
- Two requests (my shifts + my coworkers), matched up by date with `.filter()`
- A list inside a list: each day's `<li>` holds its own `<ul>` of coworkers

**Problems & fixes:**
- (fill in anything that went wrong)

**Challenge:** mark coworkers whose hours overlap mine
- (note whether I tried it)

---

## Day 15 – Nov 3, 2026

**Goal:** Give the whole app a consistent look and make it comfortable on a phone.

**What I did:**
- Replaced `src/index.css` with my own stylesheet: colors, cards, buttons,
  inputs, lists, and text helpers
- Added classes across the app: a sticky header with Log out, cards around each
  section, and button styles (`secondary`, `danger`, `small`)
- Deleted the unused `App.css` and changed the browser tab title in `index.html`
- Tested on phone sizes with the browser's device toolbar

**CSS basics:**
- A rule = which elements + how to style them
- Selectors: by type (`button`), by class (`.card`), combined (`button.danger`)
- JSX uses `className` because `class` is a reserved word in JavaScript
- **Variables:** define `--color-primary` once, use `var(--color-primary)` everywhere
- **padding** = space inside the border; **margin** = space outside it
- **rem** = relative to the base text size (1rem ≈ 16px)
- **`display: flex`** lines up children; `justify-content: space-between`
  pushes them apart; `flex-direction: column` + `gap` stacks them evenly
- **`position: sticky; top: 0`** keeps the header at the top while scrolling
- **`max-width` + `margin: 0 auto`** keeps content readable and centered
- **`box-sizing: border-box`** stops inputs from overflowing their box
- `:hover`, `:focus`, and `:last-child` style elements in certain situations

**Mobile-first:**
- Most coworkers will use phones, so phone styles come first, and
  `@media (min-width: 640px)` adds adjustments for bigger screens
- Inputs use 16px text so iPhones don't zoom in
- Buttons are at least 44px tall so they're easy to tap

**Problems & fixes:**
- (fill in anything that went wrong)

---

## Day 16 – Nov 3, 2026

**Goal:** Polish the design: tabs for managers, cleaner schedule layouts,
and labeled form fields.

**What I did:**
- Created `src/config.js` with `APP_NAME`, so renaming the app is one line
  (plus the `<title>` in `index.html`)
- Added manager tabs in `Home.jsx`: My schedule, Team schedule, Invite codes
- Redesigned My schedule (employees and managers): dates on the left, details
  on the right, today highlighted, "Off" in gray, neater coworker list
- Redesigned the Team schedule (managers): friendly times, bold names,
  Edit/Delete lined up on the right, a blue highlight while editing, and a
  formatted date range
- Added labels to the shift form, with date/start/end side by side on wide screens

**Key ideas:**
- **Hiding tabs is NOT security.** Employees can't use manager tools because
  Row Level Security blocks them in the database. The screen is for
  convenience; the database is for security.
- One state value (`tab`) controls which screen shows, like `editingId`
- **Labels** make tap targets bigger and let screen readers announce each field
- Styles belong in the CSS file, not inline in JSX, so they're easy to find
  (the `editing` class replaced the inline `fontWeight` style)

**New CSS concepts:**
- **`display: grid`** with `grid-template-columns: 6.5rem 1fr`: a fixed date
  column, and the details take the rest (`1fr` = one share of leftover space)
- `repeat(3, 1fr)` = three equal columns (only on wider screens)
- `flex: 1` gives each tab an equal share of the width
- `flex-wrap: wrap` lets buttons drop to the next line on narrow screens
- `.tab.active` (no space) = an element with BOTH classes
- A ternary can pick a class: `className={tab === "mine" ? "tab active" : "tab"}`

**Problems & fixes:**
- "showBreaks is not defined" in `App.jsx` → I pasted the new My schedule
  layout into `App.jsx` instead of `MySchedule.jsx`. Fix: restored `App.jsx`
  and pasted the code into the right file.
  Lesson: check the editor tab's file name before pasting.
- Tip: the **Source Control** panel shows what changed in each file since my
  last commit, and right-click → **Discard Changes** restores a file.
- Ctrl + Shift + M did nothing → the shortcut only works after clicking inside
  the developer tools panel. Or click the phone-and-tablet icon in its top-left corner.

**Next:** Day 17 – make the app installable to the home screen with its own icon.

## Day 17 – Nov 3, 2026

**Goal:** Make the app installable, so it gets its own icon on the home screen
and opens full-screen like a real app.

**What I did:**
- Added three icons to the `public` folder: `icon-192.png`, `icon-512.png`,
  and `apple-touch-icon.png` (a blue calendar with a check mark)
- Created `public/manifest.webmanifest` with the app's name, icons, colors,
  and `"display": "standalone"`
- Linked the manifest, Apple icon, and theme color in `index.html`, and
  replaced the tab icon
- Checked it in F12 → Application → Manifest, then installed it on my computer
  (it opened in its own window with no address bar) and uninstalled it

**Key ideas:**
- A **web app manifest** is what makes a website installable. It tells the
  phone the app's name, icon, colors, and how to open.
- Anything in `public` is served as-is at the root of the site
  (`public/icon-192.png` → `localhost:5173/icon-192.png`)
- `"display": "standalone"` removes the browser's address bar and buttons
- `short_name` shows under the icon, so keep it 12 characters or fewer
- **Maskable** icons survive Android cropping them into circles or squircles
- iPhones ignore the manifest's icons and use `apple-touch-icon.png` (180×180)
- Skipped the **service worker** (offline support): browsers no longer need
  one to install, and a live schedule needs the internet anyway
- Phones can't reach `localhost`, so installing on my phone waits until the
  app is online with an `https` address (Day 19)
- The app name now lives in 4 places: `config.js`, the `<title>` and
  `apple-mobile-web-app-title` in `index.html`, and the manifest

**JSON rules:**
- Every key needs double quotes
- No comments and no trailing commas (no comma after the last item)
- One mistake and the whole file is ignored

**Problems & fixes:**
- Couldn't find `index.html` → I was looking at `src/index.css`. `index.html`
  is in the main `shift-app` folder, outside `src`. Tip: **Ctrl + P** opens any
  file by name.
- "Manifest: Line 1, column 1, Syntax error" → the very first character was
  wrong, which usually means the browser got the app's HTML page instead of
  the manifest (file not found or misnamed), or the file started with leftover
  text like ```json. Test: open `localhost:5173/manifest.webmanifest`
  directly and see what comes back.
- Downloading the icons: click each file card → download, then drag them from
  Downloads into `shift-app/public`

---

## Making the repo public – Nov 3, 2026

- Wrote a GitHub **About** section (description + topics like react, supabase,
  postgresql, row-level-security)
- Rewrote `README.md`: features, tech stack, how security works, setup steps,
  project structure, and roadmap
- Safety check before going public: `git log --all -- .env.local` returned
  nothing, so my keys were never committed
- The publishable Supabase key being public is fine, because Row Level Security
  protects the data. The secret/service_role key must never be in the code.
- Idea for later: add screenshots (with test names, not real coworkers)

---

## Day 18 – Nov 5, 2026

**Goal:** Require two-factor login (2FA) with an authenticator app for everyone.

**What I did:**
- Added **restrictive** policies on `profiles`, `shifts`, and `invite_codes`
  so the database refuses everything unless the login is verified with 2FA
- Added a 2FA check inside `my_coworkers`
- Built `src/TwoFactor.jsx`:
  - First login: shows a QR code (and a key to type in manually), then
    asks for the 6-digit code to finish setup
  - Every login after: just asks for the code
  - A Log out button in case someone gets stuck
- Updated `App.jsx` to check the login level and show TwoFactor until it's verified
- Tested setup, logging back in, a wrong code, refreshing, and a test employee

**How 2FA works:**
- **aal1** = password only; **aal2** = password + verified 6-digit code
- The QR code holds a secret key. My authenticator app and the database both
  know it, so the app makes a new code every 30 seconds and the database can
  check it without sending any texts. That's why it's free.
- The rule for the whole app: nothing works until you're at aal2

**Why the database enforces it:**
Hiding screens isn't security (Day 16 lesson). If only the app checked,
someone with just a password could still talk to the database directly.

**New SQL concepts:**
- **Permissive vs. restrictive policies:** permissive policies combine with OR;
  a restrictive policy combines with AND, so it adds "...and you've done 2FA"
  on top of every existing rule without rewriting them
- `auth.jwt() ->> 'aal'` reads the