-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- Create documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  url text not null,
  title text not null,
  content text,
  excerpt text,
  created_at timestamptz default now()
);

-- Create chunks table
create table chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents on delete cascade not null,
  chunk_index integer not null,
  text text not null,
  embedding vector(1536)
);

-- Enable RLS
alter table documents enable row level security;
alter table chunks enable row level security;

-- RLS Policies for documents
create policy "Users can insert their own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can select their own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can update their own documents"
  on documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on documents for delete
  using (auth.uid() = user_id);

-- RLS Policies for chunks
-- Chunks are accessible if the parent document belongs to the user
create policy "Users can select chunks of their own documents"
  on chunks for select
  using (
    exists (
      select 1 from documents
      where documents.id = chunks.document_id
      and documents.user_id = auth.uid()
    )
  );

-- Function to match documents (for vector search)
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
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
    order by chunks.embedding <=> query_embedding
    limit match_count
  );
end;
$$;
