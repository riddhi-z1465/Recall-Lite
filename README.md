# Recall Lite 🧠

A premium "Second Brain" web application that enables users to save URLs, process content intelligently, and interact with their knowledge base through AI-powered chat. Built with modern web technologies and designed for a seamless, premium user experience.

## ✨ Features

### Core Functionality
- **📎 URL Processing**: Intelligent web scraping, content cleaning, chunking, and embedding of web pages
- **💬 AI Chat Interface**: RAG-based conversational AI that strictly responds from your saved content with source citations
- **🔍 Vector Search**: Advanced semantic search powered by Supabase pgvector
- **👤 User Authentication**: Secure authentication and user management with Supabase Auth
- **🔐 Row-Level Security**: Complete data isolation ensuring users only access their own content

### User Experience
- **🎨 Premium UI/UX**: 
  - Modern dark mode interface
  - Smooth transitions and micro-animations
  - Responsive sidebar with hover effects
  - Interactive document management (favorite, share, delete)
  - Optimistic UI updates for instant feedback
- **⚡️ Real-time Streaming**: Live AI response streaming using Groq Llama 3.3 70B
- **📱 Responsive Design**: Fully responsive across all device sizes
- **🎯 Document Management**: Organized knowledge base with quick actions per document

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI, Radix UI primitives
- **Icons**: Lucide React
- **Themes**: next-themes for dark mode support

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL with pgvector extension)
- **Authentication**: Supabase Auth with NextAuth.js integration
- **Storage**: Supabase Storage for assets

### AI & ML
- **Embeddings**: 
  - Local: Xenova Transformers (all-MiniLM-L6-v2)
  - Cloud: OpenAI Embeddings (optional)
- **LLM**: Groq (Llama 3.3 70B Versatile) via Vercel AI SDK
- **Text Processing**: LangChain Text Splitters for intelligent chunking
- **Web Scraping**: Cheerio for HTML parsing and content extraction

## 📂 Project Structure

```
recall-lite/
├── app/
│   ├── api/
│   │   ├── add-url/          # URL processing endpoint
│   │   ├── chat/             # Chat API with streaming
│   │   └── documents/        # Document CRUD operations
│   ├── chat/[id]/            # Individual chat pages
│   ├── dashboard/            # Main dashboard
│   ├── login/                # Authentication page
│   ├── layout.tsx            # Root layout with providers
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Shadcn UI components
│   ├── chat-interface.tsx    # Main chat component
│   ├── sidebar-document-item.tsx  # Document list items
│   └── ...                   # Other custom components
├── lib/
│   ├── supabase/             # Supabase client utilities
│   ├── embeddings.ts         # Embedding generation
│   ├── text-processing.ts    # Text chunking and cleaning
│   └── utils.ts              # Helper functions
├── supabase/
│   └── migrations/           # Database migrations
├── types/                    # TypeScript type definitions
└── middleware.ts             # Auth middleware
```

## ⚡️ Setup & Installation

### Prerequisites
- Node.js 20+ and npm
- A Supabase account and project
- A Groq API key (free tier available)

### Step 1: Clone the Repository
```bash
git clone <repo-url>
cd recall-lite
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Configuration
GROQ_API_KEY=your_groq_api_key

# Optional: OpenAI (if using OpenAI embeddings instead of local)
# OPENAI_API_KEY=your_openai_api_key
```

### Step 4: Supabase Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Run the following migration files **in order**:

   **Required Migrations:**
   ```sql
   -- 1. Initial Schema (Tables, RLS, pgvector)
   supabase/migrations/20240101000000_initial_schema.sql
   
   -- 2. Schema Fixes and Policies
   supabase/migrations/20251128_fix_schema_mismatch.sql
   
   -- 3. Vector Search Function
   supabase/migrations/20240101000001_match_page.sql
   
   -- 4. Document Cleanup (removes invalid UUIDs)
   supabase/migrations/20251201_cleanup_invalid_documents.sql
   ```

   **What gets created:**
   - `documents` table: Stores URL metadata and user associations
   - `chunks` table: Stores text chunks with embeddings (1536 dimensions)
   - `pgvector` extension: Enables vector similarity search
   - `match_page_sections` function: Performs semantic search
   - Row Level Security policies: Ensures data isolation per user

### Step 5: Run Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Step 6: First Login
1. Navigate to `/login`
2. Sign up with your email
3. Verify your email (check Supabase Auth settings for email confirmation)
4. Start adding URLs to your knowledge base!

## � Usage

### Adding Content
1. Click "Add URL" in the dashboard
2. Paste any web URL
3. The system will:
   - Scrape the content
   - Clean and chunk the text
   - Generate embeddings
   - Store in your knowledge base

### Chatting with Your Knowledge
1. Select a document from the sidebar
2. Ask questions in natural language
3. The AI will respond using **only** information from your saved content
4. Sources are cited for transparency

### Managing Documents
- **Favorite**: Star important documents for quick access
- **Share**: Generate shareable links (if implemented)
- **Delete**: Remove documents and all associated chunks

## 🏗 Architecture

### Data Flow
```
User Input (URL) 
  → Web Scraping (Cheerio)
  → Text Cleaning & Chunking (LangChain)
  → Embedding Generation (Xenova/OpenAI)
  → Storage (Supabase)
  → Vector Search (pgvector)
  → LLM Response (Groq)
  → Streamed to User
```

### Key Components

**Embedding Pipeline:**
- Uses `all-MiniLM-L6-v2` model locally via Xenova Transformers
- Generates 384-dimensional vectors (normalized to 1536 for compatibility)
- Fallback to OpenAI embeddings if configured

**RAG Implementation:**
- Strict retrieval-augmented generation
- No hallucination - responses only from saved content
- Cosine similarity search with configurable threshold
- Context window management for optimal LLM performance

**Security:**
- Row-Level Security (RLS) on all tables
- User-scoped queries via Supabase Auth
- Input validation and sanitization
- Secure API routes with middleware protection

## 🔧 Configuration

### Embedding Models
Switch between local and cloud embeddings in `lib/embeddings.ts`:

```typescript
// Local (default)
export const generateEmbedding = generateLocalEmbedding;

// OpenAI (requires OPENAI_API_KEY)
export const generateEmbedding = generateOpenAIEmbedding;
```

### LLM Settings
Modify the model and parameters in `app/api/chat/route.ts`:

```typescript
const model = groq('llama-3.3-70b-versatile');
// Adjust temperature, max_tokens, etc.
```

## 🐛 Troubleshooting

### Common Issues

**"Error searching documents"**
- Ensure all migration files are run in order
- Check that `match_page_sections` function exists in Supabase
- Verify document IDs are valid UUIDs (run cleanup migration)

**Embeddings not generating**
- Check that Xenova models are downloading (first run takes time)
- Verify sufficient memory for local embeddings
- Consider switching to OpenAI embeddings for production

**Authentication issues**
- Verify environment variables are set correctly
- Check Supabase Auth settings (email confirmation, providers)
- Clear browser cookies and try again

**Chat not streaming**
- Verify Groq API key is valid and has quota
- Check network tab for API errors
- Ensure model name is correct

### Database Cleanup
If you encounter UUID errors, run:
```sql
-- In Supabase SQL Editor
DELETE FROM documents WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
```

## 🔒 Security Best Practices

- **Environment Variables**: Never commit `.env.local` to version control
- **API Keys**: Rotate keys regularly, especially for production
- **RLS Policies**: Always test policies to ensure proper data isolation
- **Input Validation**: All user inputs are sanitized before processing
- **HTTPS**: Use HTTPS in production for all API calls

## 📈 Performance Optimization

- **Chunking**: Optimized chunk size (500-1000 tokens) for better retrieval
- **Caching**: Consider implementing Redis for embedding cache
- **Batch Processing**: Process multiple URLs asynchronously
- **Database Indexing**: pgvector indexes for fast similarity search
- **Edge Functions**: Consider Supabase Edge Functions for heavy processing

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables**: Add all `.env.local` variables to Vercel project settings

### Other Platforms
- Ensure Node.js 20+ runtime
- Set all environment variables
- Configure build command: `npm run build`
- Configure start command: `npm start`

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Vercel AI SDK**: For seamless LLM integration
- **Supabase**: For the amazing backend platform
- **Groq**: For fast LLM inference
- **Xenova**: For browser-based transformers
- **Shadcn**: For beautiful UI components

---

**Built with ❤️ for knowledge workers who want to remember everything.**
