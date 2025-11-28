-- Run this in your Supabase SQL Editor to fix the chunks table columns

-- 1. Ensure 'chunks' table has 'chunk_index'
ALTER TABLE public.chunks ADD COLUMN IF NOT EXISTS chunk_index integer;

-- 2. Ensure other required columns exist in 'chunks'
ALTER TABLE public.chunks ADD COLUMN IF NOT EXISTS text text;
ALTER TABLE public.chunks ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE public.chunks ADD COLUMN IF NOT EXISTS document_id uuid references public.documents on delete cascade;
ALTER TABLE public.chunks ADD COLUMN IF NOT EXISTS created_at timestamptz default now();

-- 3. Force a schema cache reload (sometimes needed)
NOTIFY pgrst, 'reload config';
