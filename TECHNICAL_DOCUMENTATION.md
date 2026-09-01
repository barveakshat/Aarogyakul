<p align="center">
  <img src="aarogyakul-frontend/public/logo.svg" alt="AarogyaKul" width="64" />
</p>

<h1 align="center">AarogyaKul — Technical Documentation</h1>
<p align="center"><em>Hackathon Submission · BharatAcademix CodeQuest 2026</em></p>

<p align="center">
  <a href="https://github.com/barveakshat/Aarogyakul">
    <strong>🔗 View GitHub Repository</strong>
  </a>
</p>

---

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [System Architecture](#4-system-architecture)
5. [AI Report Reader — Deep Dive](#5-ai-report-reader--deep-dive)
6. [Data Model](#6-data-model)
7. [Backend Architecture](#7-backend-architecture)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Security Design](#9-security-design)
10. [API Reference](#10-api-reference)
11. [Design Decisions & Trade-offs](#11-design-decisions--trade-offs)
12. [Future Roadmap](#12-future-roadmap)

---

## 1. Executive Summary

**AarogyaKul** is a full-stack, AI-powered healthcare platform that transforms how Indian families manage medical records. It converts unstructured laboratory-report PDFs into structured, comparable health parameters using a multi-stage AI pipeline powered by Meta's Llama 3.1 model.

The platform supports Netflix-style multi-profile workspaces, a comprehensive document vault, an intelligent health timeline, and a smart AI insights engine that flags anomalies and generates actionable health summaries — all secured with JWT authentication and owner-scoped authorization.

**Key Metrics:**

| Metric                    | Value                                                                         |
| ------------------------- | ----------------------------------------------------------------------------- |
| AI extraction time        | < 3 seconds                                                                   |
| Document types supported  | 8                                                                             |
| Pipeline stages           | 7 (Extract → Parse → Canonicalize → Persist → Compare → Summarize → Finalize) |
| Entities in data model    | 9                                                                             |
| REST endpoints            | 18+                                                                           |
| Parameter synonyms mapped | 26                                                                            |

---

## 2. Problem Statement

Indian families face a fragmented healthcare record system:

- **Scattered records** — Medical documents live across WhatsApp threads, email attachments, phone galleries, and physical folders
- **Unstructured data** — Lab reports are PDFs with no machine-readable structure; comparing values across time is manual
- **No family context** — Each family member's records are isolated; there's no unified view of family health
- **No longitudinal tracking** — Patients can't easily see if their HbA1c improved since last year
- **Doctor context loss** — Clinicians lack a quick summary of a patient's history, allergies, and trends

### Who This Affects

- **Patients** managing chronic conditions (diabetes, thyroid, cholesterol) who need trend tracking
- **Caregivers** managing health records for elderly parents or young children
- **Doctors** who need a quick snapshot of a patient's history before a consultation

---

## 3. Solution Overview

AarogyaKul addresses each pain point with a dedicated feature:

| Problem                  | Feature                     | How It Works                                                     |
| ------------------------ | --------------------------- | ---------------------------------------------------------------- |
| Scattered records        | **Document Vault**          | Centralized storage for 8 document types with category filtering |
| Unstructured data        | **AI Report Reader**        | PDFBox + OCR + Llama extracts structured parameters from PDFs    |
| No family context        | **Multi-Profile Workspace** | Netflix-style profile picker; each member has independent data   |
| No longitudinal tracking | **Trend Comparison**        | Auto-compares each parameter with the most recent prior value    |
| Doctor context loss      | **Smart AI Insights**       | Status banner + flagged anomalies + clinical notes in one view   |

### Feature Matrix

```
┌─────────────────────────────────────────────────────┐
│                   AAROGYAKUL                        │
├──────────────┬──────────────┬───────────────────────┤
│  AI Report   │  Document    │  Health               │
│  Reader      │  Vault       │  Timeline             │
│  ──────────  │  ──────────  │  ──────────           │
│  • PDFBox    │  • 8 types   │  • Auto events        │
│  • OCR       │  • Category  │  • Manual entries      │
│  • Llama AI  │    filtering │  • Doctor visits       │
│  • Compare   │  • Upload    │  • Vaccinations        │
│  • Summarize │    modal     │  • Surgeries           │
├──────────────┼──────────────┼───────────────────────┤
│  Multi-      │  Smart AI    │  Clinical              │
│  Profile     │  Insights    │  Notes                 │
│  ──────────  │  ──────────  │  ──────────            │
│  • Netflix   │  • Status    │  • Allergies           │
│    picker    │    banner    │    + severity          │
│  • Per-      │  • Flagged   │  • Chronic             │
│    member    │    anomalies │    conditions          │
│    data      │  • Trend     │  • Diagnosis           │
│  • Owner-    │    table     │    dates               │
│    managed   │  • AI detail │                        │
└──────────────┴──────────────┴───────────────────────┘
```

---

## 4. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19 + TypeScript)                │
│          SPA (Vite + Tailwind) · AuthContext · ProfileContext      │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS + JWT
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 BACKEND (Spring Boot 3.5 / Java 21)                │
│                                                                     │
│   ┌──────────────────┐    ┌──────────────────┐                     │
│   │ Spring Security   │───▶│ REST Controllers │                     │
│   │ (JWT Filter)      │    └────────┬─────────┘                     │
│   └──────────────────┘             │                                │
│                           ┌────────▼─────────┐                     │
│                           │ Business Services │                     │
│                           └──┬─────────┬─────┘                     │
│                              │         │                            │
│                    ┌─────────▼──┐  ┌───▼──────────────┐            │
│                    │ JPA Repos   │  │ AI Pipeline Svcs │            │
│                    └──────┬──────┘  └───┬──────────────┘            │
└───────────────────────────┼─────────────┼──────────────────────────┘
                            │             │
              ┌─────────────▼──┐   ┌──────▼───────────┐   ┌─────────┐
              │  PostgreSQL 17  │   │ HuggingFace API  │   │ AWS S3  │
              │   (Database)    │   │ (Llama 3.1)      │   │(Storage)│
              └────────────────┘   └──────────────────┘   └─────────┘
```

### Request Flow

```
User Action → React Component → Axios API Client → Spring Security JWT Filter
  → Controller (validates DTO) → Service (business logic + ownership check)
    → Repository (JPA query) → PostgreSQL
  ← Response DTO ← Controller ← Service
← Axios Response ← React State Update → UI Re-render
```

### Technology Stack Detail

| Layer                 | Technology            | Version | Justification                                    |
| --------------------- | --------------------- | ------- | ------------------------------------------------ |
| **Frontend Runtime**  | React                 | 19      | Component model, hooks, concurrent features      |
| **Frontend Build**    | Vite                  | 8       | Sub-second HMR, native ESM                       |
| **Frontend Styling**  | Tailwind CSS          | 4       | Utility-first, design token integration          |
| **Frontend Charts**   | Recharts              | 2       | React-native charting with composable API        |
| **Frontend Routing**  | React Router          | 7       | Declarative routing with nested layouts          |
| **HTTP Client**       | Axios                 | 1.9     | Interceptors for JWT injection and error mapping |
| **Backend Framework** | Spring Boot           | 3.5     | Production-grade DI, security, data access       |
| **Backend Language**  | Java                  | 21      | Virtual threads, pattern matching, records       |
| **Security**          | Spring Security       | 6       | Stateless JWT filter chain                       |
| **ORM**               | Spring Data JPA       | 3.5     | Repository abstraction over Hibernate            |
| **Database**          | PostgreSQL            | 17      | ACID transactions, UUID support, JSON columns    |
| **PDF Processing**    | Apache PDFBox         | 3       | Pure-Java PDF text extraction                    |
| **OCR Fallback**      | tess4j (Tesseract)    | 5       | Industry-standard OCR for scanned PDFs           |
| **AI Model**          | Llama 3.1 8B Instruct | —       | Instruction-tuned for structured extraction      |
| **AI API**            | HuggingFace Inference | —       | Managed inference, no GPU provisioning           |
| **Object Storage**    | AWS S3 SDK v2         | 2.31    | Pre-signed URLs, regional bucket support         |
| **Containerization**  | Docker Compose        | —       | One-command PostgreSQL provisioning              |

---

## 5. AI Report Reader — Deep Dive

The AI Report Reader is the flagship feature — a 7-stage pipeline that transforms a raw PDF into actionable health intelligence.

### Pipeline Architecture

```
 STAGE 1: INTAKE          STAGE 2: EXTRACT       STAGE 3: PARSE
┌────────────────────┐   ┌───────────────────┐   ┌───────────────────────┐
│                    │   │                   │   │                       │
│  PDF Upload        │   │  PDFBox Text      │   │  Llama JSON           │
│       │            │   │  Extraction       │   │  Extraction           │
│       ▼            │   │       │           │   │       │               │
│  Validate          │   │       ▼           │   │       ▼               │
│  (PDF, ≤15MB)      │   │  < 50 chars?      │   │  JSON Recovery        │
│       │            │   │   Yes ──▶ Tesseract│   │  & Validation         │
│       ▼            │   │          OCR 250dpi│   │                       │
│  Store (S3/Local)  │   │                   │   │                       │
│       │            │   │                   │   │                       │
│       ▼            │   │                   │   │                       │
│  Return 202        │   │                   │   │                       │
└────────┼───────────┘   └─────────┼─────────┘   └───────────┼───────────┘
         └──────────────────────▶──┘──────────────────────▶──┘
                                                             │
 STAGE 4: NORMALIZE      STAGE 5: PERSIST       STAGE 6: COMPARE
┌────────────────────┐   ┌───────────────────┐   ┌───────────────────────┐
│                    │   │                   │   │                       │
│  Parameter         │   │  Save             │   │  Query Prior Values   │
│  Canonicalization   │──▶│  MedicalParameter │──▶│       │               │
│  (synonym map)     │   │  Rows to DB       │   │       ▼               │
│                    │   │                   │   │  Calculate Δ & Trend  │
└────────────────────┘   └───────────────────┘   └───────────┼───────────┘
                                                             │
                                              STAGE 7: SUMMARIZE
                                             ┌───────────────────────┐
                                             │                       │
                                             │  Llama Plain-English  │
                                         ◀───│  Summary Generation   │
                                             │       │               │
                                             │       ▼               │
                                             │  Mark COMPLETED       │
                                             │  + Timeline Event     │
                                             └───────────────────────┘
```

### Stage-by-Stage Breakdown

#### Stage 1: Intake & Validation

**Class:** `DocumentService`

- Validates file is `application/pdf` and ≤ 15 MB
- Stores the original PDF via `StorageService` (pluggable: local FS or S3)
- Creates a `MedicalDocument` entity with status `PENDING`
- Returns `202 Accepted` immediately — processing is fully async
- Only `BLOOD_REPORT` and `LAB_REPORT` types trigger AI processing; other types are stored with status `COMPLETED`

#### Stage 2: Text Extraction

**Class:** `OcrService`

```java
public String extractText(Path pdf) {
    // 1. Try PDFBox embedded text extraction
    String text = PDDocument.load(pdf) → PDFTextStripper

    // 2. If extracted text is too short (< 50 chars),
    //    fall back to Tesseract OCR
    if (text.length() < 50) {
        text = renderPagesAt250DPI() → Tesseract.doOCR()
    }
    return text;
}
```

- PDFBox extracts embedded text from digitally-generated PDFs
- For scanned/image-based PDFs, pages are rendered at 250 DPI and passed to Tesseract
- The threshold (50 characters) prevents false positives from watermark-only PDFs

#### Stage 3: Structured Parsing

**Class:** `ParameterExtractionService`

The extracted raw text is sent to Llama 3.1 with a strict JSON prompt:

```
System: You are a medical document parser. Extract every lab parameter
into JSON: { reportDate, parameters: [{ name, value, unit,
referenceRangeLow, referenceRangeHigh }] }

User: [raw report text]
```

**JSON Recovery:** The service handles common LLM output issues:

- Strips markdown code fences (` ```json ... ``` `)
- Regex-recovers JSON objects from mixed text responses
- Validates field presence before constructing records
- Omits parameters where value is null or unparseable

#### Stage 4: Parameter Canonicalization

**Class:** `ParameterUtils`

A static synonym map normalizes parameter names for consistent comparison:

| Input Variations                                           | Canonical Name            |
| ---------------------------------------------------------- | ------------------------- |
| `hba1c`, `hb a1c`, `hemoglobin a1c`, `glycated hemoglobin` | `HbA1c`                   |
| `ldl`, `ldl cholesterol`                                   | `LDL`                     |
| `vitamin d`, `25-hydroxy vitamin d`, `25 oh vitamin d`     | `Vitamin D`               |
| `hemoglobin`, `haemoglobin`, `hb`                          | `Hemoglobin`              |
| `fbs`, `fasting blood glucose`, `glucose fasting`          | `Blood Glucose (Fasting)` |
| `tsh`, `thyroid stimulating hormone`                       | `TSH`                     |
| `serum creatinine`, `creatinine`                           | `Creatinine`              |

Currently maps **26 synonyms** to **12 canonical names**. This ensures that "HbA1c" from Lab A matches "Glycated Hemoglobin" from Lab B.

#### Stage 5: Persistence

**Class:** `DocumentProcessingService`

Each extracted parameter becomes a `MedicalParameter` row:

```
MedicalParameter {
    id: UUID (auto)
    document: → MedicalDocument
    familyMember: → FamilyMember
    parameterName: "HbA1c"        (canonicalized)
    value: 6.1                     (BigDecimal)
    unit: "%"
    referenceRangeLow: 4.0
    referenceRangeHigh: 5.6
    reportDate: 2026-06-21
}
```

#### Stage 6: Trend Comparison

**Class:** `ComparisonService`

For each new parameter, the service queries the most recent prior value for the same member + parameter name:

```sql
SELECT * FROM medical_parameters
WHERE family_member_id = ? AND parameter_name = ?
  AND report_date < ?
ORDER BY report_date DESC, created_at DESC
LIMIT 1
```

**Trend Algorithm:**

1. Calculate absolute change: `Δ = current - previous`
2. Calculate percentage change: `Δ% = (Δ / previous) × 100`
3. Determine trend direction using reference-range midpoint proximity:

```
if |Δ| / max(|previous|, 1) < 5%  →  STABLE
if no reference range              →  increase = WORSENING, decrease = IMPROVING
midpoint = (refLow + refHigh) / 2
if distance_to_midpoint decreased by >10%  →  IMPROVING
if distance_to_midpoint increased by >10%  →  WORSENING
else                                        →  STABLE
```

This approach is clinically meaningful: a value moving _toward_ the normal midpoint is improving, even if it's still out of range.

#### Stage 7: Summarization & Finalization

**Class:** `InsightGenerationService`

The comparison data is sent to Llama for plain-English summarization:

```
System: Summarize these lab comparisons for a patient.
Highlight what improved, what worsened, and what needs attention.

User: [JSON array of ComparisonData]
```

**Finalization steps:**

1. Save `AiInsight` with summary text + raw comparison JSON
2. Update `MedicalDocument.processingStatus` → `COMPLETED`
3. Create a `TimelineEvent` linking back to the document

**Failure handling:** Any exception at any stage transitions the document to `FAILED` with a user-visible error message. The temp PDF is always deleted in the `finally` block.

---

## 6. Data Model

### Entity Relationship Diagram

```
                          ENTITY RELATIONSHIP DIAGRAM

 ┌──────────┐    1:1     ┌──────────┐    1:N     ┌─────────────────┐
 │   USER   │───────────▶│  FAMILY  │───────────▶│  FAMILY_MEMBER  │
 └──────────┘  owns      └──────────┘  contains  └───────┬─────────┘
                                                         │
                         ┌───────────────┬───────────────┬┼──────────────┐
                         │               │               │              │
                         ▼               ▼               ▼              ▼
                  ┌─────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────┐
                  │  MEDICAL    │ │  TIMELINE    │ │ ALLERGY  │ │   CHRONIC    │
                  │  DOCUMENT   │ │  EVENT       │ │          │ │  CONDITION   │
                  └──────┬──────┘ └──────────────┘ └──────────┘ └──────────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
              ▼          ▼          ▼
       ┌──────────┐ ┌──────────┐ ┌──────────────┐
       │ MEDICAL  │ │   AI     │ │  TIMELINE    │
       │PARAMETER │ │ INSIGHT  │ │  EVENT       │
       └──────────┘ └──────────┘ │ (auto-gen)   │
                                 └──────────────┘
```

**Entity Details:**

| Entity                | Key Fields                                                                                                                                                                  | Relationships                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **USER**              | `id` (UUID, PK), `email` (unique), `password_hash`, `full_name`, `phone_number`                                                                                             | Owns 1 Family                                          |
| **FAMILY**            | `id` (UUID, PK), `owner_id` (FK→User), `family_name`                                                                                                                        | Contains N FamilyMembers                               |
| **FAMILY_MEMBER**     | `id` (UUID, PK), `family_id` (FK), `full_name`, `date_of_birth`, `gender`, `blood_group`, `relationship_to_owner`, `profile_photo_url`                                      | Has N Documents, Allergies, Conditions, Events         |
| **MEDICAL_DOCUMENT**  | `id` (UUID, PK), `family_member_id` (FK), `document_type` (enum), `file_name`, `file_url`, `file_size_bytes`, `report_date`, `processing_status` (enum), `processing_error` | Contains N Parameters, 0-1 AiInsight, N TimelineEvents |
| **MEDICAL_PARAMETER** | `id` (UUID, PK), `document_id` (FK), `family_member_id` (FK), `parameter_name`, `value` (decimal), `unit`, `reference_range_low`, `reference_range_high`, `report_date`     | Belongs to Document + Member                           |
| **AI_INSIGHT**        | `id` (UUID, PK), `document_id` (FK), `family_member_id` (FK), `summary_text`, `comparison_json`, `model_used`                                                               | Belongs to Document                                    |
| **ALLERGY**           | `id` (UUID, PK), `member_id` (FK), `allergen`, `severity`, `notes`                                                                                                          | Belongs to Member                                      |
| **CHRONIC_CONDITION** | `id` (UUID, PK), `member_id` (FK), `condition_name`, `diagnosed_date`, `notes`                                                                                              | Belongs to Member                                      |
| **TIMELINE_EVENT**    | `id` (UUID, PK), `family_member_id` (FK), `related_document_id` (FK, nullable), `event_type` (enum), `event_date`, `title`, `description`                                   | Belongs to Member, optionally linked to Document       |

### Key Design Choices

- **UUID primary keys** across all entities — no sequential IDs exposed in URLs
- **Soft ownership chain:** User → Family → FamilyMember → all downstream data
- **Denormalized `family_member_id`** on `MedicalParameter` and `AiInsight` for efficient member-scoped queries
- **BigDecimal for medical values** — floating-point imprecision is unacceptable in clinical data

---

## 7. Backend Architecture

### Package Structure

```
com.aarogyakul/
├── config/
│   ├── SecurityConfig          # JWT filter chain, CORS, BCrypt encoder
│   ├── AsyncConfig             # Bounded thread pool for AI pipeline
│   └── S3Config                # AWS S3 client bean
├── controller/
│   ├── AuthController          # POST /register, /login
│   ├── FamilyController        # Family CRUD
│   ├── MemberController        # Member + allergy + condition CRUD
│   ├── DocumentController      # Upload, list, get, delete documents
│   └── TimelineController      # Timeline CRUD (GET, POST, DELETE)
├── service/
│   ├── AuthService             # Registration, login, JWT issuance
│   ├── FamilyService           # Family creation, ownership validation
│   ├── MemberService           # Member CRUD, owned-member guard
│   ├── DocumentService         # Upload orchestration, AI gating
│   ├── TimelineService         # Manual + auto timeline management
│   ├── StorageService          # Interface: store(), retrieve(), delete()
│   ├── LocalStorageService     # File system implementation
│   ├── S3StorageService        # AWS S3 implementation
│   └── Mapper                  # Entity → DTO mapping
├── service/ai/
│   ├── DocumentProcessingService   # @Async pipeline orchestrator
│   ├── OcrService                  # PDFBox + Tesseract extraction
│   ├── ParameterExtractionService  # Llama JSON parsing
│   ├── ComparisonService           # Historical trend analysis
│   ├── InsightGenerationService    # Llama summarization
│   └── LlamaClient                # HuggingFace API client
├── entity/                     # 9 JPA entities
├── repository/                 # Spring Data JPA interfaces
├── dto/Dtos.java               # All request/response records
├── util/
│   ├── Enums.java              # DocumentType, ProcessingStatus, etc.
│   └── ParameterUtils.java     # Synonym canonicalization map
├── exception/
│   ├── ApiException.java       # Typed exception factory
│   └── GlobalExceptionHandler  # @ControllerAdvice → error envelope
└── security/
    ├── JwtFilter               # OncePerRequestFilter
    ├── JwtUtil                 # HS256 token generation/validation
    └── CurrentUser             # Authenticated user accessor
```

### Async AI Executor

```java
@Bean("aiTaskExecutor")
ThreadPoolTaskExecutor aiTaskExecutor() {
    var exec = new ThreadPoolTaskExecutor();
    exec.setCorePoolSize(2);
    exec.setMaxPoolSize(4);
    exec.setQueueCapacity(20);
    exec.setThreadNamePrefix("ai-pipeline-");
    return exec;
}
```

- Core 2 threads handle steady-state load
- Bursts up to 4 threads for parallel uploads
- Queue of 20 prevents memory exhaustion under spike load
- Named threads enable easy log filtering

### Error Handling

All API errors follow a consistent envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Only PDF uploads are supported"
  }
}
```

Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN`, `PROCESSING_ERROR`, `INTERNAL_ERROR`

---

## 8. Frontend Architecture

### Component Hierarchy

```
<BrowserRouter>
  <AuthProvider>
    <ProfileProvider>
      <App>
        <Routes>
          / → LandingPage
          /login → LoginPage
          /register → RegisterPage
          /app/profiles → ProfilePickerPage
          /app/* → <PrivateRoute> + <ProfileGuard>
            <AppLayout>  (sidebar + header + outlet)
              /app → DashboardPage
              /app/vault → DocumentVaultPage
              /app/insights → UploadPage (AI Insights)
              /app/timeline → TimelinePage
              /app/clinical → ClinicalPage
              /app/profile → MemberProfilePage
            </AppLayout>
```

### State Management

| Context          | Purpose                              | Persistence                                     |
| ---------------- | ------------------------------------ | ----------------------------------------------- |
| `AuthContext`    | JWT token, user object, login/logout | `localStorage` (`aarogyakul_token`)             |
| `ProfileContext` | Active family member profile         | `localStorage` (`aarogyakul_active_profile_id`) |

### Profile-First UX Flow

```
                     ┌─────────────┐
                     │    Login    │
                     └──────┬──────┘
                            │
                            ▼
                   ┌─── Has Profile? ───┐
                   │                    │
                Yes ▼                   ▼ No
            ┌───────────┐      ┌───────────────┐
            │ Dashboard │◀─────│Profile Picker │◀──┐
            └─────┬─────┘      └───┬───────┬───┘   │
                  │                │       │        │
                  ▼                ▼       ▼        │
          ┌──────────────┐  ┌────────┐ ┌────────┐   │
          │Switch Profile│  │ Select │ │  Add   │───┘
          └──────┬───────┘  │ Member │ │ Member │
                 │          └────┬───┘ └────────┘
                 │               │
                 └───────────────┘
```

### Design System

The frontend uses a custom Tailwind design token system:

| Token  | Value              | Usage                          |
| ------ | ------------------ | ------------------------------ |
| `pri`  | `#6366F1` (Indigo) | Primary actions, active states |
| `sec`  | `#8B5CF6` (Violet) | Gradients, secondary accents   |
| `aqua` | `#06B6D4` (Cyan)   | Accent gradients               |
| `norm` | `#16A34A` (Green)  | Normal/healthy status          |
| `warn` | `#D97706` (Amber)  | Attention-needed status        |
| `crit` | `#DC2626` (Red)    | Critical/out-of-range status   |
| `sbBg` | `#0A0F1C`          | Sidebar dark background        |

Colors `norm`, `warn`, and `crit` are **semantically reserved** for medical status — they never appear decoratively.

---

## 9. Security Design

### Authentication Flow

```
  User              Frontend            Spring Security      AuthService         PostgreSQL
   │                   │                      │                   │                   │
   │  Login (email,    │                      │                   │                   │
   │  password)        │                      │                   │                   │
   │──────────────────▶│                      │                   │                   │
   │                   │  POST /auth/login    │                   │                   │
   │                   │─────────────────────▶│                   │                   │
   │                   │                      │  authenticate()   │                   │
   │                   │                      │──────────────────▶│                   │
   │                   │                      │                   │  Find by email    │
   │                   │                      │                   │──────────────────▶│
   │                   │                      │                   │◀──── User entity ─│
   │                   │                      │                   │                   │
   │                   │                      │                   │  BCrypt.matches() │
   │                   │                      │                   │  JwtUtil.generate()│
   │                   │                      │◀── AuthResponse ──│                   │
   │                   │◀── 200 + {token} ────│                   │                   │
   │                   │                      │                   │                   │
   │                   │  Store token in      │                   │                   │
   │                   │  localStorage        │                   │                   │
   │                   │                      │                   │                   │
   │                   │  GET /families/me     │                   │                   │
   │                   │  (Bearer token)      │                   │                   │
   │                   │─────────────────────▶│                   │                   │
   │                   │                      │ JwtFilter         │                   │
   │                   │                      │ validates token   │                   │
   │                   │◀── 200 + Family ─────│                   │                   │
   │                   │                      │                   │                   │
```

### Authorization Model

Every resource access passes through an ownership chain:

```
Request → JWT Filter → Extract userId from token
  → Controller → Service.requireOwnedMember(memberId, userId)
    → Does member belong to a family owned by userId?
      → Yes: proceed
      → No: throw 403 Forbidden
```

### Security Measures

| Measure          | Implementation                                         |
| ---------------- | ------------------------------------------------------ |
| Password hashing | BCrypt, strength 12                                    |
| Token algorithm  | HS256 (HMAC-SHA256)                                    |
| Token expiry     | 24 hours (configurable)                                |
| CORS             | Explicit origin whitelist                              |
| File validation  | PDF MIME type + extension + 15 MB limit                |
| S3 access        | Short-lived pre-signed URLs (not direct bucket access) |
| DTO boundary     | JPA entities never serialized to HTTP responses        |
| SQL injection    | JPA parameterized queries (no raw SQL)                 |

---

## 10. API Reference

### Authentication

| Method | Endpoint             | Body                                          | Response                                   |
| ------ | -------------------- | --------------------------------------------- | ------------------------------------------ |
| POST   | `/api/auth/register` | `{ email, password, fullName, phoneNumber? }` | `{ userId, email, fullName, accessToken }` |
| POST   | `/api/auth/login`    | `{ email, password }`                         | `{ userId, email, fullName, accessToken }` |

### Family & Members

| Method | Endpoint                           | Description                                  |
| ------ | ---------------------------------- | -------------------------------------------- |
| POST   | `/api/families`                    | Create family workspace (1 per user)         |
| GET    | `/api/families/me`                 | Get authenticated user's family + members    |
| POST   | `/api/families/{familyId}/members` | Add a family member                          |
| GET    | `/api/members/{memberId}`          | Get member profile with allergies/conditions |
| PUT    | `/api/members/{memberId}`          | Update member profile                        |
| DELETE | `/api/members/{memberId}`          | Delete member and all linked records         |

### Documents & AI

| Method | Endpoint                            | Description                            |
| ------ | ----------------------------------- | -------------------------------------- |
| POST   | `/api/members/{memberId}/documents` | Upload PDF → returns `202 Accepted`    |
| GET    | `/api/members/{memberId}/documents` | List member's documents                |
| GET    | `/api/documents/{documentId}`       | Get document + parameters + AI insight |
| DELETE | `/api/documents/{documentId}`       | Delete document and derived data       |

### Timeline

| Method | Endpoint                                     | Description                                 |
| ------ | -------------------------------------------- | ------------------------------------------- |
| GET    | `/api/members/{memberId}/timeline`           | List events (reverse chronological)         |
| POST   | `/api/members/{memberId}/timeline`           | Create manual event                         |
| DELETE | `/api/members/{memberId}/timeline/{eventId}` | Delete manual event (auto events protected) |

### Clinical Data

| Method | Endpoint                                  | Description           |
| ------ | ----------------------------------------- | --------------------- |
| POST   | `/api/members/{memberId}/allergies`       | Add allergy           |
| DELETE | `/api/members/{memberId}/allergies/{id}`  | Remove allergy        |
| POST   | `/api/members/{memberId}/conditions`      | Add chronic condition |
| DELETE | `/api/members/{memberId}/conditions/{id}` | Remove condition      |

---

## 11. Design Decisions & Trade-offs

### Why Llama 3.1 via HuggingFace?

**Decision:** Use HuggingFace's managed inference API rather than self-hosting a model.

**Rationale:** For a hackathon MVP, managed inference eliminates GPU provisioning complexity. The 8B Instruct variant balances extraction quality with response latency. The strict JSON prompt + regex recovery handles the model's occasional markdown output.

**Trade-off:** Dependency on external API availability. Mitigated by clear FAILED status transitions and user-visible error messages.

### Why Synchronous Upload + Async Processing?

**Decision:** Return `202 Accepted` immediately after file storage; process via `@Async` executor.

**Rationale:** AI processing takes 2-5 seconds. Blocking the HTTP thread would degrade UX and risk timeouts. The bounded executor (2-4 threads, queue 20) prevents resource exhaustion while enabling concurrent processing.

**Trade-off:** Frontend must poll for completion. Implemented via 5-second interval that auto-stops when no PENDING/PROCESSING documents remain.

### Why Netflix-Style Profiles Over User-Per-Member?

**Decision:** One authenticated user manages multiple family member profiles.

**Rationale:** In Indian families, one tech-savvy member typically manages health records for everyone. Requiring separate accounts per family member adds friction without adding value. The OTT-style picker provides per-member data isolation while keeping auth simple.

### Why Parameter Canonicalization Over Free-Text?

**Decision:** Static synonym map over unrestricted AI-generated names.

**Rationale:** Without canonicalization, "HbA1c" from Lab A wouldn't match "Glycated Hemoglobin" from Lab B, breaking trend comparison. A deterministic map guarantees consistent matching. 26 synonyms cover the most common Indian lab report parameters.

**Trade-off:** Less common parameters pass through uncanonicalized. Acceptable for MVP; the map is trivially extensible.

### Why Separate Document Vault From AI Insights?

**Decision:** Document Vault stores all 8 document types; AI Insights only processes blood/lab reports.

**Rationale:** Not all medical documents contain extractable parameters. Prescriptions, bills, insurance docs, and medical IDs are valuable for storage but don't need AI processing. Gating the AI pipeline prevents wasted API calls and misleading extraction attempts on non-lab documents.

---

## 12. Future Roadmap

| Priority  | Feature                    | Description                                                      |
| --------- | -------------------------- | ---------------------------------------------------------------- |
| 🔴 High   | **Encrypted storage**      | AES-256 at-rest encryption for document metadata                 |
| 🔴 High   | **FHIR export**            | HL7 FHIR R4 compatible data export for clinical interoperability |
| 🟡 Medium | **Multilingual summaries** | Hindi, Marathi, Tamil summary generation via Llama               |
| 🟡 Medium | **Smart alerts**           | Push notifications when parameter trends indicate risk           |
| 🟡 Medium | **Medication tracking**    | Drug name, dosage, schedule, and interaction warnings            |
| 🟢 Future | **Consent-based sharing**  | Share specific reports with doctors via time-limited links       |
| 🟢 Future | **Audit trails**           | Immutable log of all data access for compliance                  |
| 🟢 Future | **Multi-family support**   | Multiple family workspaces per user (joint families)             |

---

<p align="center"><strong>AarogyaKul</strong> — Turning scattered medical PDFs into structured, comparable, AI-powered family health intelligence.</p>

<p align="center">
  <em>Built for BharatAcademix CodeQuest Hackathon 2026</em>
</p>
