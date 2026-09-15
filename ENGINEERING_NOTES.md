# AarogyaKul — Engineering & Architectural Decisions

This document tracks the major technical, architectural, and product decisions made during the development of AarogyaKul. It serves as a personal reference for technical interviews to explain the "why" behind the code.

## 1. Core Architecture & Stack
*   **Backend:** Spring Boot 3.5, Java 21. Chosen to leverage modern Java features like Virtual Threads (perfect for the high-I/O AI pipeline), pattern matching, and records (for immutable DTOs). 
*   **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4. Focus on performance (Vite), type safety (TypeScript), and rapid UI styling with a strict design token system.
*   **Database:** PostgreSQL 17. Chosen for strong ACID compliance, native UUID support (security by obscurity for IDs), and `JSONB` support (used for storing AI comparison outputs dynamically).
*   **Database Migrations:** Flyway. Schema is strictly version-controlled with incremental SQL files. No `ddl-auto: update` allowed in production.

## 2. The AI Pipeline (Synchronous Upload, Async Processing)
*   **Decision:** File uploads return `202 Accepted` immediately. The actual AI extraction runs asynchronously.
*   **Rationale:** AI extraction takes 2-5 seconds. Blocking the HTTP request thread would result in poor UX and risk gateway timeouts. 
*   **Implementation:** Used Spring's `@Async("aiTaskExecutor")` with a custom `ThreadPoolTaskExecutor` (core size 2, max 4, queue 20) to process documents in the background. This bounded queue prevents memory exhaustion during sudden traffic spikes. The frontend polls for status updates via a SSE (Server-Sent Events) mechanism.

## 3. OCR & Extraction Strategy
*   **Decision:** Multi-layered extraction approach (PDFBox → Tesseract).
*   **Rationale:** Medical reports come in various formats. True PDFs have embedded text, while scanned documents are just images.
*   **Implementation:** The system first attempts extraction via Apache PDFBox. If the extracted text is suspiciously short (< 50 characters, often indicating a watermark-only PDF), it automatically falls back to rendering the PDF pages at 250 DPI and processing them through Tesseract OCR.

## 4. LLM Choice & Integration
*   **Decision:** HuggingFace Inference API with Meta's Llama 3.1 8B Instruct.
*   **Rationale:** Self-hosting an LLM requires complex GPU provisioning. HuggingFace provides a managed API. Llama 3.1 8B Instruct was chosen as the optimal balance between strict instruction-following (for JSON extraction) and low latency.
*   **Handling Instability:** Implemented LLM retry logic with exponential backoff and JSON-recovery regex to handle instances where the LLM surrounds valid JSON with markdown code blocks (e.g., ` ```json `).

## 5. Parameter Canonicalization & Sanity Bounds
*   **Decision:** Do not trust the LLM to normalize parameter names or output physiologically possible numbers.
*   **Rationale:** Unrestricted AI extraction would result in "HbA1c" from Lab A failing to match "Glycated Hemoglobin" from Lab B, breaking longitudinal trend charts. Furthermore, OCR/LLM hallucinations occasionally produce impossible numbers (e.g., Blood Glucose of 9999).
*   **Implementation:** 
    *   *Canonicalization:* A hardcoded `ParameterUtils` synonym map normalizes 26 common Indian lab report synonyms into 12 standard canonical names.
    *   *Sanity Bounds:* Hardcoded physiological min/max bounds (e.g., TSH 0.001 to 100.0). If a value falls outside these bounds, it is assigned a `LOW` confidence score and flagged.
    *   *Data Types:* We use `BigDecimal` for all medical values to prevent floating-point inaccuracies. We also had to add safeguards against the LLM misinterpreting numbers as scientific notation (e.g., `3.72E+10`), which would overflow the PostgreSQL `NUMERIC(10,3)` columns.

## 6. Authentication & Security
*   **Decision:** Stateless JWT authentication stored in secure `httpOnly` cookies.
*   **Rationale:** Initially implemented with Bearer tokens, the app was migrated to `httpOnly` cookies with `SameSite=None` to protect against XSS (Cross-Site Scripting) attacks while supporting cross-origin requests.
*   **Authorization:** Every data access service method explicitly checks the ownership chain (`User → Family → FamilyMember → Document/Parameter`) to prevent IDOR (Insecure Direct Object Reference) vulnerabilities.

## 7. Multi-Profile UX (Netflix-Style)
*   **Decision:** A single user account manages multiple "Family Member" profiles.
*   **Rationale:** In the Indian healthcare context, one tech-savvy family member typically manages records for the entire household (children, elderly parents). Enforcing separate user accounts with distinct logins for an 80-year-old grandfather creates unnecessary friction. The Netflix-style profile picker isolates data visually while keeping authentication centralized.

## 8. Frontend Design System
*   **Decision:** Semantic color reservation.
*   **Rationale:** In a healthcare app, colors convey critical information. The Tailwind configuration strictly reserves `norm` (Green), `warn` (Amber), and `crit` (Red) exclusively for medical status indicators (e.g., in-range vs. out-of-range lab results). These colors are never used decoratively, reducing cognitive load and preventing user alarm. 

## Frontend State & Real-Time Tracking: SSE Polling Bug

When processing documents via the async AI pipeline, the frontend relied on Server-Sent Events (SSE) to display a multi-stage progress bar ("Reading PDF", "Extracting lab values", etc.). However, the UI consistently appeared "stuck" on Stage 1, despite backend logs confirming rapid advancement through the stages. Furthermore, when the pipeline ultimately failed (due to upstream LLM timeouts), the progress bar disappeared entirely, replaced by a generic failure card. This left the user completely blind to where the pipeline crashed.

The root cause was a fragile React effect dependency in the parent `UploadPage.tsx`. The SSE connection was tied to the parent's state, and every 5-second background sync cycle caused React to tear down and recreate the `EventSource`, perpetually interrupting the stream and dropping events. To resolve this:
1. **Component Isolation**: Extracted the SSE logic completely out of the parent page and moved it into an autonomous `DocumentDetail` component that strictly manages a single document's connection.
2. **Transparent Failure State**: When the backend throws an exception, it now encodes the exact pipeline stage key into the database `processingError` string (e.g., `IDENTIFYING_PARAMETERS|Llama API call failed`). The frontend parses this encoded string to dynamically revive and render the multi-stage progress bar in the `FAILED` view. The completed stages are marked green, while the specific stage that crashed glows red. This elegantly provides full visibility into pipeline crashes without requiring any database migrations or schema bloat (following the "Simplest Solution" principle).

## AI Pipeline JSON Truncation & Defensive Parsing

During load testing with a comprehensive 3-page "Nutrition Test Report" PDF containing over 40 lab parameters, the AI pipeline consistently threw a `Could not parse extracted lab parameters` error at Stage 2.

**Root Cause Analysis:** 
By writing a test script to directly hit the Hugging Face Llama-3.1-8B-Instruct API with the exact prompt and PDF text, we discovered the LLM was successfully generating the extracted JSON array. However, the output was 1813 completion tokens. Our `LlamaClient` had a hardcoded `max_tokens: 2000` limit. In edge cases, or if the PDF contained slightly more data, the LLM hit the max token ceiling and abruptly truncated the JSON response mid-string (e.g. `{"name": "Free T4", "value":`). The `ParameterExtractionService`'s Jackson `ObjectMapper` predictably threw a `JsonProcessingException` when attempting to parse the broken JSON, crashing the entire pipeline. Additionally, if the LLM hallucinated a non-ISO date string for `reportDate`, `LocalDate.parse()` would throw a `DateTimeParseException`, also crashing the entire extraction.

**Resolution:**
1. **Token Limit Bump:** Increased `max_tokens` from `2000` to `4000` in the `LlamaClient.chat()` invocation within `ParameterExtractionService`. This gives the 8B model ample headroom to fully serialize large JSON arrays without artificial truncation.
2. **Defensive Date Parsing:** Wrapped the `LocalDate.parse()` operation in a try-catch block. If the LLM generates an unparseable date string, we log a warning and safely default to `null` (falling back to `LocalDate.now()`), saving the remaining 40+ valid lab parameters from being discarded over a minor date parsing failure.
3. **Diagnostic Logging:** Added the raw LLM string to the exception log (`log.error("... Raw response: {}", response, e)`) to ensure any future parsing crashes provide immediate visibility into the malformed JSON.
