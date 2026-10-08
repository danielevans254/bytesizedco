-- Byte Sized Co. own-the-list schema.
-- Paste into the Supabase SQL editor and run. Safe to re-run.
--
-- Beehiiv stays the sending platform. These tables are the copy you own, so the
-- list survives changing providers.
--
-- Security model: RLS is ON with NO policies, so the anon and authenticated keys
-- can read and write nothing. Only SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS
-- and is server-only, can touch these. Never expose that key to the browser and
-- never prefix it with NEXT_PUBLIC_.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- signups ----
create table if not exists public.waitlist_signups (
  id          uuid primary key default gen_random_uuid(),
  email       text        not null unique,
  source      text,                       -- "Landing Waitlist" | "Pre-order Intent"
  interests   text,                       -- comma separated, from the chips
  utm_source  text,                       -- flattened for easy grouping
  attribution jsonb       not null default '{}'::jsonb,
  ip          inet,                       -- personal data under GDPR: keep for
                                          -- abuse prevention, purge on request
  created_at  timestamptz not null default now()
);

create index if not exists waitlist_signups_created_at_idx on public.waitlist_signups (created_at desc);
create index if not exists waitlist_signups_utm_source_idx on public.waitlist_signups (utm_source);

alter table public.waitlist_signups enable row level security;

-- -------------------------------------------------------------- preorders ----
-- No unique constraint on email: reserving twice is legitimate, not a duplicate.
create table if not exists public.preorders (
  id          uuid primary key default gen_random_uuid(),
  email       text        not null,
  name        text        not null,
  address     text,
  items       jsonb       not null default '[]'::jsonb,
  subtotal    integer     not null default 0,
  shipping    integer     not null default 0,
  total       integer     not null default 0,
  attribution jsonb       not null default '{}'::jsonb,
  ip          inet,
  created_at  timestamptz not null default now()
);

create index if not exists preorders_created_at_idx on public.preorders (created_at desc);
create index if not exists preorders_email_idx on public.preorders (email);

alter table public.preorders enable row level security;

-- ------------------------------------------------------------------ views ----
-- Which channels actually produce signups. This is the Gate 1 question.
create or replace view public.signups_by_source as
select
  coalesce(utm_source, 'direct') as utm_source,
  source,
  count(*)                       as signups,
  min(created_at)                as first_seen,
  max(created_at)                as last_seen
from public.waitlist_signups
group by 1, 2
order by signups desc;
