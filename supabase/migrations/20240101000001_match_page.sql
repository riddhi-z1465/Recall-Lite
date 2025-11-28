create or replace function match_page_sections (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_document_id uuid
)
returns table (
  id uuid,
  document_id uuid,
  text text,
  similarity float
)
language plpgsql
stable
as $$
begin
  return query (
    select
      chunks.id,
      chunks.document_id,
      chunks.text,
      1 - (chunks.embedding <=> query_embedding) as similarity
    from chunks
    join documents on documents.id = chunks.document_id
    where 1 - (chunks.embedding <=> query_embedding) > match_threshold
    and documents.user_id = auth.uid()
    and chunks.document_id = filter_document_id
    order by chunks.embedding <=> query_embedding
    limit match_count
  );
end;
$$;
