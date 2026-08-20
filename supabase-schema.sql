create table meals (
  id uuid primary key default gen_random_uuid(),
  meal_date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  author text not null check (author in ('me', 'wife')),
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_meals_date on meals (meal_date);

create table weekly_plan_items (
  id uuid primary key default gen_random_uuid(),
  planned_date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner')),
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_weekly_plan_items_date on weekly_plan_items (planned_date);
create unique index idx_weekly_plan_items_slot on weekly_plan_items (planned_date, meal_type);
