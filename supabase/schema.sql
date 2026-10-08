-- =========================================
-- SHIFT APP DATABASE
-- Safe to re-run: skips anything that already exists
-- =========================================


-- ---------- TABLES ----------

-- The restaurant
create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Employees and managers (linked to Supabase's login table)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id),
  username text not null unique,
  full_name text not null,
  phone text,
  role text not null check (role in ('front_of_house', 'back_of_house', 'manager')),
  created_at timestamptz not null default now()
);

-- Shifts
create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id),
  employee_id uuid not null references profiles(id) on delete cascade,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

-- Invite codes
create table if not exists invite_codes (
  code text primary key,
  restaurant_id uuid not null references restaurants(id),
  role text not null check (role in ('front_of_house', 'back_of_house', 'manager')),
  created_by uuid references profiles(id),
  used_by uuid references profiles(id),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);


-- ---------- SECURITY ----------

-- Lock every table until we write access rules
alter table restaurants enable row level security;
alter table profiles enable row level security;
alter table shifts enable row level security;
alter table invite_codes enable row level security;


-- ---------- FUNCTIONS ----------

-- Check whether an invite code is valid; returns its role, or null
create or replace function check_invite(p_code text)
returns text
language sql
security definer
set search_path = public
as $$
  select role from invite_codes
  where code = p_code
    and used_by is null
    and expires_at > now();
$$;

grant execute on function check_invite(text) to anon, authenticated;


-- ---------- TEST DATA ----------

-- Add the restaurant, only if there isn't one yet
insert into restaurants (name)
select 'My Store'
where not exists (select 1 from restaurants);

-- Add a test invite code, skip if it already exists
insert into invite_codes (code, restaurant_id, role, expires_at)
values (
  'TEST-1234',
  (select id from restaurants limit 1),
  'front_of_house' as [Front of House],
  now() + interval '7 days'
)
on conflict (code) do nothing;