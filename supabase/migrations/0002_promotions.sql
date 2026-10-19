-- Promotion configuration and reward ledger. Nothing here credits a customer by itself:
-- reward_records are written only by a backend crediting process with a payment reference.
create type public.promotion_status as enum ('planned','terms_published','open','paused','closed');
create type public.reward_status as enum ('pending','credited','failed','reversed');

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  status public.promotion_status not null default 'planned',
  reward_amount numeric(18,6),
  reward_currency text not null default 'USDT',
  approved_budget numeric(18,2),
  max_qualifying_users integer,
  starts_at timestamptz, ends_at timestamptz,
  eligibility_rules text, geographic_restrictions text, required_disclosures text, terms_url text,
  updated_by uuid references public.profiles(id), updated_at timestamptz not null default now(), created_at timestamptz not null default now()
);
insert into public.promotions (slug, name, reward_amount, max_qualifying_users, eligibility_rules) values
  ('welcome-credit', 'Welcome credit', 30, null, 'Verified account; issued card; identity checks where required.'),
  ('founding-members', 'Founding member program', 5000, 1000, 'Verified account; issued card; one registration per person; anti-abuse screening; supported region.');

create table public.reward_records (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references public.promotions(id),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(18,6) not null, currency text not null,
  status public.reward_status not null default 'pending',
  payment_reference text,                     -- reference from the actual crediting/payment system
  created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (promotion_id, user_id)
);
create trigger t_promotions before update on public.promotions for each row execute procedure public.touch_updated_at();
create trigger t_rewards before update on public.reward_records for each row execute procedure public.touch_updated_at();

alter table public.promotions enable row level security;
alter table public.reward_records enable row level security;
create policy "promotions: read all" on public.promotions for select using (true);
create policy "promotions: admin write" on public.promotions for all using (public.is_admin()) with check (public.is_admin());
create policy "rewards: own read" on public.reward_records for select using (user_id = auth.uid() or public.is_admin());
-- Deliberately no insert/update policy for the app role: credits are written by the backend crediting service (service role) with a payment_reference.

-- Rename the founding queue status label set is unchanged; existing data is preserved.
