-- Run this in your Supabase SQL Editor to fix the missing columns

-- Ensure 'documents' table has all required columns
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS url text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS excerpt text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id uuid references auth.users on delete cascade;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Ensure 'chunks' table has all required columns (just in case)
CREATE TABLE IF NOT EXISTS public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents on delete cascade not null,
  chunk_index integer not null,
  text text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);
