# Recall Lite

A fast, developer-crafted personal reading archive and document query tool. Save URLs, automatically clean and extract web text, index chunks with vector embeddings, and query your knowledge base using strict context retrieval. Built with **Next.js 16**, **Firebase**, **Tailwind CSS 4**, and **Google Gemini**.

---

## Features

### Core Functionality
- **URL Extraction & Chunking**: Automatic web scraping with Cheerio, removing boilerplate and advertising to extract clean readable content with LangChain text splitters.
- **Strict RAG Querying**: Context-grounded conversation powered by Google Gemini 2.5 Flash that answers strictly from your saved sources.
- **Live Response Streaming**: Instant streamed answers with Markdown and syntax-highlighted code blocks.
- **Firebase Authentication**: Email/password authentication and user-isolated Firestore document storage.

### Interface & Ergonomics
- **Restrained Design System**: Clean neutral slate/zinc palette, crisp micro-borders, and high-contrast typography without neon gradients or glow clutter.
- **Keyboard Shortcuts**: Press `/` anywhere in the dashboard to jump straight into search.
- **Domain & Tag Filtering**: Quick-filter your library by domain sources (e.g., `react.dev`, `developer.mozilla.org`).
- **Layout Modes**: Instant toggle between Grid Cards and Compact List rows.
- **Reading Time & Word Stats**: Automatic read-time estimations and domain favicon detection.
- **Dark / Light Mode**: High-contrast theme switching with system preference detection.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & CSS Variables
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theming**: `next-themes`

### Backend & Database
- **API**: Next.js App Router Route Handlers (`/api/add-url`, `/api/chat`, `/api/documents/[id]`)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)

### AI & ML
- **LLM**: Groq (`llama-3.3-70b-versatile`) / Google Generative AI via [Vercel AI SDK](https://sdk.vercel.ai/docs)
- **Embeddings**: Local Xenova Transformers (`all-MiniLM-L6-v2`) / OpenAI Embeddings
- **Text Processing**: LangChain Text Splitters
- **Web Scraping**: Cheerio for clean HTML parsing

---

## 📂 Project Structure

```
Recall-Lite/
├── app/
│   ├── (auth)/
│   │   └── login/             # Glassmorphic Auth page (Sign In / Sign Up)
│   ├── api/
│   │   ├── add-url/           # Scraping, chunking & Firestore embedding route
│   │   ├── chat/              # RAG context retrieval & streaming chat route
│   │   └── documents/[id]/    # Document deletion route
│   ├── chat/[documentId]/     # Chat interface page per document
│   ├── dashboard/             # Main Knowledge Dashboard
│   ├── layout.tsx             # Root layout with Theme & Auth providers
│   └── globals.css            # Custom CSS variables, glassmorphic styles & scrollbars
├── components/
│   ├── ui/                    # Base Radix/Shadcn UI components
│   ├── add-link-form.tsx      # URL saver form with sample pills & favicon preview
│   ├── app-sidebar.tsx        # Glassmorphic navigation sidebar
│   ├── chat-interface.tsx     # Active document chat interface with prompt chips
│   ├── chat-markdown.tsx      # Markdown & code block syntax renderer
│   ├── dashboard-client.tsx   # Client dashboard with search, stats & layout view toggle
│   ├── document-card.tsx       # Document card (Grid & List layout support)
│   ├── sidebar-document-item.tsx # Sidebar document row with preview tooltip
│   └── theme-toggle.tsx       # Light / Dark / System theme switcher
├── lib/
│   ├── firebase.ts            # Client Firebase setup
│   ├── firebase-server.ts     # Server-side Firebase helpers & REST queries
│   └── embeddings.ts          # Text embedding generation pipeline
└── types/                     # TypeScript definitions
```

---

## ⚡️ Setup & Installation

### Prerequisites
- Node.js 20+ and npm
- A Firebase project with Firestore and Auth enabled
- A Groq API key (free tier available at [groq.com](https://groq.com))

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/Recall-Lite.git
cd Recall-Lite
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI API Key
GROQ_API_KEY=your_groq_api_key

# Optional: Google AI / OpenAI keys
# GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
# OPENAI_API_KEY=your_openai_api_key
```

### Step 4: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 How It Works

1. **Save an Article**: Paste any web URL into the Dashboard URL bar (or click one of the quick sample chips).
2. **Content Extraction**: The system scrapes the web page with Cheerio, cleans unnecessary boilerplate, and chunks the main body text.
3. **Vector Embeddings**: Text chunks are embedded and saved into Firebase Firestore under your account.
4. **Interactive Chat**: Click on any saved document to open the AI Chat. Ask custom questions or use the starter prompt chips (*3-Point Summary*, *Action Items*) to receive instant streamed AI answers with full Markdown & code block formatting.

---

## 🚢 Production Build

To verify and test a production build locally:

```bash
npm run build
npm start
```

---

## 📝 License

MIT License — feel free to use and customize this project for your personal or commercial knowledge base!
