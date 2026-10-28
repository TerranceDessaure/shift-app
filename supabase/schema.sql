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

-- ---------- SIGN-UP ----------

-- When a new login is created, validate the invite code and create their profile
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(new.raw_user_meta_data ->> 'invite_code'));
  v_invite invite_codes%rowtype;
begin
  -- Find a valid, unused, unexpired code
  select * into v_invite
  from invite_codes
  where code = v_code
    and used_by is null
    and expires_at > now()
  for update;

  -- No valid code: cancel the whole sign-up
  if not found then
    raise exception 'Invalid or expired invite code';
  end if;

  -- Create their profile; the role comes from the code
  insert into profiles (id, restaurant_id, username, full_name, phone, role)
  values (
    new.id,
    v_invite.restaurant_id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'full_name',
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    v_invite.role
  );

  -- Mark the code as used
  update invite_codes set used_by = new.id where code = v_code;

  return new;
end;
$$;

-- Run the function every time a new login is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Logged-in users can read their own profile (and only their own)
drop policy if exists "Users can read their own profile" on profiles;
create policy "Users can read their own profile"
  on profiles for select
  to authenticated
  using (id = auth.uid());


----------- Week 2 ----------------

----------- Day 8 -------------------

-- Creating a manage account

insert into invite_codes (code, restaurant_id, role, expires_at)
value (
  'MGR-2026',
  (
   select id 
   from restaurants limit 1
   ),
  'manager',
  now() + interval '30 days'
);


-- ------------- Helpers ---------------

-- The restaurnt of whoever is logged in
create or replace function my_restaurant_id()
return uuid
language sql
stable
security definer
ser search_path = public
as $$
  select restaurant_id 
  from profiles
  where id = auth.uid();
$$;

-- Is whoever is logged in a mananger?
create or replace function is_manager()
return boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid() and role = 'manager'
  );
$$;

-- --------- Manager & Shift Policies -------------

-- Managers can see everyone in their restaurant
drop policy if exists "Managers can read their team" on profiles;
create policy "Managers can read their team"
  on profiles for select
  to authenticated
  using (is_manager() and restaurant_id = my_restaurant_id());

-- Manager can create, read, change, and delete their restaurant's shifts
drop policy if exists "Managers can manage shifts" on shifts;
create policy "Managers can manage shifts"
  on shifts for all
  to authenticated
  using (is_manager() and restaurant_id = my_restaurt_id())
  with check (is_manager() and restaurant_id = my_restauran_id());

-- Employees can read their own shifts
drop policy if exists "Employees can read their own shifts" on shifts;
create policy "Employees can read their own shifts"
  on shift for select
  to authenticated
  using (employee_id = auth.uid());

-- ---------- COPY WEEK ----------

-- Copy one week's shifts (Monday–Saturday) into the following week,
-- replacing whatever was there. Returns how many shifts were copied.
create or replace function copy_week(p_from_monday date)
returns integer
language plpgsql
as $$
declare
  v_restaurant uuid := my_restaurant_id();
  v_count integer;
begin
  if not is_manager() then
    raise exception 'Only managers can copy schedules';
  end if;

  -- Clear next week
  delete from shifts
  where restaurant_id = v_restaurant
    and shift_date between p_from_monday + 7 and p_from_monday + 13;

  -- Copy this week's shifts, moved forward 7 days
  insert into shifts (restaurant_id, employee_id, shift_date, start_time, end_time)
  select restaurant_id, employee_id, shift_date + 7, start_time, end_time
  from shifts
  where restaurant_id = v_restaurant
    and shift_date between p_from_monday and p_from_monday + 6;

  -- How many rows the insert just added
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function copy_week(date) to authenticated;

-- ---------- INVITE CODES (MANAGER) ----------

-- Managers can see, create, and delete their restaurant's invite codes
drop policy if exists "Managers can manage invite codes" on invite_codes;
create policy "Managers can manage invite codes"
  on invite_codes for all
  to authenticated
  using (is_manager() and restaurant_id = my_restaurant_id())
  with check (is_manager() and restaurant_id = my_restaurant_id());

-- Create a random invite code for a role; returns the new code
create or replace function create_invite(p_role text)
returns text
language plpgsql
as $$
declare
  v_code text;
begin
  if not is_manager() then
    raise exception 'Only managers can create invite codes';
  end if;

  -- Random code like 7F3A-B21C
  v_code := upper(
    substr(md5(gen_random_uuid()::text), 1, 4) || '-' ||
    substr(md5(gen_random_uuid()::text), 1, 4)
  );

  insert into invite_codes (code, restaurant_id, role, created_by, expires_at)
  values (v_code, my_restaurant_id(), p_role, auth.uid(), now() + interval '7 days');

  return v_code;
end;
$$;

grant execute on function create_invite(text) to authenticated;


