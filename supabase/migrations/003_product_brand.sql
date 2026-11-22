-- =============================================================================
-- Migration 003: add brand to products (used for the shop's brand filter)
-- Run once in the Supabase SQL editor. Safe to re-run.
-- =============================================================================

alter table public.products add column if not exists brand text;

create index if not exists products_brand_idx on public.products (lower(brand));

notify pgrst, 'reload schema';
