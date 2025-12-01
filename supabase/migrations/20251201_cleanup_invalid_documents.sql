-- Clean up documents with invalid UUID format (old integer IDs)
-- This will delete any documents where the ID is not a valid UUID

-- First, let's see what we're dealing with (this is just for logging)
-- You can run this query first to see which documents will be deleted

-- Delete chunks associated with invalid document IDs
DELETE FROM chunks 
WHERE document_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Note: We cannot directly delete documents with invalid UUIDs because 
-- the ID column is of type UUID and won't accept invalid values.
-- If you have documents with integer IDs, they were likely created with 
-- a different schema. You'll need to manually delete them from the Supabase dashboard.

-- To find and delete them manually:
-- 1. Go to Supabase Dashboard > Table Editor > documents
-- 2. Look for any rows with IDs that don't look like UUIDs
-- 3. Delete those rows manually
