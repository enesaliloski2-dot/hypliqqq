-- NORYX platform schema. Run with `supabase db push` or in the SQL editor.
create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer','admin');
create type public.account_status as enum ('active','restricted','closed');
create type public.card_status as enum ('not_issued','application_pending','active','frozen','closed');
create type public.application_status as enum ('submitted','under_review','approved','rejected','issued');
create type public.ticket_status as enum ('open','in_progress','resolved','closed');
create type public.ticket_priority as enum ('low','normal','high');
create type public.founding_status as enum ('registered','eligibility_review','eligible','ineligible');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role public.user_role not null default 'customer',
  status public.account_status not null default 'active',
  onboarding_done boolean not null default false,
  notify_email boolean not null default true,
  notify_product boolean not null default true,
  notify_alerts boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.profiles (email);

create table public.wallet_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chain text not null check (chain in ('evm','solana')),
  provider text not null,
  address text not null,
  network text not null,
  is_active boolean not null default true,
  last_connected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, chain, address)
);
create index on public.wallet_connections (user_id);

create table public.card_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.application_status not null default 'submitted',
  country text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.card_applications (user_id);

-- Card records hold issuer references only. Never PAN or CVV.
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.card_status not null default 'not_issued',
  issuer_reference text,
  last4 text check (last4 is null or length(last4) = 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index on public.cards (user_id);

create table public.card_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id uuid references public.cards(id) on delete set null,
  issuer_transaction_id text,
  merchant text,
  amount_minor bigint not null,
  currency text not null,
  settled_asset text,
  status text not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index on public.card_transactions (user_id, occurred_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, body text not null,
  read_at timestamptz, created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null, body text not null,
  status public.ticket_status not null default 'open',
  priority public.ticket_priority not null default 'normal',
  assigned_to uuid references public.profiles(id),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.support_tickets (user_id);

create table public.founding_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.founding_status not null default 'registered',
  admin_notes text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);
insert into public.platform_settings (key, value) values
  ('waitlist_open', 'true'), ('founding_promotion_status', '"planned"'), ('card_availability_label', '"Early access — not yet issued"');

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  resource_type text not null,
  resource_id text,
  outcome text not null default 'ok',
  details jsonb,
  created_at timestamptz not null default now()
);
create index on public.audit_logs (created_at desc);

-- Profile is created from auth metadata on signup. Role is ALWAYS customer here.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''));
  insert into public.cards (user_id) values (new.id);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger t_profiles before update on public.profiles for each row execute procedure public.touch_updated_at();
create trigger t_apps before update on public.card_applications for each row execute procedure public.touch_updated_at();
create trigger t_cards before update on public.cards for each row execute procedure public.touch_updated_at();
create trigger t_tickets before update on public.support_tickets for each row execute procedure public.touch_updated_at();

-- Row Level Security: customers see only their own rows; admins see everything. Role column is never user-editable.
alter table public.profiles enable row level security;
alter table public.wallet_connections enable row level security;
alter table public.card_applications enable row level security;
alter table public.cards enable row level security;
alter table public.card_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.founding_registrations enable row level security;
alter table public.platform_settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "profile: own read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profile: own update (no role/status change)" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles p where p.id = auth.uid()) and status = (select status from public.profiles p where p.id = auth.uid()));
create policy "profile: admin update" on public.profiles for update using (public.is_admin());

create policy "wallets: own" on public.wallet_connections for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "wallets: admin read" on public.wallet_connections for select using (public.is_admin());

create policy "apps: own read" on public.card_applications for select using (user_id = auth.uid() or public.is_admin());
create policy "apps: own insert" on public.card_applications for insert with check (user_id = auth.uid());
create policy "apps: admin update" on public.card_applications for update using (public.is_admin());

create policy "cards: own read" on public.cards for select using (user_id = auth.uid() or public.is_admin());
create policy "cards: admin update" on public.cards for update using (public.is_admin());

create policy "tx: own read" on public.card_transactions for select using (user_id = auth.uid() or public.is_admin());

create policy "notif: own" on public.notifications for select using (user_id = auth.uid());
create policy "notif: own mark read" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "tickets: own read" on public.support_tickets for select using (user_id = auth.uid() or public.is_admin());
create policy "tickets: own insert" on public.support_tickets for insert with check (user_id = auth.uid());
create policy "tickets: admin update" on public.support_tickets for update using (public.is_admin());

create policy "founding: own read" on public.founding_registrations for select using (user_id = auth.uid() or public.is_admin());
create policy "founding: own insert" on public.founding_registrations for insert with check (user_id = auth.uid());
create policy "founding: admin update" on public.founding_registrations for update using (public.is_admin());

create policy "settings: read all" on public.platform_settings for select using (true);
create policy "settings: admin write" on public.platform_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "audit: admin read" on public.audit_logs for select using (public.is_admin());
create policy "audit: admin insert" on public.audit_logs for insert with check (public.is_admin() and actor_id = auth.uid());

-- Grant admin (run as the database owner / service role, never from the app):
--   update public.profiles set role = 'admin' where email = 'owner@example.com';
