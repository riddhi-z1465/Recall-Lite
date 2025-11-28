# Recall Lite

A "Second Brain" web app where users can save links, extract text, and chat with the content.

## Features

- **Add Link**: Save URLs, extract text, and generate embeddings.
- **Chat**: Chat with your saved documents using RAG (Retrieval Augmented Generation).
- **Authentication**: Secure login with Supabase.
- **Optimistic UI**: Instant feedback when adding links.
- **Streaming**: Real-time chat responses.

## Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Postgres, Vector), Vercel AI SDK
- **AI**: OpenAI (Embeddings + Chat)

## Setup

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd recall-lite
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env.local` file with the following:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    OPENAI_API_KEY=your-openai-api-key
    ```

4.  **Supabase Setup**:
    - Create a new Supabase project.
    - Enable the `vector` extension.
    - Run the SQL migration in `supabase/migrations/20240101000000_init.sql` and `supabase/migrations/20240101000001_match_page.sql` in the Supabase SQL Editor.

5.  **Run the app**:
    ```bash
    npm run dev
    ```

6.  **Open**: [http://localhost:3000](http://localhost:3000)

## License

MIT
