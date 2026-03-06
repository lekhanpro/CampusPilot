<div align="center">

# ScholarSync

### AI-Powered PDF Study Assistant

Upload your PDFs. Ask questions across all your documents. Get cited answers with page numbers in seconds.

[![MIT License](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/lekhanpro/scholarsync?style=flat&color=violet)](https://github.com/lekhanpro/scholarsync/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/lekhanpro/scholarsync?style=flat&color=indigo)](https://github.com/lekhanpro/scholarsync/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/lekhanpro/scholarsync?style=flat)](https://github.com/lekhanpro/scholarsync/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Built with TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Powered by Groq](https://img.shields.io/badge/Powered_by-Groq-orange)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## About

ScholarSync is a full-stack Retrieval-Augmented Generation (RAG) application that transforms your PDF documents into an intelligent, searchable knowledge base. Built for students, researchers, and anyone who works with large volumes of documents, ScholarSync lets you upload multiple PDFs, ask natural language questions across all of them, and receive accurate, cited answers with exact page references.

The system parses your PDFs, splits them into semantic chunks, generates vector embeddings using HuggingFace models, stores them in a Supabase pgvector database, and uses Groq's lightning-fast LLaMA 3.3 70B model to generate answers grounded in your actual documents.

## Features

- **Multi-PDF Upload** -- Drag and drop multiple lecture notes, textbooks, and papers. Each PDF is parsed and indexed automatically.
- **Hybrid Retrieval Pipeline** -- Retrieval combines multi-query vector search, lightweight lexical fusion, and MMR-style context selection for better recall and less duplicate evidence.
- **Cross-Document Queries** -- Ask questions that span multiple documents. Follow-up questions are rewritten into standalone search queries when needed so retrieval stays anchored across turns.
- **Grounded Citations** -- Every response is grounded in curated source blocks with stable `[S1]`, `[S2]` prompt citations backed by deduped filename/page sources.
- **Groq-Powered Speed** -- Answers generated in under 2 seconds using LLaMA 3.3 70B on Groq's inference engine.
- **Conversation History** -- Multi-turn chat that maintains context across questions for natural follow-up queries.
- **Modern UI** -- Glassmorphism design with smooth Framer Motion animations, dark mode, and responsive layout.
- **Document Management** -- View, manage, and delete uploaded documents. Track processing status in real time.

## Screenshots

> Screenshots will be added here. To contribute screenshots, see [CONTRIBUTING.md](CONTRIBUTING.md).

```
[ Landing Page ]  [ Dashboard ]  [ Chat Interface ]  [ Source Citations ]
```

## Architecture

```
                          ScholarSync Architecture
 ============================================================================

  User Browser (React SPA)
       |
       |  HTTP / REST
       v
  Express API Server (Node.js)
       |
       |--- POST /api/upload -----> PDF Parsing (pdf-parse)
       |                                 |
       |                                 v
       |                           Text Chunking (LangChain)
       |                                 |
       |                                 v
       |                           Embedding (HuggingFace API)
       |                                 |
       |                                 v
       |                           Store in Supabase pgvector
       |
       |--- POST /api/chat ------> Query Rewrite + Expansion (Groq)
       |                                 |
       |                                 v
       |                      Hybrid Retrieval + Fusion (pgvector + lexical)
       |                                 |
       |                                 v
       |                    Diverse Context Packing + Grounded Answer (Groq)
       |                                 |
       |                                 v
       |                           Return cited response
       |
       |--- GET /api/documents --> List documents from Supabase
       |--- DELETE /api/documents/:id --> Remove document + chunks
       |--- GET /api/health -----> Health check

 ============================================================================
```

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | React 18, TypeScript | Component-based UI with type safety |
| **Styling** | Tailwind CSS, Framer Motion | Utility-first CSS with smooth animations |
| **Backend** | Node.js, Express, TypeScript | REST API server |
| **LLM** | Groq API (LLaMA 3.3 70B) | Fast, accurate answer generation |
| **Embeddings** | HuggingFace Inference API | all-MiniLM-L6-v2 model, 384-dim vectors |
| **Vector DB** | Supabase pgvector | PostgreSQL with vector similarity search |
| **PDF Parsing** | pdf-parse | Extract text content from PDF files |
| **Text Splitting** | LangChain | RecursiveCharacterTextSplitter for semantic chunking |
| **Build Tools** | Vite, tsx | Fast development and build tooling |

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- A **Groq** account ([console.groq.com](https://console.groq.com/keys))
- A **Supabase** project ([supabase.com](https://supabase.com/))
- A **HuggingFace** account ([huggingface.co](https://huggingface.co/settings/tokens))
- OCR fallback uses `tesseract.js` + `canvas` and may require native build tools.

### 1. Clone the Repository

```bash
git clone https://github.com/lekhanpro/scholarsync.git
cd scholarsync
```

### 2. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your API keys:

```bash
cp .env.example .env
```

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `GROQ_API_KEY` | API key for Groq LLM inference | [console.groq.com/keys](https://console.groq.com/keys) |
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) | Supabase Dashboard > Settings > API |
| `HF_API_KEY` | HuggingFace Inference API token | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `RAG_*` | Optional retrieval/chunking tuning knobs (see `.env.example`) | Optional |
| `PORT` | Server port (default: `3001`) | Optional |
| `NODE_ENV` | Environment (`development` or `production`) | Optional |
| `CLIENT_URL` | Frontend URL for CORS in production | Required for production |

### 4. Set Up Supabase

Run the following SQL in your Supabase SQL Editor to create the required tables and functions:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Documents table (per-user)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  filename text not null,
  original_name text not null,
  storage_path text,
  total_pages integer default 0,
  total_chunks integer default 0,
  status text default 'processing' check (status in ('processing', 'ready', 'error')),
  error_message text,
  created_at timestamptz default now()
);

-- Document chunks with vector embeddings
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  user_id uuid not null,
  content text not null,
  page_number integer not null,
  chunk_index integer not null,
  metadata jsonb default '{}', -- stores source metadata such as section hints, offsets, and neighbor links
  embedding vector(384),
  created_at timestamptz default now()
);

-- IVFFlat index for fast similarity search
create index if not exists document_chunks_embedding_idx
  on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RPC function for similarity search (scoped by user)
create or replace function match_documents(
  query_embedding text,
  match_threshold float default 0.3,
  match_count int default 8,
  filter_document_ids uuid[] default null,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  page_number integer,
  chunk_index integer,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.document_id,
    dc.content,
    dc.page_number,
    dc.chunk_index,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding::vector) as similarity
  from document_chunks dc
  where
    (filter_document_ids is null or dc.document_id = any(filter_document_ids))
    and (filter_user_id is null or dc.user_id = filter_user_id)
    and 1 - (dc.embedding <=> query_embedding::vector) > match_threshold
  order by dc.embedding <=> query_embedding::vector
  limit match_count;
end;
$$;
```

Create a private Supabase Storage bucket named `documents`.

Optional RLS policies (recommended if you access Supabase directly from the client):

```sql
alter table documents enable row level security;
alter table document_chunks enable row level security;
create policy "Users can read own documents" on documents
  for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on documents
  for insert with check (auth.uid() = user_id);
create policy "Users can update own documents" on documents
  for update using (auth.uid() = user_id);
create policy "Users can delete own documents" on documents
  for delete using (auth.uid() = user_id);

create policy "Users can read own chunks" on document_chunks
  for select using (auth.uid() = user_id);
create policy "Users can insert own chunks" on document_chunks
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own chunks" on document_chunks
  for delete using (auth.uid() = user_id);

```

### 5. Run the Application

```bash
npm run dev
```

This starts both the frontend and backend concurrently:

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:3001](http://localhost:3001)

PDF ingestion runs inline on upload in the free deployment mode.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a PDF file (multipart form, field: `pdf`) |
| `GET` | `/api/documents` | List all uploaded documents |
| `GET` | `/api/documents/:id/url` | Get a signed URL for PDF preview |
| `DELETE` | `/api/documents/:id` | Delete a document and its chunks |
| `POST` | `/api/chat` | Send a chat query (JSON body: `{ query, documentIds?, conversationHistory? }`) |
| `POST` | `/api/chat/stream` | Stream a chat response (SSE) |
| `GET` | `/api/health` | Health check endpoint |

All API requests require `Authorization: Bearer <supabase_access_token>`.

### Chat Request Example

```json
{
  "query": "What is the definition of pointers?",
  "documentIds": ["uuid-1", "uuid-2"],
  "conversationHistory": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ]
}
```

### Chat Response Example

```json
{
  "answer": "Based on your documents, a pointer is a variable that stores a memory address...",
  "sources": [
    {
      "filename": "lecture_notes.pdf",
      "page_number": 12,
      "excerpt": "A pointer is a variable that stores...",
      "similarity": 0.89
    }
  ],
  "model": "llama-3.3-70b-versatile"
}
```

## Project Structure

```

## Mobile App (React Native)

The bare React Native client lives in `ScholarSyncMobile/`.

1. Configure `ScholarSyncMobile/src/config.ts` with your API base URL and Supabase keys.
2. Install dependencies:

```bash
cd ScholarSyncMobile
npm install
```

3. Run on Android:

```bash
npm run android
```

For iOS, open `ScholarSyncMobile/ios/ScholarSyncMobile.xcworkspace` in Xcode and run.

## Deploy to Render

This repo includes a Render Blueprint in `render.yaml` that provisions:
- `scholarsync-web` (web service)

### Steps
1. Render Dashboard → **New** → **Blueprint**
2. Select the `lekhanpro/scholarsync` repo (branch `main`)
3. Set required environment variables (below), then deploy.

### Required Environment Variables

**Web service**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET` (e.g. `documents`)
- `HF_API_KEY`
- `GROQ_API_KEY`
- `POSTHOG_KEY`
- `POSTHOG_HOST` (default `https://app.posthog.com`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_POSTHOG_KEY`
- `VITE_POSTHOG_HOST`
- `VITE_API_BASE` (example: `https://scholarsync-dun.vercel.app/api`)

- `CLIENT_URL` (set to your Render URL after first deploy, then redeploy)

## Deploy to GitHub Pages

GitHub Pages hosts only the frontend. API calls must go to a deployed backend URL.

### Steps
1. GitHub repo → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. In repo **Settings** → **Secrets and variables** → **Actions**, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_POSTHOG_KEY`
- `VITE_POSTHOG_HOST`
- `VITE_API_BASE` (example: `https://scholarsync-dun.vercel.app/api`)
4. Push to `main`; workflow `.github/workflows/pages.yml` deploys automatically
scholarsync/
├── client/                  # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── GlassLayout.tsx
│   │   │   ├── LoadingDots.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── SourceBadge.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useChat.ts
│   │   │   └── useFileUpload.ts
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   └── Landing.tsx
│   │   ├── services/        # API client
│   │   │   └── api.ts
│   │   ├── types/           # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx          # Root component with routing
│   │   ├── index.css        # Global styles
│   │   └── main.tsx         # Entry point
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # Service configurations
│   │   │   ├── groq.ts
│   │   │   └── supabase.ts
│   │   ├── controllers/     # Route handlers
│   │   │   ├── chatController.ts
│   │   │   └── uploadController.ts
│   │   ├── middleware/       # Express middleware
│   │   │   └── errorHandler.ts
│   │   ├── routes/          # Route definitions
│   │   │   ├── chatRoutes.ts
│   │   │   └── uploadRoutes.ts
│   │   ├── services/        # Business logic
│   │   │   ├── embeddingService.ts
│   │   │   ├── pdfService.ts
│   │   │   └── ragService.ts
│   │   └── index.ts         # Server entry point
│   ├── uploads/             # Temporary PDF storage
│   ├── tsconfig.json
│   └── package.json
├── .env.example             # Environment variable template
├── .github/                 # GitHub templates and CI
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
├── package.json             # Root package with dev scripts
├── vercel.json              # Vercel deployment config
├── CONTRIBUTING.md          # Contributor guide
├── CODE_OF_CONDUCT.md       # Code of conduct
├── LICENSE                  # MIT License
└── README.md                # This file
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) to learn about our development process, how to propose bug fixes and improvements, and how to build and test your changes.

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Groq](https://groq.com/) -- For providing lightning-fast LLM inference
- [Supabase](https://supabase.com/) -- For the PostgreSQL database with pgvector support
- [HuggingFace](https://huggingface.co/) -- For the embedding models and Inference API
- [LangChain](https://www.langchain.com/) -- For the text splitting utilities
- [Tailwind CSS](https://tailwindcss.com/) -- For the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) -- For the animation library
- [Lucide](https://lucide.dev/) -- For the icon set

---

<div align="center">

Built by [lekhanpro](https://github.com/lekhanpro)

If this project helped you, consider giving it a star on GitHub.

</div>

