-- Fix for "null value in column content of relation chunks"
-- The 'chunks' table has a 'content' column that is NOT NULL, but the code uses 'text'.
-- We need to remove the 'content' column (or make it nullable) and ensure 'text' is used.

-- 1. Make 'content' nullable in 'chunks' table (so inserts don't fail)
ALTER TABLE public.chunks ALTER COLUMN content DROP NOT NULL;

-- 2. If you want to clean up, you can drop the column entirely (optional, but recommended if unused)
-- ALTER TABLE public.chunks DROP COLUMN content;

-- 3. Ensure 'text' column exists and is NOT NULL (since code relies on it)
-- (We update nulls to empty string first to avoid errors when setting NOT NULL)
UPDATE public.chunks SET text = '' WHERE text IS NULL;
ALTER TABLE public.chunks ALTER COLUMN text SET NOT NULL;
