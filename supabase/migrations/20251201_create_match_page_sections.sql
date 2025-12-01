-- Create match_page_sections function to support filtering by document_id
CREATE OR REPLACE FUNCTION match_page_sections (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_document_id uuid
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  text text,
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chunks.id,
    chunks.document_id,
    chunks.text,
    1 - (chunks.embedding <=> query_embedding) AS similarity
  FROM chunks
  JOIN documents ON documents.id = chunks.document_id
  WHERE 1 - (chunks.embedding <=> query_embedding) > match_threshold
  AND documents.user_id = auth.uid()
  AND chunks.document_id = filter_document_id
  ORDER BY chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
