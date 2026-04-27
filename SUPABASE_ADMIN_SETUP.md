# Supabase admin setup

## 1. Create the table

Open Supabase SQL Editor and run:

```sql
create table if not exists public.admin_destinations (
  id text primary key,
  region_slug text not null,
  destination jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.admin_destinations enable row level security;
```

The Vercel API uses the Supabase service role key, so the table can stay locked
with RLS and no public policies.

## 2. Create the storage bucket

In Supabase Storage, create a public bucket named:

```text
destination-images
```

## 3. Add Vercel environment variables

In Vercel Project Settings -> Environment Variables, add:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DESTINATIONS_TABLE=admin_destinations
SUPABASE_STORAGE_BUCKET=destination-images
ADMIN_PASSWORD=choose-a-strong-password
```

Use `ADMIN_PASSWORD` to unlock `/admin` on the live site.

## 4. Deploy

Redeploy the Vercel project after adding the variables.
