-- Run this in your Supabase SQL Editor to fix the schema mismatch

-- 1. Add the missing 'excerpt' column to the documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS excerpt text;

-- 2. Rename document_chunks to chunks if you have the old table name
-- The code expects the table to be called 'chunks'
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_chunks') THEN
        ALTER TABLE public.document_chunks RENAME TO chunks;
    END IF;
END $$;

-- 3. Ensure the chunks table exists (if it wasn't renamed)
CREATE TABLE IF NOT EXISTS public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents on delete cascade not null,
  chunk_index integer not null,
  text text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- 4. Enable RLS on chunks
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;

-- 5. Add RLS policies for chunks if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'chunks' AND policyname = 'Users can insert chunks for their own documents'
    ) THEN
        CREATE POLICY "Users can insert chunks for their own documents"
          ON public.chunks FOR INSERT
          WITH CHECK (exists (
            select 1 from public.documents
            where documents.id = chunks.document_id
            and documents.user_id = auth.uid()
          ));
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies WHERE tablename = 'chunks' AND policyname = 'Users can select chunks of their own documents'
    ) THEN
        CREATE POLICY "Users can select chunks of their own documents"
          ON public.chunks FOR SELECT
          USING (exists (
            select 1 from public.documents
            where documents.id = chunks.document_id
            and documents.user_id = auth.uid()
          ));
    END IF;
END $$;
