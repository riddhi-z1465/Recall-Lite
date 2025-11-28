-- Enable pgvector extension for vector similarity search
create extension if not exists vector with schema public;

-- Create documents table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users on delete cascade,
  metadata jsonb
);

-- Create document_chunks table with vector storage
create table if not exists public.document_chunks (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents on delete cascade not null,
  content text not null,
  content_tokens integer not null,
  embedding vector(1536) not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for document_chunks for faster similarity search
create index on public.document_chunks using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create index for faster document lookups by user
create index idx_documents_user_id on public.documents (user_id);

-- Create index for faster chunk lookups by document
create index idx_document_chunks_document_id on public.document_chunks (document_id);

-- Set up Row Level Security (RLS)
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;

-- Create policies for documents
create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Create policies for document_chunks
create policy "Users can view their own document chunks"
  on public.document_chunks for select
  using (exists (
    select 1 from public.documents
    where documents.id = document_chunks.document_id
    and documents.user_id = auth.uid()
  ));

create policy "Users can insert chunks for their own documents"
  on public.document_chunks for insert
  with check (exists (
    select 1 from public.documents
    where documents.id = document_chunks.document_id
    and documents.user_id = auth.uid()
  ));

create policy "Users can update their own document chunks"
  on public.document_chunks for update
  using (exists (
    select 1 from public.documents
    where documents.id = document_chunks.document_id
    and documents.user_id = auth.uid()
  ));

create policy "Users can delete their own document chunks"
  on public.document_chunks for delete
  using (exists (
    select 1 from public.documents
    where documents.id = document_chunks.document_id
    and documents.user_id = auth.uid()
  ));
