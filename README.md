# Shift App

A mobile-friendly scheduling web app for a small restaurant team. Managers build the schedule; employees see their shifts, their hours, and who they're working with, all in one place instead of a printed schedule passed around a group chat.

> **Status:** In active development. The scheduling features below are working; deployment and team chat are next.

## Features

**For employees**
- Sign up with an invite code from a manager
- See this week's and next week's shifts, with days off marked
- Hours per shift and weekly totals, with a toggle to compare hours with a 30-minute break
- See which coworkers are working the same day, with their roles and shift times
- Install it to the phone's home screen like a native app

**For managers**
- Build a two-week schedule (Monday–Saturday), with shift times checked against store hours
- Edit and delete shifts, or copy this week's schedule into next week in one click
- Weekly hours summary per employee, with an overtime flag over 40 hours
- Create, copy, and revoke invite codes for new hires, and see which codes have been used

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, JavaScript, Vite, CSS |
| Backend | Supabase: PostgreSQL, authentication, Row Level Security |
| Installable app | Web app manifest (PWA) |
| Version control | Git and GitHub |

## How security works

Access rules live in the database, not just the app, so they can't be bypassed by tampering with the browser:

- **Row Level Security** on every table. Employees can read only their own profile and shifts; managers can manage their own restaurant's schedule and invite codes.
- **Roles come from the invite code**, assigned by a database trigger at sign-up, so nobody can make themselves a manager.
- **Least-privilege functions.** The coworker list comes from a database function that returns only names, roles, and shift times (never phone numbers), and only for days the employee is working.
- **Transactions.** Copying a week runs inside one database function, so a failure partway through can't leave the schedule half-deleted.

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS)
- A free [Supabase](https://supabase.com) project

### Setup
1. Clone the repo and install dependencies:
   ```
   git clone https://github.com/YOUR-USERNAME/shift-app.git
   cd shift-app
   npm install
   ```
2. In your Supabase project's SQL Editor, run `supabase/schema.sql` to create the tables, policies, and functions.
3. Create a `.env.local` file in the project folder with your Supabase project URL and publishable key:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```
4. Start the app:
   ```
   npm run dev
   ```
   Then open http://localhost:5173. Press Ctrl + C in the terminal to stop it.

## Project structure

```
shift-app/
├── public/              Icons and the web app manifest
├── src/
│   ├── App.jsx          Decides between login/sign-up and the home screen
│   ├── Home.jsx         Header, welcome, and manager tabs
│   ├── Login.jsx        Email and password login
│   ├── SignUp.jsx       Two-step sign-up with an invite code
│   ├── MySchedule.jsx   Employee schedule, break comparison, coworkers
│   ├── ManagerSchedule.jsx  Add, edit, delete, and copy shifts
│   ├── WeekView.jsx     One week of shifts with the hours summary
│   ├── InviteCodes.jsx  Create, copy, and revoke invite codes
│   ├── dates.js         Date helpers
│   ├── hours.js         Shift hour and break calculations
│   ├── roles.js         Role display names
│   ├── config.js        App name
│   └── index.css        Styles
├── supabase/
│   └── schema.sql       Full database setup: tables, policies, functions
└── DEVLOG.md            Day-by-day development log
```

## Roadmap

- [x] Invite-code sign-up, login, and persistent sessions
- [x] Manager scheduling: add, edit, delete, copy week
- [x] Weekly hours summary and overtime flag
- [x] In-app invite codes
- [x] Employee schedule with break comparison
- [x] Coworkers on shared days
- [x] Mobile-friendly design
- [x] Installable to the home screen
- [ ] Two-factor login
- [ ] Deploy online with Vercel
- [ ] Trial run with coworkers
- [ ] Team chat: group chat and direct messages

## Development log

I'm documenting the whole build, including the bugs and how I fixed them, in [DEVLOG.md](DEVLOG.md).

## Author

Terrance Dessaure
