-- Create a function to search document chunks by vector similarity
create or replace function match_document_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id text
)
returns table (
  id uuid,
  content text,
  document_id uuid,
  document_title text,
  document_url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.content,
    d.id as document_id,
    d.title as document_title,
    d.url as document_url,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  join documents d on dc.document_id = d.id
  where d.user_id = user_id::uuid
  and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
