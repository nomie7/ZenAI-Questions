Nice, this is a solid, focused use case. I’ll draft the PRD directly in the ChatPRD template based on what you shared and make a few explicit assumptions for gaps (e.g., small internal pilot, MVP scope).

You can copy‑paste and adapt as needed.

---

# Internal RAG Knowledge Assistant

### TL;DR
Build an internal chat assistant that answers employee questions using a centralized SOP knowledge base. Employees converse via a chat interface; authorized users can upload and maintain documents (PDF, PPT) that feed a RAG pipeline. Content is parsed via Gemini Flash (page → image → text), embedded with OpenAI embeddings into Qdrant, and served via GPT‑4.1 with strict knowledge‑only answers, citations, and page images.

---

## Goals

### Business Goals
- Reduce time spent searching SOPs and internal docs by X% within 3 months of launch.
- Increase adherence to documented processes (measured via usage and spot audits).
- Decrease repetitive “how do I…” questions to ops/leadership by X% within 3 months.
- Achieve at least N weekly active users among eligible employees by end of pilot.

### User Goals
- Quickly find accurate, up‑to‑date SOP answers via natural language chat.
- Trust responses through clear citations and page previews.
- Allow designated owners to easily upload, update, or retire SOP documents.
- Avoid learning yet another tool; simple web login and immediate value.

### Non-Goals
- No per‑user private knowledge bases in v1 (all content is shared, with role‑based edit rights).
- No external customer access in v1 (internal employees only).
- No advanced analytics or dashboards in v1 (will be added later).

---

## User Stories

Internal Employee (Consumer of Knowledge)  
- As an employee, I want to ask questions in plain language, so that I can find the right SOP quickly.  
- As an employee, I want to see which document and page an answer came from, so that I can verify and read more if needed.  
- As an employee, I want the assistant to answer only using internal SOPs, so that I don’t get “hallucinated” or generic internet answers.

Knowledge Maintainer (Editor / Curator)  
- As a knowledge maintainer, I want to upload PDF/PPT SOPs, so that they become available in the assistant.  
- As a knowledge maintainer, I want to update or replace existing documents, so that employees always see the latest policies.  
- As a knowledge maintainer, I want to see a list of all documents in the knowledge base and their status, so that I can manage content lifecycle.  
- As a knowledge maintainer, I want to trigger or view parsing status for uploads, so that I know when a document is ready for use.

Admin (System Owner)  
- As an admin, I want to manage roles (employee, maintainer, admin), so that only authorized users can change the knowledge base.  
- As an admin, I want to disable or archive documents, so that outdated content stops influencing answers.

---

## Functional Requirements

Knowledge Chat (Priority: High)  
- Chat Interface: Provide a conversational UI (Next.js + shadcn) where authenticated users can submit questions and see responses.  
- Knowledge‑Only Answers: Use GPT‑4.1 with RAG; responses must be constrained to retrieved context and clearly state when no relevant information is found.  
- Citations & Page Images: For each answer, display citations pointing to specific document pages and show thumbnail images of the source pages where possible.  
- Conversation History (MVP decision): Persist session‑level history for context within a session; long‑term storage can be minimal/optional in v1.

Knowledge Management (Priority: High)  
- Document Upload: Allow users with “Knowledge Maintainer” role to upload PDF and PPT files.  
- Parsing Pipeline: For each uploaded file, convert each page to an image, send images to Gemini Flash for text extraction, and store structured text plus page references.  
- Embedding & Indexing: Generate embeddings for extracted text using OpenAI embeddings and store them in Qdrant with metadata (doc ID, page, file type, timestamps, roles).  
- Document Catalog: Provide a UI to list documents with metadata (name, type, owner, upload date, status: processing/ready/failed/archived).  
- Update/Replace Documents: Allow maintainers to replace a document; old embeddings should be invalidated/soft‑deleted and new ones indexed.  
- Archive/Disable Documents: Allow maintainers/admins to mark documents as archived so they are excluded from retrieval.

Access & Roles (Priority: High)  
- Authentication: Use Logto for login, with SSO or email/password as configured.  
- Roles & Authorization: At minimum, define roles: Employee (read/chat), Knowledge Maintainer (upload/manage docs, no system configuration), Admin (manage roles and some system settings).  
- Knowledge Visibility: Employees can’t browse raw knowledge content (files, full text) via the chat interface; they only see citations and page snippets/images. Knowledge UI is limited to maintainers/admins.

RAG & Retrieval Logic (Priority: High)  
- Context Retrieval: For each user query, retrieve top‑K relevant chunks from Qdrant.  
- Answer Generation: Use GPT‑4.1, with a system prompt enforcing: answer strictly from given context, reference citations, and admit when context is insufficient.  
- Source Linking: Ensure each answer includes references to one or more chunks mapped to document IDs and page numbers, along with image references.

System Management (Priority: Medium)  
- Basic Health View: Simple internal page (admin‑only) with status of core services: DB, Qdrant, embeddings service, parsing pipeline.  
- Basic Logs/Events: Log document uploads, parsing failures, and role changes for debugging and audit.

Analytics (Priority: Later)  
- Future: Track number of questions, topic distribution, satisfaction rating, and content gaps; not required for v1.

---

## User Experience

**Entry Point & First-Time User Experience**  
Employees access the app via an internal link. On first visit, they authenticate via Logto and land on a simple dashboard with a chat pane and a short explanation: “Ask any question about our internal SOPs.” No training is required; a few example prompts help them start. Users with maintainer/admin roles see an additional “Knowledge” tab in the navigation.

**Core Experience**

Step 1: Ask a question  
- Employee types a question into the chat box (e.g., “What is the process for onboarding a new contractor?”) and hits send.  
- The UI shows a “thinking” state while the backend performs retrieval and generation.

Step 2: Get an answer with citations  
- The assistant responds with a concise answer.  
- Below the answer, citations are shown as chips or links, each indicating document name and page number.  
- Hovering or clicking expands a side panel showing the page image and the text snippet used.

Step 3: Explore or follow‑up  
- User can click through multiple citations to compare context.  
- User can ask follow‑up questions in the same conversation; the model uses previous questions/answers plus new retrieval for context.

Step 4: No‑answer / low‑confidence behavior  
- If no relevant context is found, the assistant explicitly states it cannot answer from the current knowledge base and suggests keywords or topics the user might search for or flag for maintainers.

Knowledge Maintainer Flow  
- Maintainer navigates to “Knowledge” tab.  
- They see a table of documents with statuses.  
- Clicking “Upload” opens a form to upload PDF or PPT, assign a descriptive name, and optionally a category/tag.  
- After upload, the document enters “Processing” state. The UI shows progress (e.g., “Converting pages”, “Parsing with Gemini”, “Embedding & indexing”).  
- Once done, status changes to “Ready,” and the document is available for retrieval.  
- Maintainer can archive, rename, or replace a document from the same screen.

**Advanced Features & Edge Cases**  
- Large files: Show max size per upload and clear error messages if exceeded.  
- Parsing failure: Show “Failed” status with error message and retry option.  
- Conflicting docs: When multiple documents provide conflicting answers, model is instructed to indicate that policies may conflict and point to all relevant sources.  
- Role loss: If a user’s role is downgraded, hide the Knowledge tab at next login.

**UI/UX Highlights**  
- Clean chat‑centric layout using shadcn components.  
- Clear separation between chat for employees and knowledge management for maintainers.  
- Accessible color contrast and keyboard‑navigable controls.  
- Responsive layout for desktop‑first, with acceptable mobile experience.

---

## Narrative

Every week, employees spend time digging through shared drives, outdated slides, and long PDF manuals to answer simple questions: “How do I approve an invoice?”, “What’s our current leave policy?”, “What’s the latest onboarding process for contractors?” Answers often live in static SOPs maintained by a few experts, and those experts become bottlenecks.

With the Internal RAG Knowledge Assistant, an employee can simply open a web app, log in, and ask a natural language question. Behind the scenes, the system searches a curated knowledge base of SOPs—PDFs and PPTs that have been parsed, indexed, and embedded into a vector database. GPT‑4.1 uses only these internal sources to compose answers, returning not just text but also citations and page images, so employees can see exactly where the information came from.

Meanwhile, a small group of knowledge maintainers manages the content. They upload new SOP decks, update outdated PDFs, and monitor parsing status from a dedicated interface. When a policy changes, they replace the document, and the assistant’s answers reflect the new reality without any extra engineering work.

The result is a single, trusted entry point for “how we work” knowledge: employees move faster, maintainers keep control of accuracy, and leadership gains confidence that people are following the latest documented processes.

---

## Success Metrics

### User-Centric Metrics
- Weekly active users (WAU) among eligible employees.  
- Median time from question to first answer.  
- User‑reported satisfaction score (e.g., 1–5 rating after answers).  
- Percentage of sessions where users view at least one citation/page image.

### Business Metrics
- Reduction in repetitive SOP questions in internal channels (Slack/Teams/email) as measured by sample audits.  
- Reduction in time to complete key processes (e.g., onboarding, approvals) where SOP clarity is a known bottleneck.  
- Number of outdated SOP incidents reported post‑launch versus pre‑launch.

### Technical Metrics
- RAG latency: p95 end‑to‑end response time below X seconds.  
- Parsing pipeline success rate above Y% for supported file formats.  
- Qdrant and app uptime within target (e.g., > 99% during business hours).  
- Low incidence of “no context” errors for common, documented queries.

### Tracking Plan
- Events to track:  
  - `user_login` (with role)  
  - `chat_message_sent`  
  - `chat_answer_returned` (with latency, context_hits count)  
  - `no_context_answer_returned`  
  - `citation_clicked` / `page_image_viewed`  
  - `document_uploaded`, `document_processing_started`, `document_processing_completed`, `document_processing_failed`  
  - `document_archived` / `document_replaced`  
  - `role_changed`

---

## Technical Considerations

### Technical Needs
- Frontend: Next.js app with shadcn for UI components and Copilot Kit for chat orchestration.  
- Backend: Next.js API routes or app router handlers for auth integration, upload handling, parsing pipeline orchestration, retrieval, and chat APIs.  
- RAG Engine: LangChain.js for chaining retrieval (Qdrant) and GPT‑4.1 calls with strict context‑only instructions.  
- Storage:  
  - Qdrant for vector embeddings.  
  - A relational or document DB (e.g., Postgres) for documents, pages, roles, and metadata.  
  - Object storage for original files and generated page images.

### Integration Points
- Logto for authentication and role mapping.  
- Google Gemini Flash for page image to text parsing.  
- OpenAI embeddings API for vector generation.  
- OpenAI GPT‑4.1 for answer generation.

### Data Storage & Privacy
- Internal, non‑PII SOP data only in v1; no special compliance requirements.  
- Store minimal user identifiers necessary for auth and basic logs.  
- Ensure access control checks on all document and management APIs (role‑based).

### Scalability & Performance
- Target initial load: small internal pilot (tens to low hundreds of weekly users).  
- Architecture should support scaling Qdrant and app servers horizontally as usage grows.  
- Use batching and async processing for parsing and embeddings to handle larger document uploads without blocking.

### Potential Challenges
- Parsing reliability, especially for complex PPT layouts or scanned PDFs; may require iteration on image quality and Gemini prompts.  
- Ensuring strict “knowledge‑only” behavior from GPT‑4.1; will require careful system prompts, context windows, and refusal patterns.  
- Maintaining consistent roles and permissions between Logto and internal role model.  
- Handling document versioning cleanly so old embeddings are not accidentally used.

---

## Milestones & Sequencing

### Project Estimate
- Overall: Medium (2–4 weeks) for a functional MVP with a small team.

### Team Size & Composition
- Small team (1–2 people):  
  - 1 Full‑stack engineer (Next.js, LangChain.js, infra).  
  - Optional: 0.5 Product/Designer (could be the same person as engineer for MVP).

### Suggested Phases

**Phase 1 – Core RAG Chat MVP (1–2 weeks)**  
- Deliverables:  
  - Auth via Logto; basic roles stubbed.  
  - Simple chat UI using Next.js + shadcn + Copilot Kit.  
  - Basic RAG pipeline wired: hard‑coded sample documents, embeddings in Qdrant, GPT‑4.1 answers with citations.  
- Dependencies: OpenAI keys, Qdrant instance, basic infra.

**Phase 2 – Knowledge Management & Parsing (1–2 weeks)**  
- Deliverables:  
  - Upload UI for PDF/PPT for maintainers.  
  - Parsing pipeline: page → image → Gemini Flash → text; embeddings with OpenAI; indexing into Qdrant.  
  - Document catalog UI with status, archive/replace actions.  
  - Citation UI with page images.  
- Dependencies: Gemini access, object storage.

**Phase 3 – Hardening & Pilot Rollout (optional, 1–2 weeks)**  
- Deliverables:  
  - Role management via Logto integration.  
  - Reliability improvements, logging, and simple internal health view.  
  - Instrumentation for basic metrics and event tracking.  
- Dependencies: Agreement on pilot group and rollout plan.

---

If you’d like, next step I can tighten any specific section (e.g., Technical Considerations or User Experience) to match exactly how you plan to implement in Next.js or LangChain.js. Which part do you want to refine first?