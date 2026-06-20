# AarogyaKul Agent Instructions

## Tech Stack
- **Backend:** Java, Spring Boot (Web, Data JPA, Security), Maven, PostgreSQL.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Axios, React Router.
- **Infrastructure:** AWS S3 (Files), Hugging Face Inference API (Llama model).
- **OCR:** Apache PDFBox (Primary), Tesseract/tess4j (Fallback for scanned PDFs).

## Core AI Pipeline (The Flagship Feature)
Implement the `AI Report Reader` in this exact sequence:
1. **Extraction:** PDFBox $\rightarrow$ (Fallback) Tesseract OCR.
2. **Structured Parsing:** Llama API call with strict JSON prompt (Parameter, Value, Unit, Ref Range).
3. **Canonicalization:** Use static `Map<String, String>` synonym map for common parameters (e.g., HbA1c).
4. **Persistence:** Save to `MedicalParameter` rows.
5. **Comparison:** Query most recent prior parameter for the same member; compute $\Delta$ and trend.
6. **Summarization:** Llama API call to convert comparison JSON into plain-English summary.
7. **Finalize:** Update `MedicalDocument` status to `COMPLETED` and create `TimelineEvent`.

## Architecture & Structure
### Backend (`com.aarogyakul`)
- `config/`: Security, S3, LlamaClient configurations.
- `service/ai/`: OcrService, LlamaClient, ParameterExtractionService, InsightGenerationService.
- `dto/`: All API responses must use DTOs (never expose entities).
- `exception/`: Global `@ControllerAdvice` returning `{"error": {"code": "...", "message": "..."}}`.

### Frontend (`src/`)
- `api/`: Typed Axios functions per resource.
- `context/`: `AuthContext` for state.
- `pages/`: Feature-level views; `components/`: Reusable UI elements.

## Critical Constraints
- **Uploads:** PDF only, max 15MB. Reject others with 400/413.
- **Async Processing:** Use `@Async` for the AI pipeline. Return `202 Accepted` immediately after S3 upload.
- **Data Model:** UUID primary keys. One family per user for MVP.
- **Security:** S3 files accessed via short-lived pre-signed URLs; passwords hashed via BCrypt.
- **MVP Boundary:** DO NOT implement medication tracking, insurance vault, or multi-family support.

## Environment Variables
- `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_REGION`
- `HUGGINGFACE_API_URL`, `HUGGINGFACE_API_KEY`, `LLAMA_MODEL_NAME`
- `JWT_SECRET`
