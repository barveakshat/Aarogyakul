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
