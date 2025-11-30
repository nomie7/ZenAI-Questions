# Phase 1 Implementation Plan: Core RAG Chat MVP

## Overview

Build a functional RAG chat assistant that answers questions from PDF documents with citations and page previews, plus a basic knowledge management UI for uploading/replacing documents (role-gating to be added later). UI is two-pane: CopilotKit chat on the side; answers/citations/page previews in the main pane.

**Scope**: RAG pipeline + two-pane shadcn/CopilotKit UI + citations + knowledge upload/update UI (auth/roles stubbed for later)

**Timeline**: 1-2 weeks as per PRD

---

## Prerequisites

Before starting, we need:
- [ ] Qdrant VPS connection URL and API key (if any)
- [ ] Sample PDF documents for testing
- [ ] Confirm OpenAI API key is configured in `.env.local`

---

## Task Breakdown

### Step 1: Add Dependencies

```bash
bun add @qdrant/js-client-rest minio sharp
bun add @google/generative-ai docling  # Parsing options
bun add -D @types/minio
bunx shadcn@latest init
bunx shadcn@latest add button card scroll-area separator skeleton tooltip dialog select
```

**Packages**:
- `@qdrant/js-client-rest` - Qdrant client
- `minio` - S3-compatible object storage (your VPS MinIO, migrate to S3 later)
- `sharp` - Image processing for thumbnails
- `@google/generative-ai` - Gemini Flash for OCR/complex PDFs
- `docling` - IBM's document parsing library (alternative parser)
- `shadcn` components for UI

---

### Step 2: Environment Configuration

**File**: `.env.local`

```env
# Existing
OPENAI_API_KEY=...

# Qdrant
QDRANT_URL=https://your-vps-url:6333
QDRANT_API_KEY=your-api-key  # if authentication enabled
QDRANT_COLLECTION_NAME=knowledge_base

# MinIO (S3-compatible)
MINIO_ENDPOINT=your-vps-url
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=knowledge-docs
MINIO_USE_SSL=true

# Parsing (Gemini Flash option)
GOOGLE_API_KEY=your-gemini-api-key  # Required if using Gemini Flash parser
```

---

### Step 3: Create RAG Infrastructure

#### 3.1 Qdrant Client Setup

**File**: `src/lib/qdrant.ts`

- Initialize Qdrant client with env vars
- Create collection if not exists (1536 dimensions for OpenAI embeddings)
- Export functions: `getClient()`, `ensureCollection()`

#### 3.2 Embeddings Service

**File**: `src/lib/embeddings.ts`

- Use `@langchain/openai` OpenAIEmbeddings
- Export `embedText(text: string)` and `embedTexts(texts: string[])`

#### 3.3 MinIO Storage Service

**File**: `src/lib/storage.ts`

- Initialize MinIO client with env vars
- Create bucket if not exists
- Functions: `uploadFile()`, `uploadPageImage()`, `getSignedUrl()`, `deleteFile()`
- Store: original PDFs, page images, processed outputs
- Path structure: `{bucket}/documents/{doc_id}/original.pdf`, `{bucket}/documents/{doc_id}/pages/page-{n}.png`

#### 3.4 Document Parsers (User Selectable)

**File**: `src/lib/parsers/index.ts` - Parser interface and factory

```typescript
interface DocumentParser {
  parse(file: Buffer, filename: string): Promise<ParsedDocument>;
}

type ParserType = 'docling' | 'gemini';
function getParser(type: ParserType): DocumentParser;
```

**File**: `src/lib/parsers/docling-parser.ts` - Docling implementation

- Uses IBM Docling for document understanding
- Good for: structured documents, tables, forms
- Extracts text with layout preservation
- Handles PDFs and Office documents natively

**File**: `src/lib/parsers/gemini-parser.ts` - Gemini Flash implementation

- Converts pages to images first
- Sends to Gemini Flash for OCR/extraction
- Good for: scanned PDFs, complex layouts, handwritten notes
- More accurate for visual content but higher latency/cost

#### 3.5 Document Processor

**File**: `src/lib/document-processor.ts`

- Accept parser type as parameter (user preference)
- Convert PDF pages to images using `sharp` or `pdf-to-img`
- Upload page images to MinIO
- Run selected parser (Docling or Gemini)
- Chunk text with overlap (500 chars, 50 overlap)
- Return structured data: `{ pageNumber, text, chunks[], imageUrl }`

#### 3.6 Ingestion Pipeline

**File**: `src/lib/ingest.ts`

- Upload original PDF to MinIO
- Process PDF → extract pages → chunk → embed → store in Qdrant
- Store metadata: `{ doc_id, doc_name, page_number, chunk_index, image_url, parser_used }`
- Page images stored in MinIO: `documents/{doc_id}/pages/page-{n}.png`

#### 3.7 Retrieval Service

**File**: `src/lib/retrieval.ts`

- `retrieveContext(query: string, topK: number = 8-12)` with optional filters (doc_id, status=ready)
- Search Qdrant with query embedding; include MMR or rerank step to diversify and improve quality
- Return chunks with metadata for citations
- Deduplicate by page and boost recency or exact-title matches when relevant

#### 3.8 Metadata Extraction (LLM-Assisted, Optional)

- During ingestion, run a lightweight LLM pass on each document or chunk to classify payload fields (generic, no “pitch” assumption):
  - `doc_type` (e.g., SOP, FAQ, Q&A, proposal, case study)
  - `topic` / `category`
  - `question` / `answer` pairs when detectable (for FAQs or Q&A sections)
  - `entity_client` / `entity_industry` when text makes it obvious (nullable)
  - `date` / `version` if present
  - `status` (ready/archived)
- Store these in Qdrant payloads to enable filtering/boosting (e.g., prefer recent, prefer matching topic/category, surface exact question matches).

---

### Step 4: Update API Route for RAG

**File**: `src/app/api/copilotkit/route.ts`

Modify the existing CopilotKit route to:
1. Extract user query
2. Call `retrieveContext()` to get relevant chunks
3. Build system prompt with strict instructions:
   - Answer ONLY from provided context
   - Include citations in format `[Doc: X, Page: Y]`
   - Admit when information is not available
4. Pass context to GPT-4.1 via LangChain
5. Return response with citation metadata

**System Prompt Template**:
```
You are an internal knowledge assistant. Answer questions ONLY using the provided context.

RULES:
- Only answer from the context below
- Cite sources as [Doc: {name}, Page: {number}]
- If the answer is not in the context, say "I don't have information about that in my knowledge base"
- Be concise and accurate

CONTEXT:
{retrieved_chunks}
```

---

### Step 5: Build Chat UI with shadcn

#### 5.1 Two-Pane Layout (CopilotKit chat sidebar + answer pane)

**File**: `src/app/page.tsx`

- Keep CopilotKit chat UI on the side (e.g., right sidebar); main pane on the left shows the answer, citations, and previews.
- Main pane: shadcn Card with current answer, citation chips, and page preview panel.
- Chat pane: ScrollArea for message history, input + send button; “thinking” indicator.

#### 5.2 Message Components

**File**: `src/components/chat/message.tsx`

- User message bubble (right-aligned)
- Assistant message bubble (left-aligned)
- Support for markdown rendering
- Citation chips inline with text

#### 5.3 Citation Component

**File**: `src/components/chat/citation.tsx`

- Clickable citation chip `[Doc: X, Page: Y]`
- On hover: show tooltip with snippet
- On click: open side panel with page image (or inline in the main pane)

#### 5.4 Citation Panel

**File**: `src/components/chat/citation-panel.tsx`

- Side panel (drawer or sheet) or inline panel in the main answer area
- Display page image thumbnail
- Show extracted text snippet
- Document name and page info

#### 5.5 Loading States

**File**: `src/components/chat/thinking-indicator.tsx`

- Animated "thinking" state while RAG retrieves
- Skeleton loading for messages and main answer pane

---

### Step 6: Knowledge Management UI (Upload/Replace)

> Aligns with PRD “Knowledge Maintainer” stories. AuthZ will be wired in a later phase; for now, gate with a simple nav link and role stub.

**Files**:
- `src/app/knowledge/page.tsx` - Dedicated area separate from chat
- `src/components/knowledge/upload-form.tsx` - Upload/replace form with file input + document name
- `src/components/knowledge/document-table.tsx` - Table listing docs with status/updatedAt
- `src/components/knowledge/document-actions.tsx` - Replace/soft-archive buttons (archive can be a stub)

**Behavior**:
- Upload PDF/PPT via form → call ingestion API, show inline progress (processing/ready/failed)
- Replace flow: selecting “Replace” opens file picker; on submit, calls ingestion API with `doc_id` to supersede prior version (old embeddings flagged for re-index)
- Status badges: `Processing`, `Ready`, `Failed`, `Archived (stub)`
- Basic nav separation from chat (e.g., top nav tab “Knowledge”)
- Auth/roles: placeholder `TODO` for enforcement; ensure components are isolated so adding role checks later is low-friction

**API Integration**:
- Uses `POST /api/ingest` (see Step 7) with multipart form data
- Optional query/body param `replaceDocId` to supersede an existing document

---

### Step 7: Document Ingestion Endpoint

---

**File**: `src/app/api/ingest/route.ts`

- POST endpoint to ingest PDFs
- Accept multipart form data with PDF file
- Process through ingestion pipeline
- Optional `replaceDocId` to supersede a document
- Return document ID and status

For Phase 1, this is used by both the new Knowledge UI and curl/Postman.

---

### Step 8: Create Ingestion Script (CLI)

**File**: `scripts/ingest-pdf.ts`

- CLI script to ingest PDFs during development
- Usage: `bun run scripts/ingest-pdf.ts ./path/to/doc.pdf "Document Name" --parser=docling`
- Parser options: `--parser=docling` (default) or `--parser=gemini`
- Useful for initial testing without UI

---

## File Structure After Implementation

```
src/
├── app/
│   ├── api/
│   │   ├── copilotkit/
│   │   │   └── route.ts          # Modified: RAG integration
│   │   └── ingest/
│   │       └── route.ts          # New: PDF ingestion endpoint
│   ├── layout.tsx
│   ├── page.tsx                  # Modified: shadcn chat UI
│   └── knowledge/                # New: knowledge management area
│       └── page.tsx
│   └── globals.css
├── components/
│   ├── chat/
│   │   ├── message.tsx           # New
│   │   ├── citation.tsx          # New
│   │   ├── citation-panel.tsx    # New
│   │   └── thinking-indicator.tsx # New
│   ├── knowledge/
│   │   ├── upload-form.tsx       # New: upload/replace form
│   │   ├── document-table.tsx    # New: list with statuses
│   │   └── document-actions.tsx  # New: replace/archive buttons (archive stub)
│   └── ui/                       # shadcn components
│       ├── button.tsx
│       ├── card.tsx
│       ├── scroll-area.tsx
│       ├── dialog.tsx
│       ├── select.tsx
│       └── ...
├── lib/
│   ├── qdrant.ts                 # New: Qdrant client
│   ├── storage.ts                # New: MinIO client
│   ├── embeddings.ts             # New: OpenAI embeddings
│   ├── parsers/                  # New: Document parsers
│   │   ├── index.ts              # Parser interface & factory
│   │   ├── docling-parser.ts     # IBM Docling implementation
│   │   └── gemini-parser.ts      # Gemini Flash implementation
│   ├── document-processor.ts     # New: PDF processing
│   ├── ingest.ts                 # New: Ingestion pipeline
│   └── retrieval.ts              # New: RAG retrieval
scripts/
└── ingest-pdf.ts                 # New: CLI ingestion tool

# MinIO Storage Structure (on VPS)
knowledge-docs/                   # MinIO bucket
└── documents/
    └── {doc_id}/
        ├── original.pdf          # Original uploaded file
        └── pages/
            └── page-{n}.png      # Page images for citations
```

---

## Implementation Order

1. **Environment & Dependencies** (30 min)
   - Add packages
   - Configure env vars (Qdrant, MinIO, Gemini API key)
   - Initialize shadcn

2. **Infrastructure Services** (1.5 hours)
   - `src/lib/qdrant.ts` - Qdrant client
   - `src/lib/storage.ts` - MinIO client
   - `src/lib/embeddings.ts` - OpenAI embeddings
   - Test connections to VPS services

3. **Document Parsers** (2 hours)
   - `src/lib/parsers/index.ts` - Parser interface
   - `src/lib/parsers/docling-parser.ts` - Docling implementation
   - `src/lib/parsers/gemini-parser.ts` - Gemini Flash implementation
   - Test both parsers with sample PDFs

4. **Document Processing & Ingestion** (2 hours)
   - `src/lib/document-processor.ts`
   - `src/lib/ingest.ts`
   - `scripts/ingest-pdf.ts`
   - Test full pipeline with both parsers

5. **Retrieval Service** (1 hour)
   - `src/lib/retrieval.ts`
   - Add MMR/rerank (optional) to improve answer quality
   - Test queries against ingested docs

6. **API Route Update** (2 hours)
   - Modify `src/app/api/copilotkit/route.ts`
   - Add system prompt
   - Wire up retrieval
   - Test RAG responses with citations

7. **Ingestion API** (1 hour)
   - `src/app/api/ingest/route.ts` with optional `replaceDocId`
   - Smoke test via curl/Postman

8. **Knowledge UI (Upload/Replace)** (3 hours)
   - `src/app/knowledge/page.tsx` + knowledge components
   - Wire upload/replace to ingestion API
   - Stub role check/toggle for later Logto integration

9. **Chat UI** (3-4 hours)
   - Chat layout with shadcn
   - Message components
   - Citation display
   - Citation panel with page images from MinIO

10. **Testing & Polish** (2 hours)
   - End-to-end testing
   - Error handling
   - Loading states
   - Edge cases (no results, long responses)

---

## Testing Approach

1. **Unit Tests** (optional for MVP):
   - Chunking logic
   - Embedding generation
   - Retrieval scoring

2. **Integration Tests**:
   - Ingest a PDF → verify in Qdrant
   - Query → verify relevant chunks returned
   - Full flow: question → response with citations

3. **Manual Testing**:
   - Ingest 2-3 sample PDFs
   - Ask various questions
   - Verify citations are accurate
   - Check page images display correctly

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Vector DB | Qdrant (existing VPS) | Already set up, no new infra |
| File Storage | MinIO (VPS) → S3 later | S3-compatible, easy migration path |
| PDF Parsing | Docling + Gemini Flash (user choice) | Docling for structured docs, Gemini for OCR/complex layouts |
| Chunking | 500 chars, 50 overlap | Balance between context and precision |
| Page Images | Sharp → MinIO storage | Signed URLs for secure access |
| UI Framework | shadcn | Modern, accessible, requested by user |
| Auth | Skipped | Phase 1 scope, add in Phase 3 |

### Parser Comparison

| Feature | Docling | Gemini Flash |
|---------|---------|--------------|
| Best for | Structured PDFs, tables, forms | Scanned PDFs, handwriting, complex layouts |
| Speed | Fast (local processing) | Slower (API calls) |
| Cost | Free (open source) | Pay per use (Gemini API) |
| Accuracy | Good for text-based PDFs | Better for visual/OCR content |
| Offline | Yes | No (requires API) |

---

## Open Questions for User

1. What's the Qdrant VPS URL and authentication method?
2. What's the MinIO endpoint and credentials?
3. Preferred chunk size for your SOP documents?

---

## Success Criteria

- [ ] Can ingest PDF documents via CLI script with parser choice
- [ ] Both Docling and Gemini Flash parsers work correctly
- [ ] Documents and page images stored in MinIO
- [ ] Chat responds with accurate answers from documents
- [ ] Citations show document name and page number
- [ ] Clicking citation shows page image (served from MinIO)
- [ ] "No information" response when query not in knowledge base
- [ ] Clean, responsive UI with shadcn components
- [ ] Knowledge tab can upload new PDF/PPT and replace an existing doc, showing processing/ready/failed states (auth gating stubbed for later)
- [ ] Two-pane UI: CopilotKit chat on the side, main answer pane with citations and page previews on the left
