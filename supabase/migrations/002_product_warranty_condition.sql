-- =============================================================================
-- Migration 002: add warranty period + condition to products
--
-- Run this once in the Supabase SQL editor if your products table already
-- exists. (schema.sql contains the same statements, so re-running it also works.)
-- Safe to re-run.
-- =============================================================================

alter table public.products
  add column if not exists warranty_months integer
    check (warranty_months between 0 and 120);

alter table public.products
  add column if not exists condition text not null default 'new'
    check (condition in ('new', 'used', 'refurbished'));

-- Tell the Supabase API (PostgREST) to pick up the new columns right away.
notify pgrst, 'reload schema';
