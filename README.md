# Recall Lite

A premium "Second Brain" web application where users can save URLs, process content, and chat with it using AI.

## 🚀 Features

- **Add URL**: Scrape, clean, chunk, and embed web pages.
- **Chat**: RAG-based chat with saved content, citing sources.
- **Vector Search**: Semantic search using Supabase Vector.
- **Authentication**: Secure user management with Supabase Auth & RLS.
- **Premium UI**: Dark mode, responsive sidebar, optimistic updates, shadcn/ui components.
- **Streaming**: Real-time AI responses using Groq Llama 3.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Shadcn UI, Lucide Icons.
- **Backend**: Next.js API Routes, Supabase (Postgres + Vector).
- **AI**: 
  - **Embeddings**: Local/Xenova (all-MiniLM-L6-v2) or OpenAI.
  - **LLM**: Groq (Llama 3.3 70B) via Vercel AI SDK.
- **Scraping**: Cheerio.

## 📂 Project Structure

```
recall-lite/
├── app/
│   ├── api/            # API Routes (add-url, chat)
│   ├── chat/           # Chat Page
│   ├── dashboard/      # Dashboard Page
│   ├── login/          # Login Page
│   └── layout.tsx      # Root Layout
├── components/         # UI Components (shadcn, custom)
├── lib/                # Utilities (supabase, embeddings, text)
├── supabase/           # Migrations & SQL
└── public/             # Static assets
```

## ⚡️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd recall-lite
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   # Optional if using OpenAI embeddings
   # OPENAI_API_KEY=your_openai_api_key
   ```

4. **Supabase Setup**:
   - Create a new project on Supabase.
   - Run the SQL scripts in `supabase/migrations/` in the SQL Editor:
     1. `20240101000000_initial_schema.sql` (Tables & RLS)
     2. `20251128_fix_schema_mismatch.sql` (Fixes & Policies)
     3. `20251128_update_match_documents.sql` (Search Function)

5. **Run Development Server**:
   ```bash
   npm run dev
   ```

6. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000).

## 🔒 Security

- **RLS**: Row Level Security is enabled on `documents` and `chunks` tables. Users can only access their own data.
- **Validation**: Input URLs are validated and processed securely.

## 📝 License

MIT
