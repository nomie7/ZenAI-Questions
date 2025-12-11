# ZenAI Questions - Application Architecture

## Overview

ZenAI Questions is a **RAG (Retrieval-Augmented Generation)** application built with Next.js 16 and React 19. It provides intelligent document search, knowledge management, and pitch response assistance using hybrid search (BM25 + semantic embeddings).

---

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend (Next.js React)"]
        UI[Chat Interface]
        KB[Knowledge Base Page]
        PS[Pitch Search Page]
    end

    subgraph Backend["Backend (API Routes)"]
        CK["/api/copilotkit"]
        ING["/api/ingest"]
        SQ["/api/similar-questions"]
        FB["/api/feedback"]
        CI["/api/citations"]
    end

    subgraph AI["AI Services"]
        OAI[OpenAI GPT-4.1]
        EMB[OpenAI Embeddings]
        GEM[Google Gemini Parser]
    end

    subgraph Storage["Data Storage"]
        QD[(Qdrant Vector DB)]
        MIO[(MinIO S3 Storage)]
        SQL[(SQLite Feedback DB)]
    end

    UI --> CK
    KB --> ING
    PS --> SQ
    UI --> FB
    UI --> CI

    CK --> OAI
    ING --> EMB
    ING --> GEM
    SQ --> QD

    CK --> QD
    ING --> QD
    ING --> MIO
    CI --> MIO
    FB --> SQL
```

---

## User Query Flow

```mermaid
sequenceDiagram
    participant U as User
    participant Chat as Chat UI
    participant API as /api/copilotkit
    participant Agent as Agentic Retrieval
    participant QD as Qdrant
    participant LLM as GPT-4.1
    participant MIO as MinIO

    U->>Chat: Ask question
    Chat->>API: POST query
    API->>Agent: searchKnowledgeBase()

    rect rgb(240, 240, 255)
        Note over Agent: Query Analysis Phase
        Agent->>Agent: Analyze intent & entities
        Agent->>Agent: Decompose complex queries
    end

    rect rgb(240, 255, 240)
        Note over Agent,QD: Hybrid Search Phase
        Agent->>QD: Dense + BM25 search
        QD-->>Agent: Top candidates
        Agent->>Agent: RRF fusion ranking
    end

    rect rgb(255, 240, 240)
        Note over Agent: Reflection Phase
        Agent->>Agent: Evaluate confidence
        alt Low confidence
            Agent->>QD: Re-search with refined query
        end
    end

    Agent-->>API: Chunks with citations
    API->>LLM: Generate response
    LLM-->>API: Answer with citations
    API-->>Chat: Formatted response
    Chat->>MIO: Fetch page images
    MIO-->>Chat: Citation images
    Chat-->>U: Display answer + citations
```

---

## Document Ingestion Pipeline

```mermaid
flowchart LR
    subgraph Upload["1. Upload"]
        PDF[PDF/Doc Upload]
        META[Add Metadata]
    end

    subgraph Parse["2. Parse"]
        GEM[Gemini Parser]
        UNS[Unstructured API]
        EXT[Extract Text + Pages]
    end

    subgraph Process["3. Process"]
        CHK[Chunking]
        QAE[Q&A Extraction]
    end

    subgraph Embed["4. Embed"]
        DEN[Dense Vectors<br/>OpenAI]
        SPA[Sparse Vectors<br/>Qdrant BM25]
    end

    subgraph Store["5. Store"]
        QD[(Qdrant<br/>Collections)]
        MIO[(MinIO<br/>Page Images)]
    end

    PDF --> GEM & UNS
    META --> EXT
    GEM & UNS --> EXT
    EXT --> CHK
    CHK --> QAE
    CHK --> DEN & SPA
    QAE --> DEN & SPA
    DEN & SPA --> QD
    EXT --> MIO
```

---

## Component Architecture

```mermaid
flowchart TB
    subgraph Pages["Pages (src/app)"]
        HOME["/ (Home)<br/>Chat Interface"]
        KNOW["/knowledge<br/>Document Management"]
        PITCH["/pitch-search<br/>Q&A Search"]
    end

    subgraph ChatComp["Chat Components"]
        CAM[CustomAssistantMessage]
        CIT[CitationRenderer]
        SAR[SearchActionRenderer]
        THK[ThinkingIndicator]
    end

    subgraph KnowComp["Knowledge Components"]
        UPF[UploadForm]
        DOC[DocumentTable]
        FBT[FeedbackTable]
    end

    subgraph PitchComp["Pitch Components"]
        SQP[SimilarQuestionsPanel]
        SQC[SimilarQuestionCard]
    end

    subgraph Services["Services (src/lib)"]
        RET[retrieval.ts<br/>Hybrid Search]
        AGT[agentic-retrieval.ts<br/>Self-Reflecting Agent]
        ING[ingest.ts<br/>Document Pipeline]
        QDR[qdrant.ts<br/>Vector Operations]
        STG[storage.ts<br/>MinIO Client]
    end

    HOME --> ChatComp
    KNOW --> KnowComp
    PITCH --> PitchComp

    ChatComp --> Services
    KnowComp --> Services
    PitchComp --> Services
```

---

## Hybrid Search Architecture

```mermaid
flowchart LR
    subgraph Input
        Q[User Query]
    end

    subgraph Embedding["Vector Generation"]
        DE[Dense Embedding<br/>OpenAI 1536-dim]
        SE[Sparse Embedding<br/>Qdrant BM25]
    end

    subgraph Search["Parallel Search"]
        DS[Dense Search<br/>Semantic Similarity]
        SS[Sparse Search<br/>Keyword Match]
    end

    subgraph Fusion["Result Fusion"]
        RRF[RRF Algorithm<br/>Reciprocal Rank Fusion]
    end

    subgraph Output
        TOP[Top K Results<br/>Best of Both]
    end

    Q --> DE & SE
    DE --> DS
    SE --> SS
    DS --> RRF
    SS --> RRF
    RRF --> TOP
```

---

## Data Storage Schema

```mermaid
erDiagram
    QDRANT_KNOWLEDGE {
        string doc_id PK
        string text
        int page_number
        string status
        string doc_type
        vector dense_vector
        vector sparse_vector
    }

    QDRANT_PITCH {
        string id PK
        string question
        string answer
        string client
        string vertical
        string region
        int year
        vector dense_vector
        vector sparse_vector
    }

    MINIO_STORAGE {
        string doc_id PK
        blob original_file
        blob page_images
    }

    SQLITE_FEEDBACK {
        string conversation_id PK
        string message_id
        string feedback_type
        timestamp created_at
    }

    QDRANT_KNOWLEDGE ||--o{ MINIO_STORAGE : references
    SQLITE_FEEDBACK ||--o{ QDRANT_KNOWLEDGE : relates_to
```

---

## MinIO/S3 File Storage Architecture

Each uploaded document is stored in complete isolation with its own folder structure. This ensures clean separation, easy deletion, and independent file management per document.

### Bucket Structure

```mermaid
flowchart TB
    subgraph MINIO["MinIO S3 Storage"]
        subgraph BUCKET["knowledge-docs (Bucket)"]
            subgraph DOCS["documents/"]
                subgraph DOC1["📁 {doc-id-1}/"]
                    ORIG1["📄 original.pdf"]
                    subgraph PAGES1["📁 pages/"]
                        P1_1["🖼️ page-1.png"]
                        P1_2["🖼️ page-2.png"]
                        P1_N["🖼️ page-N.png"]
                    end
                end

                subgraph DOC2["📁 {doc-id-2}/"]
                    ORIG2["📄 original.docx"]
                    subgraph PAGES2["📁 pages/"]
                        P2_1["🖼️ page-1.png"]
                        P2_2["🖼️ page-2.png"]
                    end
                end

                subgraph DOC3["📁 {doc-id-3}/"]
                    ORIG3["📄 original.pptx"]
                    subgraph PAGES3["📁 pages/"]
                        P3_1["🖼️ page-1.png"]
                        P3_2["🖼️ page-2.png"]
                        P3_3["🖼️ page-3.png"]
                    end
                end
            end
        end
    end

    style DOC1 fill:#e3f2fd
    style DOC2 fill:#fff3e0
    style DOC3 fill:#e8f5e9
```

### File Storage Path Convention

```
knowledge-docs/
└── documents/
    └── {uuid-document-id}/
        ├── original.{ext}          ← Original uploaded file
        └── pages/
            ├── page-1.png          ← Page 1 image (PNG)
            ├── page-2.png          ← Page 2 image (PNG)
            └── page-N.png          ← Page N image (PNG)
```

### Document Upload & Storage Flow

```mermaid
sequenceDiagram
    participant U as User
    participant API as /api/ingest
    participant ING as ingest.ts
    participant PROC as document-processor.ts
    participant PARSE as Parser<br/>(Gemini/Unstructured)
    participant MIO as MinIO S3
    participant QD as Qdrant

    U->>API: Upload file + metadata
    API->>ING: ingestDocument()
    ING->>MIO: ensureBucket()
    Note over MIO: Create bucket if not exists<br/>Set public read policy

    ING->>PROC: processDocument()

    rect rgb(240, 248, 255)
        Note over PROC: Step 1: Store Original
        PROC->>MIO: uploadDocument(docId, buffer, filename)
        Note over MIO: documents/{docId}/original.{ext}
    end

    rect rgb(255, 248, 240)
        Note over PROC: Step 2: Parse Document
        PROC->>PARSE: parse(file)
        PARSE-->>PROC: pages[] with text + images
    end

    rect rgb(240, 255, 240)
        Note over PROC: Step 3: Store Page Images
        loop For each page
            PROC->>MIO: uploadPageImage(docId, pageNum, imageBuffer)
            Note over MIO: documents/{docId}/pages/page-{n}.png
        end
    end

    rect rgb(248, 240, 255)
        Note over PROC: Step 4: Chunk & Embed
        PROC->>PROC: chunkText()
        PROC->>QD: Store vectors with image_url payload
    end

    PROC-->>ING: ProcessingResult
    ING-->>API: Success
    API-->>U: Document ingested
```

### File Isolation Per Document

```mermaid
flowchart LR
    subgraph Upload["Document Upload"]
        PDF1[Contract.pdf]
        PDF2[Proposal.docx]
        PDF3[Slides.pptx]
    end

    subgraph Process["UUID Assignment"]
        ID1["doc-abc-123"]
        ID2["doc-def-456"]
        ID3["doc-ghi-789"]
    end

    subgraph Storage["Isolated Storage"]
        subgraph S1["documents/doc-abc-123/"]
            O1[original.pdf]
            PG1[pages/page-1.png<br/>pages/page-2.png<br/>...]
        end
        subgraph S2["documents/doc-def-456/"]
            O2[original.docx]
            PG2[pages/page-1.png<br/>pages/page-2.png<br/>...]
        end
        subgraph S3["documents/doc-ghi-789/"]
            O3[original.pptx]
            PG3[pages/page-1.png<br/>pages/page-2.png<br/>...]
        end
    end

    PDF1 --> ID1 --> S1
    PDF2 --> ID2 --> S2
    PDF3 --> ID3 --> S3

    style S1 fill:#e3f2fd,stroke:#1976d2
    style S2 fill:#fff3e0,stroke:#f57c00
    style S3 fill:#e8f5e9,stroke:#388e3c
```

### Citation Retrieval Flow

```mermaid
sequenceDiagram
    participant UI as Chat UI
    participant API as /api/citation-image
    participant RET as retrieval.ts
    participant MIO as MinIO S3

    Note over UI: User asks question
    UI->>RET: searchKnowledgeBase()
    RET->>RET: Hybrid search in Qdrant
    Note over RET: Retrieved chunks contain<br/>image_url: "documents/{docId}/pages/page-{n}.png"

    RET->>MIO: getSignedUrl(image_url)
    MIO-->>RET: Presigned URL (1hr expiry)

    RET-->>UI: Response with citation URLs

    UI->>MIO: Fetch page image via presigned URL
    MIO-->>UI: PNG image data
    Note over UI: Display answer with<br/>clickable page citations
```

### Supported File Types

| Category | Extensions | Storage Path |
|----------|------------|--------------|
| **PDF** | `.pdf` | `documents/{id}/original.pdf` |
| **Word** | `.docx`, `.doc` | `documents/{id}/original.docx` |
| **PowerPoint** | `.pptx` | `documents/{id}/original.pptx` |
| **Excel** | `.xlsx` | `documents/{id}/original.xlsx` |
| **Text** | `.txt`, `.md` | `documents/{id}/original.txt` |
| **HTML** | `.html` | `documents/{id}/original.html` |
| **Images** | `.png`, `.jpg`, `.jpeg`, `.tiff`, `.bmp`, `.heic` | `documents/{id}/original.{ext}` |
| **Page Images** | Always PNG | `documents/{id}/pages/page-{n}.png` |

### Document Deletion Flow

```mermaid
flowchart LR
    subgraph Request["DELETE /api/ingest?docId=abc-123"]
        DEL[Delete Request]
    end

    subgraph Cleanup["Cleanup Process"]
        QD1[Remove vectors from<br/>knowledge_base_hybrid]
        QD2[Remove Q&A pairs from<br/>pitch_questions]
        MIO[Delete folder:<br/>documents/abc-123/*]
        REG[Remove from registry]
    end

    subgraph Result["After Deletion"]
        CLEAN["Document completely<br/>removed from system"]
    end

    DEL --> QD1
    DEL --> QD2
    DEL --> MIO
    DEL --> REG
    QD1 --> CLEAN
    QD2 --> CLEAN
    MIO --> CLEAN
    REG --> CLEAN
```

---

## API Routes Overview

```mermaid
flowchart LR
    subgraph Chat["Chat APIs"]
        CP["/api/copilotkit<br/>POST: Chat query"]
        AS["/api/agent-state<br/>GET: Agent metadata"]
    end

    subgraph Docs["Document APIs"]
        IG["/api/ingest<br/>POST: Upload<br/>GET: List<br/>DELETE: Remove"]
        CI["/api/citations<br/>GET: Fetch citations"]
        IMG["/api/citation-image<br/>GET: Page images"]
    end

    subgraph Search["Search APIs"]
        SQ["/api/similar-questions<br/>POST: Search Q&A<br/>GET: Stats"]
    end

    subgraph Feedback["Feedback APIs"]
        FB["/api/feedback<br/>POST: Save<br/>GET: List"]
    end

    subgraph Health["Health APIs"]
        HQ["/api/health/qdrant<br/>GET: Status"]
    end
```

---

## Technology Stack

```mermaid
mindmap
    root((ZenAI Questions))
        Frontend
            Next.js 16
            React 19
            TypeScript
            TailwindCSS
            Radix UI
            CopilotKit
        Backend
            Next.js API Routes
            LangChain
            OpenAI SDK
        AI/ML
            GPT-4.1 LLM
            text-embedding-3-small
            BM25 Sparse Search
        Storage
            Qdrant Vector DB
            MinIO S3
            SQLite
        DevOps
            Docker Compose
            Environment Config
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Agentic Retrieval** | Multi-iteration search with self-reflection and confidence scoring |
| **Hybrid Search** | BM25 keyword + semantic dense vectors with RRF fusion |
| **Citation Tracking** | Inline citations with clickable page images |
| **Q&A Extraction** | LLM-powered extraction of question-answer pairs from documents |
| **Pitch Response Library** | Metadata-rich search by vertical, region, and client |
| **Feedback Collection** | Track user satisfaction with thumbs up/down |
| **Multi-Parser Support** | Gemini or Unstructured API for document processing |

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Client["Client Browser"]
        WEB[Web Application]
    end

    subgraph App["Application Server"]
        NEXT[Next.js Server<br/>Port 3000]
    end

    subgraph Services["External Services"]
        OAI[OpenAI API<br/>LLM + Embeddings]
        GEM[Google Gemini<br/>Document Parser]
    end

    subgraph Docker["Docker Services"]
        QD[Qdrant<br/>Port 6333]
        MIO[MinIO<br/>Port 9000/9001]
    end

    subgraph Data["Persistent Storage"]
        QDS[(qdrant_storage)]
        MIOS[(minio_data)]
        SQLD[(feedback.db)]
    end

    WEB <--> NEXT
    NEXT <--> OAI
    NEXT <--> GEM
    NEXT <--> QD
    NEXT <--> MIO
    NEXT <--> SQLD
    QD <--> QDS
    MIO <--> MIOS
```

---

## Quick Reference

### Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| `OPENAI_API_KEY` | OpenAI | LLM and embeddings |
| `QDRANT_URL` | Qdrant | Vector database connection |
| `QDRANT_API_KEY` | Qdrant | Authentication |
| `MINIO_ENDPOINT` | MinIO | S3 storage endpoint |
| `MINIO_ACCESS_KEY` | MinIO | Storage credentials |
| `MINIO_SECRET_KEY` | MinIO | Storage credentials |
| `GOOGLE_API_KEY` | Gemini | Document parsing |

### Collections

| Collection | Purpose | Index Type |
|------------|---------|------------|
| `knowledge_base_hybrid` | Main RAG chunks | Dense + BM25 |
| `pitch_questions` | Q&A pairs | Dense + BM25 |

---

*Last updated: December 2025*
