-- 1. The restaurant
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- 2. Employees and managers (linked to Supabase's login table)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id),
  username text not null unique,
  full_name text not null,
  phone text,
  role text not null check (role in ('front_of_house', 'back_of_house', 'manager')),
  created_at timestamptz not null default now()
);

-- 3. Shifts
create table shifts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id),
  employee_id uuid not null references profiles(id) on delete cascade,
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

-- 4. Invite codes
create table invite_codes (
  code text primary key,
  restaurant_id uuid not null references restaurants(id),
  role text not null check (role in ('front_of_house', 'back_of_house', 'manager')),
  created_by uuid references profiles(id),
  used_by uuid references profiles(id),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Lock every table until we write access rules
alter table restaurants enable row level security;
alter table profiles enable row level security;
alter table shifts enable row level security;
alter table invite_codes enable row level security;