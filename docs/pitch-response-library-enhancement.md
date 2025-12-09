# Pitch Response Library Enhancement Plan

## Overview

Enhance the RAG system to serve as a pitch response library with rich metadata tagging, similar question matching, and AI-powered answer adaptation. Implementation will be phased with rich metadata as the priority.

---

## Current State

- Basic metadata: `doc_type`, `topic`, `category` stored in Qdrant payloads
- Hybrid search (dense + BM25) with agentic retrieval
- Page-level citations with images
- Upload form has minimal metadata fields

---

## Phase 1: Rich Metadata Tagging (Priority)

### 1.1 Expand Metadata Schema

Update `src/lib/ingest.ts` to support new fields:

```typescript
metadata?: {
  client?: string;           // Client name (e.g., "Spotify", "Adobe")
  vertical?: string;         // Industry vertical (e.g., "CPG", "Entertainment", "B2B")
  region?: "global" | "local" | string;  // Geographic scope
  theme?: string;            // Theme/topic (e.g., "Data Lake Integration", "Audience Strategy")
  year?: number;             // Year of pitch
  status?: "ready" | "processing" | "archived";
}
```

### 1.2 Update Upload Form

Modify `src/components/knowledge/upload-form.tsx`:

- Add **Client** dropdown/input with autocomplete from existing values
- Add **Vertical/Industry** selector (predefined list + custom option)
- Add **Global/Local** toggle or dropdown
- Add **Theme/Topic** multi-select or tags input

**Suggested Vertical Options:**
- CPG (Consumer Packaged Goods)
- Entertainment
- B2B
- Retail
- Financial Services
- Healthcare
- Technology
- Automotive
- Travel & Hospitality
- Other (custom input)

### 1.3 Update Qdrant Payload

Ensure all new fields are stored and indexed for filtering in `src/lib/qdrant.ts`:

```typescript
payload: {
  // ... existing fields
  client: metadata.client || "",
  vertical: metadata.vertical || "",
  region: metadata.region || "",
  theme: metadata.theme || "",
  year: metadata.year || null,
}
```

### 1.4 Add Filtered Search

Update `src/lib/retrieval.ts` to support metadata filters:

```typescript
interface RetrievalOptions {
  topK?: number;
  docId?: string;
  status?: string;
  diversify?: boolean;
  diversityWeight?: number;
  // NEW: Metadata filters
  filters?: {
    client?: string;
    vertical?: string[];
    region?: string;
    theme?: string[];
    year?: number;
  };
}
```

### 1.5 Update Document Table

Modify `src/components/knowledge/document-table.tsx`:

- Display metadata as colored badges/tags
- Add filter dropdowns above the table
- Show Client, Vertical, Theme columns (collapsible on mobile)

---

## Phase 2: Question-Answer Extraction

### 2.1 Create Q&A Extraction Service

New file: `src/lib/qa-extractor.ts`

Purpose: LLM-based extraction to identify question-answer pairs from unstructured pitch content.

```typescript
interface ExtractedQA {
  questionText: string;      // The question being asked
  answerText: string;        // The answer/response
  sourceDocId: string;
  sourceDocName: string;
  sourcePageNumber: number;
  sourceChunkId: string;
  confidence: number;        // Extraction confidence score
  metadata: {                // Inherited from parent document
    client?: string;
    vertical?: string;
    region?: string;
    theme?: string;
  };
}

async function extractQAPairs(
  chunks: ProcessedChunk[],
  docMetadata: DocumentMetadata
): Promise<ExtractedQA[]>
```

**LLM Prompt Strategy:**
- Analyze each chunk/page for question-answer patterns
- Look for: RFP questions, client questions, challenge statements with responses
- Return structured JSON with question, answer, and page reference

### 2.2 Store Extracted Q&A Pairs

**Recommended: Separate Qdrant Collection**

Create a new collection `pitch_questions` with:

```typescript
{
  id: string;                    // Unique Q&A pair ID
  vector: number[];              // Embedding of the QUESTION text
  payload: {
    question_text: string;
    answer_text: string;
    source_doc_id: string;
    source_doc_name: string;
    source_page: number;
    source_chunk_id: string;
    client: string;
    vertical: string;
    region: string;
    theme: string;
    extracted_at: string;
  }
}
```

**Why separate collection?**
- Enables dedicated semantic search on questions only
- Questions have different embedding characteristics than full content
- Cleaner filtering and ranking

### 2.3 Integration with Ingestion Pipeline

Update `src/lib/ingest.ts` to:

1. After chunking, run Q&A extraction on each chunk
2. Generate embeddings for extracted questions
3. Store in `pitch_questions` collection
4. Link back to source document/page

---

## Phase 3: Similar Question Matching UI

### 3.1 New Search Mode

Add a dedicated "Find Similar Questions" interface:

**Option A:** Tab in the main chat interface
**Option B:** Separate page at `/pitch-search`

User flow:
1. User enters their pitch question (e.g., "What is your approach to data in low-match markets?")
2. Optionally specify target vertical/client for context
3. System searches the questions collection
4. Returns ranked list of similar past questions

### 3.2 Results Display Component

New file: `src/components/chat/similar-questions.tsx`

Each result card shows:

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 Similar Question                                         │
├─────────────────────────────────────────────────────────────┤
│ "How do you aggregate and scale data in key regions:        │
│  SE Asia, India, Sub-Saharan Africa?"                       │
│                                                             │
│ 🏷️ Spotify  |  🎬 Entertainment  |  🌍 Global               │
│ 📁 Theme: Data Lake Integration                             │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│ Answer Preview:                                             │
│ "Our approach leverages local data partnerships combined    │
│  with probabilistic matching to achieve 85% coverage..."    │
│                                                             │
│ 📄 Page 23 of "Spotify Data Strategy Pitch.pptx"           │
│                                                             │
│ [View Full Answer]  [Adapt for My Pitch]                    │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 API Endpoint

New endpoint: `src/app/api/similar-questions/route.ts`

```typescript
POST /api/similar-questions
{
  question: string;
  filters?: {
    vertical?: string[];
    excludeClient?: string;  // Don't show results from same client
  };
  topK?: number;
}

Response: {
  results: Array<{
    questionText: string;
    answerText: string;
    similarity: number;
    metadata: { client, vertical, region, theme };
    source: { docName, pageNumber, imageUrl };
  }>;
}
```

---

## Phase 4: AI Rewrite Feature

### 4.1 Rewrite Service

New file: `src/lib/answer-rewriter.ts`

```typescript
interface RewriteParams {
  sourceAnswer: string;
  sourceContext: {
    client: string;
    vertical: string;
  };
  targetContext: {
    client?: string;
    vertical?: string;
    additionalContext?: string;  // e.g., "Focus on privacy regulations"
  };
  tone?: "formal" | "conversational" | "technical";
}

interface RewriteResult {
  rewrittenAnswer: string;
  changesHighlighted: string;  // Version with changes marked
  confidence: number;
}

async function rewriteAnswer(params: RewriteParams): Promise<RewriteResult>
```

**LLM Prompt Strategy:**
- Preserve the core insights and data points
- Adapt terminology for the target industry
- Adjust examples to be relevant to target client
- Maintain the same structure and flow

### 4.2 UI Integration

Add "Adapt for My Pitch" button on similar question results:

1. Click button → Opens modal
2. Modal shows:
   - Source answer (read-only)
   - Target Client input
   - Target Vertical dropdown
   - Additional context textarea
   - Tone selector
3. Click "Generate" → Shows rewritten version
4. Options: Copy to clipboard, Edit further, Regenerate

---

## Key Files to Modify

| File | Changes |
|------|---------|
| `src/lib/ingest.ts` | Expand metadata interface, pass new fields to Qdrant |
| `src/components/knowledge/upload-form.tsx` | Add Client, Vertical, Region, Theme input fields |
| `src/lib/qdrant.ts` | Add payload indexes for new metadata fields |
| `src/lib/retrieval.ts` | Add metadata filter support to search options |
| `src/components/knowledge/document-table.tsx` | Display metadata badges, add filter controls |
| `src/app/api/ingest/route.ts` | Handle new metadata fields from form |

## New Files to Create

| File | Purpose |
|------|---------|
| `src/lib/qa-extractor.ts` | LLM-based Q&A pair extraction from chunks |
| `src/lib/answer-rewriter.ts` | Context-aware answer adaptation service |
| `src/components/chat/similar-questions.tsx` | Similar questions results UI component |
| `src/app/api/similar-questions/route.ts` | API endpoint for question similarity search |

---

## Implementation Order

### Sprint 1: Rich Metadata (Phase 1)
- [ ] 1.1 Expand metadata schema in `ingest.ts`
- [ ] 1.2 Update upload form with new fields
- [ ] 1.3 Update Qdrant payload storage
- [ ] 1.4 Add filtered search to retrieval
- [ ] 1.5 Update document table UI

### Sprint 2: Q&A Extraction (Phase 2)
- [ ] 2.1 Create Q&A extraction service
- [ ] 2.2 Set up questions Qdrant collection
- [ ] 2.3 Integrate with ingestion pipeline
- [ ] 2.4 Backfill existing documents (optional migration script)

### Sprint 3: Similar Questions UI (Phase 3)
- [ ] 3.1 Create API endpoint
- [ ] 3.2 Build results component
- [ ] 3.3 Add search interface/tab

### Sprint 4: Rewrite Feature (Phase 4)
- [ ] 4.1 Create rewrite service
- [ ] 4.2 Build rewrite modal UI
- [ ] 4.3 Integration testing

---

## Estimated Effort

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1: Rich Metadata | 2-3 days | None |
| Phase 2: Q&A Extraction | 2-3 days | Phase 1 |
| Phase 3: Similar Questions UI | 1-2 days | Phase 2 |
| Phase 4: Rewrite Feature | 1-2 days | Phase 3 |

**Total: ~7-10 days**

---

## Future Enhancements (Post-MVP)

1. **Auto-tagging**: LLM suggests metadata based on document content
2. **Question clustering**: Group similar questions to show patterns
3. **Usage analytics**: Track which Q&As are most frequently accessed/adapted
4. **Collaborative editing**: Team members can refine/improve answers
5. **Version history**: Track how answers evolve over time
6. **Export**: Generate formatted pitch response document from selected Q&As
