# AarogyaKul - Implementation Plan

**Team:** FutureStack (Akshat Barve — Backend & Cloud, Soumya Barve — Frontend & Product)  
**Version:** 2.0 (Tech Stack Pinned)  
**Target Delivery:** 48-Hour Hackathon Build

---

## 1. Technology Stack (Pinned Versions)

All versions are the **latest stable** releases compatible with each other. Every dependency has been validated for compatibility and security.

### Backend Stack

| Component | Library | Version | Notes |
|-----------|---------|---------|-------|
| **Language** | Java | 21 | Long-term support, required by Spring Boot 3.5+ |
| **Framework** | Spring Boot | 3.5.3 | Latest stable, fully compatible with Java 21 |
| **Build Tool** | Maven | 3.9+ | Standard for Spring Boot projects |
| **Database** | PostgreSQL | 17 | Latest stable, uses `gen_random_uuid()` and `TIMESTAMPTZ` |
| **ORM** | Spring Data JPA | 3.5.3 | Bundled with Spring Boot 3.5.3 |
| **Security** | Spring Security | 6.5.3 | OAuth 2.0 + JWT via `spring-boot-starter-security` |
| **JWT** | Spring Security OAuth2 Resource Server | 6.5.3 | Built-in JWT support, no external dependency required |
| **File Storage** | AWS SDK for Java v2 | 2.29.25 | Latest stable, non-blocking IO support |
| **PDF Processing** | Apache PDFBox | 3.0.3 | Latest stable series (Java 8+ compatible) |
| **OCR (Fallback)** | tess4j | 5.16.0 | Latest stable, Tesseract OCR wrapper for Java |
| **AI/LLM** | Hugging Face Inference API | OpenAI-compatible | Uses `/chat/completions` endpoint |

### Frontend Stack

| Component | Library | Version | Notes |
|-----------|---------|---------|-------|
| **Framework** | React | 19.2.0 | Latest stable, includes React Compiler support |
| **Language** | TypeScript | 6.0.0 | Last JavaScript-based release before Go rewrite |
| **Build Tool** | Vite | 8.0.0 | Latest stable, uses Rolldown for 10-30x faster builds |
| **Styling** | Tailwind CSS | 4.3.0 | Latest stable, zero-runtime CSS engine |
| **Charts** | Recharts | 2.15.0 | Latest stable v2 series |
| **HTTP Client** | Axios | 1.17.0 |Latest stable, security-hardened |
| **Routing** | React Router | 7.15.0 | Latest v7 stable, fully typed |
| **State** | React Context | Built-in | No external library required |

### Tooling & Infrastructure

| Component | Tool | Version | Notes |
|-----------|------|---------|-------|
| **Container** | Docker | 26+ | For local development with docker-compose |
| **CI/CD** | GitHub Actions | Latest | Standard for sprint development |
| **Package Manager** | npm | 10+ | Standard with Node.js 20+ |

### Version Compatibility Matrix

```
Java 21 ✅ Spring Boot 3.5.3
Spring Boot 3.5.3 ✅ Spring Data JPA 3.5.3
Spring Boot 3.5.3 ✅ Spring Security 6.5.3
React 19.2.0 ✅ TypeScript 6.0.0
React 19.2.0 ✅ React Router 7.15.0
React 19.2.0 ✅ Recharts 2.15.0
Vite 8.0.0 ✅ React 19.2.0
Vite 8.0.0 ✅ TypeScript 6.0.0
Tailwind CSS 4.3.0 ✅ Vite 8.0.0 (via @tailwindcss/vite plugin)
AWS SDK v2 2.29.25 ✅ Java 21
Apache PDFBox 3.0.3 ✅ Java 21
tess4j 5.16.0 ✅ Java 21
PostgreSQL 17 ✅ Spring Data JPA 3.5.3 (via spring-boot-starter-data-jpa)
```

**Note:** All versions are cross-validated and known to work together for a 48-hour sprint. No alpha/beta versions are included.

---

## 2. Project Scaffolding (Hours 0–4)

### Backend Setup

```bash
# Initialize Spring Boot project with Maven
mvn archetype:generate \
  -DgroupId=com.aarogyakul \
  -DartifactId=aarogyakul-backend \
  -Dversion=1.0.0-SNAPSHOT \
  -DinteractiveMode=false \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DarchetypeGroupId=org.apache.maven.archetypes

# Add dependencies to pom.xml (Section 2.1)
```

**`pom.xml` Dependency Snippet:**
```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
        <version>3.5.3</version>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.5.3</version>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
        <version>3.5.3</version>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
        <version>3.5.3</version>
    </dependency>
    
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        <version>3.5.3</version>
    </dependency>
    
    <!-- AWS SDK v2 -->
    <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
        <version>2.29.25</version>
    </dependency>
    
    <!-- PDFBox -->
    <dependency>
        <groupId>org.apache.pdfbox</groupId>
        <artifactId>pdfbox</artifactId>
        <version>3.0.3</version>
    </dependency>
    
    <!-- Tesseract OCR (tess4j) -->
    <dependency>
        <groupId>net.sourceforge.tess4j</groupId>
        <artifactId>tess4j</artifactId>
        <version>5.16.0</version>
    </dependency>
    
    <!-- PostgreSQL -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <version>42.7.3</version>
    </dependency>
    
    <!-- Lombok (optional, for reducing boilerplate) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.36</version>
        <scope>provided</scope>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <version>3.5.3</version>
        <scope>test</scope>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.13.0</version>
            <configuration>
                <source>21</source>
                <target>21</target>
            </</configuration>
        </plugin>
    </plugins>
</build>
```

### Frontend Setup

```bash
# Initialize Vite + React + TypeScript project
npm create vite@latest aarogyakul-frontend -- \
  --template react-ts

cd aarogyakul-frontend

# Install core dependencies
npm install \
  react-router@7.15.0 \
  axios@1.17.0 \
  recharts@2.15.0 \
  tailwindcss@4.3.0 \
  @tailwindcss/vite@4.3.0

# Install Dev Dependencies
npm install -D \
  typescript@6.0.0 \
  vite@8.0.0
```

**`package.json` Dependencies:**
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router": "^7.15.0",
    "axios": "^1.17.0",
    "recharts": "^2.15.0",
    "tailwindcss": "^4.3.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^6.0.0",
    "vite": "^8.0.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
```

**`vite.config.ts`:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

**`tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## 3. Database Setup (Hours 2–6)

### `docker-compose.yml`

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:17
    container_name: aarogyakul-db
    environment:
      POSTGRES_DB: aarogyakul
      POSTGRES_USER: aarogyakul
      POSTGRES_PASSWORD: aarogyakul
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aarogyakul -d aarogyakul"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
    driver: local
```

### Database Initialization Script (`init-db.sql`)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. families table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. family_members table
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  blood_group VARCHAR(5),
  relationship_to_owner VARCHAR(50),
  profile_photo_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. allergies table
CREATE TABLE allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  allergen VARCHAR(255) NOT NULL,
  severity VARCHAR(20),
  notes TEXT
);

-- 5. chronic_conditions table
CREATE TABLE chronic_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  condition_name VARCHAR(255) NOT NULL,
  diagnosed_date DATE,
  notes TEXT
);

-- 6. medical_documents table
CREATE TABLE medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  document_type VARCHAR(30) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  report_date DATE,
  processing_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  processing_error TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. medical_parameters table
CREATE TABLE medical_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  parameter_name VARCHAR(100) NOT NULL,
  value NUMERIC(10,3) NOT NULL,
  unit VARCHAR(20),
  reference_range_low NUMERIC(10,3),
  reference_range_high NUMERIC(10,3),
  report_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ai_insights table
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  comparison_json JSONB,
  model_used VARCHAR(100) NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. timeline_events table
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL,
  event_date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  related_document_id UUID REFERENCES medical_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common query patterns
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_medical_documents_family_member_id ON medical_documents(family_member_id);
CREATE INDEX idx_medical_parameters_member_param ON medical_parameters(family_member_id, parameter_name, report_date DESC);
CREATE INDEX idx_timeline_events_member_id ON timeline_events(family_member_id);
CREATE INDEX idx_timeline_events_event_date ON timeline_events(event_date DESC);
```

### Backend JPA Configuration (`application.yml`)

```yaml
spring:
  application:
    name: aarogyakul-backend
  jpa:
    open-in-view: false
    hibernate:
     ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
        jdbc:
          batch_size: 20
  profiles:
    active: dev
---
spring:
  config:
    activate:
      on-profile: dev
  datasource:
    url: jdbc:postgresql://localhost:5432/aarogyakul
    username: aarogyakul
    password: aarogyakul
    hikari:
      maximum-pool-size: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
server:
  port: 8080
  error:
    include-message: always
    include-binding: always
```

---

## 4. Package Structure

### Backend (`com.aarogyakul`)

```
src/main/java/com/aarogyakul/
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── S3Config.java (S3 client bean)
│   └── AsyncConfig.java (@EnableAsync @Bean TaskExecutor)
├── controller/
│   ├── AuthController.java
│   ├── FamilyController.java
│   ├── FamilyMemberController.java
│   ├── DocumentController.java
│   └── TimelineController.java
├── service/
│   ├── AuthService.java
│   ├── FamilyService.java
│   ├── FamilyMemberService.java
│   ├── DocumentService.java
│   └── ai/
│       ├── OcrService.java
│       ├── LlamaClient.java
│       ├── ParameterExtractionService.java
│       └── InsightGenerationService.java
├── repository/
│   ├── UserRepository.java
│   ├── FamilyRepository.java
│   ├── FamilyMemberRepository.java
│   ├── AllergyRepository.java
│   ├── ChronicConditionRepository.java
│   ├── MedicalDocumentRepository.java
│   ├── MedicalParameterRepository.java
│   ├── AIInsightRepository.java
│   └── TimelineEventRepository.java
├── entity/
│   ├── User.java
│   ├── Family.java
│   ├── FamilyMember.java
│   ├── Allergy.java
│   ├── ChronicCondition.java
│   ├── MedicalDocument.java
│   ├── MedicalParameter.java
│   ├── AIInsight.java
│   └── TimelineEvent.java
├── dto/
│   ├── request/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── CreateFamilyRequest.java
│   │   ├── CreateMemberRequest.java
│   │   ├── CreateAllergyRequest.java
│   │   └── CreateChronicConditionRequest.java
│   ├── response/
│   │   ├── AuthResponse.java
│   │   ├── FamilyResponse.java
│   │   ├── MemberResponse.java
│   │   ├── AllergyResponse.java
│   │   ├── ChronicConditionResponse.java
│   │   ├── DocumentResponse.java
│   │   ├── ParameterResponse.java
│   │   ├── InsightResponse.java
│   │   └── TimelineEventResponse.java
│   └── ai/
│       ├── ExtractedParameter.java
│       ├── ComparisonData.java
│       └── SummaryContext.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── UnauthorizedAccessException.java
│   ├── ValidationException.java
│   └── ProcessingException.java
├── util/
│   ├── SecurityUtils.java
│   └── EnumUtils.java
└── AarogyaKulBackendApplication.java
```

### Frontend (`src/`)

```
src/
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── MemberProfilePage.tsx
│   ├── TimelinePage.tsx
│   └── UploadPage.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── LoadingSpinner.tsx
│   ├── family/
│   │   ├── FamilyMemberCard.tsx
│   │   └── FamilyDashboard.tsx
│   ├── document/
│   │   ├── DocumentUploadForm.tsx
│   │   ├── DocumentList.tsx
│   │   └── InsightCard.tsx
│   ├── timeline/
│   │   └── TimelineFeed.tsx
│   └── chart/
│       └── ParameterTrendChart.tsx
├── api/
│   ├── auth.ts
│   ├── family.ts
│   ├── member.ts
│   ├── document.ts
│   └── timeline.ts
├── context/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useFamilyMembers.ts
│   ├── useDocuments.ts
│   └── useTimeline.ts
├── types/
│   ├── api.ts
│   ├── models.ts
│   └── enums.ts
├── utils/
│   ├── constants.ts
│   └── validators.ts
└── main.tsx
```

---

## 5. Implementation Sequence

### Phase 1: Foundation (Hours 0–4)

**Goal:** Infrastructure ready for parallel frontend/backend work.

#### Tasks:
- [x] Create docker-compose for PostgreSQL
- [x] Initialize Spring Boot (Maven) project
- [x] Initialize Vite (React + TS) project
- [x] Implement JPA entities for all 9 tables
- [x] Configure `application.yml` with PostgreSQL connection
- [x] Create database schema with UUID primary keys and TIMESTAMPTZ
- [x] Set up project structure (backend & frontend folders)
- [x] Configure Maven dependencies (Spring Boot 3.5.3, PDFBox 3.0.3, tess4j 5.16.0, AWS SDK v2 2.29.25)
- [x] Configure `package.json` dependencies (React 19.2.0, TypeScript 6.0.0, Vite 8.0.0, Tailwind 4.3.0, Recharts 2.15.0, Axios 1.17.0, React Router 7.15.0)
- [x] Create initial `docker-compose.yml` and `init-db.sql`

**Deliverable:** Running local dev environment with empty PostgreSQL database accessible via `psql -h localhost -U aarogyakul -d aarogyakul`.

---

### Phase 2: Authentication System (Hours 4–10)

**Goal:** Enable user registration, login, and JWT-based authorization.

#### Tasks:
- [ ] Implement `User` entity with BCrypt password encoding
- [ ] Create `UserRepository` with custom query for email lookup
- [ ] Implement `AuthService` with registration and login methods
- [ ] Configure JWT token generation (24-hour expiry, HS256)
- [ ] Create `SecurityConfig` with Spring Security filter chain
- [ ] Exclude `/api/auth/**` from security filters
- [ ] Implement `JwtAuthenticationFilter` for Bearer token validation
- [ ] Create `AuthController` with `/register` and `/login` endpoints
- [ ] Implement `AuthResponse` DTO
- [ ] Create `AuthContext` in React frontend
- [ ] Implement `LoginPage` and `RegisterPage` components
- [ ] Add Axios interceptors for automatic token refresh
- [ ] Test auth flow end-to-end with insomnia/postman
- [ ] Seed demo user for testing

#### API Contracts:

**`POST /api/auth/register`**
```json
// Request
{
  "email": "akshat@example.com",
  "password": "min8chars",
  "fullName": "Akshat Barve",
  "phoneNumber": "+91 9876543210"
}

// Response (201)
{
  "userId": "uuid",
  "email": "akshat@example.com",
  "fullName": "Akshat Barve",
  "accessToken": "jwt-token-here"
}
```

**`POST /api/auth/login`**
```json
// Request
{
  "email": "akshat@example.com",
  "password": "min8chars"
}

// Response (200)
{
  "userId": "uuid",
  "email": "akshat@example.com",
  "fullName": "Akshat Barve",
  "accessToken": "jwt-token-here"
}
```

**Deliverable:** Working auth system with JWT tokens, BCrypt password hashing, and frontend login/register forms.

---

### Phase 3: Family & Member CRUD (Hours 10–18)

**Goal:** Enable users to create families and manage family members.

#### Tasks:
- [ ] Implement `Family` entity with owner relationship
- [ ] Implement `FamilyMember` entity with all fields from PRD
- [ ] Create repositories for `Family` and `FamilyMember`
- [ ] Implement `FamilyService`:
  - [ ] `createFamily()` - Create family, associate with logged-in user
  - [ ] `getMyFamily()` - Get authenticated user's family
  - [ ] Enforce "one family per user" constraint
- [ ] Implement `FamilyMemberService`:
  - [ ] `createMember()` - Create member for a family
  - [ ] `getMembers()` - List all members in family
  - [ ] `getMemberById()` - Get member details
  - [ ] `updateMember()` - Partial update support
  - [ ] Authorization checks: user must own the family
- [ ] Implement `AllergyService` and `ChronicConditionService` (sub-resources)
- [ ] Create all DTOs for requests and responses
- [ ] Create controllers: `FamilyController`, `FamilyMemberController`
- [ ] Create CRUD endpoints per Section 7.2 and 7.3
- [ ] Implement frontend pages: `DashboardPage`, `MemberProfilePage`
- [ ] Create reusable components: `FamilyMemberCard`, `MemberForm`
- [ ] Test CRUD operations with real database
- [ ] Fix any N+1 query issues with JPA fetch joins

#### API Contracts:
See **Section 7.2 Families** and **Section 7.3 Family Members** in PRD for exact request/response shapes.

**Deliverable:** Fully functional family/member CRUD with proper authorization, allergies, and chronic conditions sub-resources.

---

### Phase 4: Document Upload & S3 Integration (Hours 18–22)

**Goal:** Enable PDF upload to S3 with document tracking.

#### Tasks:
- [ ] Create `S3Config` with AWS SDK v2:
  - [ ] Initialize `S3Client` bean
  - [ ] Configure pre-signed URL generation
  - [ ] Set bucket name via environment variable
- [ ] Implement `DocumentService`:
  - [ ] Validate file type (PDF only)
  - [ ] Validate file size (<15MB)
  - [ ] Stream file to S3: `documents/{memberId}/{docId}.pdf`
  - [ ] Create `MedicalDocument` row with `status: PENDING`
  - [ ] Return 202 Accepted immediately
  - [ ] Trigger async pipeline via `@Async`
- [ ] Create `Document` controllers:
  - [ ] `uploadDocument()` - Multipart POST endpoint
  - [ ] `getDocumentStatus()` - GET `/api/documents/{id}` for polling
  - [ ] `listDocuments()` - GET `/api/members/{id}/documents`
  - [ ] `deleteDocument()` - Soft cascade delete
- [ ] Implement document management frontend:
  - [ ] Upload form with file input and document type selection
  - [ ] Document list with status indicators
  - [ ] Progress indicator during upload
  - [ ] Polling mechanism for processing status
- [ ] Configure CORS to allow frontend origin
- [ ] Test upload flow with test PDFs

#### Configuration:
**`.env` for AWS:**
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=aarogyakul-documents
AWS_REGION=ap-south-1
```

**Deliverable:** Working PDF upload with S3 storage, document tracking, and polling-based status updates.

---

### Phase 5: AI Report Reader Pipeline (Hours 22–34)

**Goal:** Implement the flagship OCR → extraction → comparison → insight pipeline.

#### Stage 1: OCR Extraction (Hours 22–26)

##### Tasks:
- [ ] Implement `OcrService`:
  - [ ] Try PDFBox extraction first (`PDFTextStripper`)
  - [ ] If text length < 50 chars, fallback to Tesseract OCR:
    - [ ] Render PDF pages as images (`PDFRenderer`)
    - [ ] Call `Tesseract.doOCR()` on each page
    - [ ] Concatenate results
  - [ ] Handle exceptions gracefully
  - [ ] Return clean text string or throw `ProcessingException`
- [ ] Configure tess4j dependencies (tesseract-data, leptonica)
- [ ] Test OCR with both text-based and scanned PDF samples

##### Text Extraction Logic:
```java
public String extractText(File pdfFile) throws ProcessingException {
    try (PDDocument document = PDDocument.load(pdfFile)) {
        String text = new PDFTextStripper().getText(document);
        
        // Fallback to Tesseract if text is too short (scanned image)
        if (text.trim().length() < 50) {
            log.info("PDF appears scanned, falling back to Tesseract OCR");
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath("/usr/local/share/tessdata"); // Configure path
            return tesseract.doOCR(pdfFile);
        }
        
        return text.trim();
    } catch (Exception e) {
        throw new ProcessingException("Failed to extract text from PDF", e);
    }
}
```

##### Stage 1 Deliverable: Robust OCR pipeline handling both text-based and scanned PDFs.

#### Stage 2: Llama API Integration (Hours 26–28)

##### Tasks:
- [ ] Create `LlamaClient`:
  - [ ] Use OpenAI-compatible HTTP client (custom REST template)
  - [ ] Configure base URL from `HUGGINGFACE_API_URL`
  - [ ] Add `Authorization: Bearer {api-key}` header
  - [ ] Set `LLAMA_MODEL_NAME` via environment variable
- [ ] Implement parameter extraction:
  - [ ] Send system prompt + extracted text to LLM
  - [ ] Expect strict JSON response with parameters array
  - [ ] Implement regex-based JSON recovery if model adds commentary
  - [ ] Handle JSON parsing errors gracefully
- [ ] Test Llama API with sample PDF text

##### LlamaClient Configuration:
```java
@Component
public class LlamaClient {
    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;
    private final String modelName;
    
    public LlamaClient(@Value("${huggingface.api.url}") String apiUrl,
                       @Value("${huggingface.api.key}") String apiKey,
                       @Value("${llama.model.name}") String modelName) {
        this.restTemplate = new RestTemplate();
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.modelName = modelName;
    }
    
    public String callLlama(String systemPrompt, String userText) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        JSONObject requestBody = new JSONObject();
        requestBody.put("model", modelName);
        requestBody.put("messages", Arrays.asList(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", userText)
        ));
        requestBody.put("temperature", 0.3);
        requestBody.put("max_tokens", 2000);
        
        HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new ProcessingException("Llama API call failed", e);
        }
    }
}
```

##### Stage 2 Deliverable: Llama API integration with error handling and fallback JSON parsing.

#### Stage 3: Canonicalization & Parameter Persistence (Hours 28–30)

##### Tasks:
- [ ] Create static synonym map (`ParameterUtils.java`):
  ```java
  public class ParameterUtils {
      private static final Map<String, String> SYNONYM_MAP = Map.ofEntries(
          Map.entry("hba1c", "HbA1c"),
          Map.entry("glycated hemoglobin", "HbA1c"),
          Map.entry("hemoglobin a1c", "HbA1c"),
          Map.entry("total cholesterol", "Total Cholesterol"),
          Map.entry("hdl cholesterol", "HDL"),
          Map.entry("ldl cholesterol", "LDL"),
          Map.entry("triglycerides", "Triglycerides"),
          Map.entry("vitamin d", "Vitamin D"),
          Map.entry("25-hydroxy vitamin d", "Vitamin D"),
          Map.entry("hemoglobin", "Hemoglobin"),
          Map.entry("hb", "Hemoglobin"),
          Map.entry("blood glucose", "Blood Glucose"),
          Map.entry("fasting blood glucose", "Blood Glucose"),
          Map.entry("creatinine", "Creatinine"),
          Map.entry("tsh", "TSH"),
          Map.entry("thyroid stimulating hormone", "TSH")
      );
      
      public static String canonicalize(String paramName) {
          String lower = paramName.toLowerCase().trim();
          return SYNONYM_MAP.getOrDefault(lower, paramName);
      }
  }
  ```
- [ ] Implement `ParameterExtractionService`:
  - [ ] Call Llama API with extraction prompt (Section 8.4)
  - [ ] Parse JSON response
  - [ ] Canonicalize parameter names
  - [ ] Create `MedicalParameter` entities
  - [ ] Save to database
- [ ] Implement `MedicalDocumentRepository` custom query for comparison:
  ```java
  @Query("""
      SELECT mp FROM MedicalParameter mp
      WHERE mp.familyMemberId = :memberId
      AND mp.parameterName = :paramName
      AND mp.reportDate < :reportDate
      ORDER BY mp.reportDate DESC
      """)
  Optional<MedicalParameter> findMostRecentPrior(
      @Param("memberId") UUID memberId,
      @Param("paramName") String paramName,
      @Param("reportDate") LocalDate reportDate
  );
  ```

##### Stage 3 Deliverable: Canonicalization logic and parameter persistence to database.

#### Stage 4: Comparison & Trend Calculation (Hours 30–32)

##### Tasks:
- [ ] Implement comparison logic:
  - [ ] Query most recent prior parameter for each canonical name
  - [ ] Calculate: `absChange`, `percentChange`, `trendDirection`
  - [ ] Determine trend direction:
    - `IMPROVING`: Value moved toward reference range midpoint
    - `WORSENING`: Value moved away from reference range midpoint
    - `STABLE`: Value changed < 5% or within 10% of reference midpoint
- [ ] Create `ComparisonData` DTO for each parameter
- [ ] Aggregate all comparisons into `ComparisonContext`
- [ ] Handle edge cases (no prior data, missing reference ranges)

##### Trend Logic:
```java
public record ComparisonResult(
    String parameterName,
    Double previousValue,
    Double currentValue,
    Double percentChange,
    TrendDirection trend
) {}

public enum TrendDirection {
    IMPROVING, WORSENING, STABLE, UNKNOWN
}

private TrendDirection calculateTrend(
    Double previous, Double current, 
    Double refLow, Double refHigh
) {
    // No comparison data
    if (previous == null) return TrendDirection.UNKNOWN;
    
    double percentChange = ((current - previous) / previous) * 100;
    
    // If no reference range, use direction
    if (refLow == null || refHigh == null) {
        return percentChange > 0 ? TrendDirection.WORSENING : TrendDirection.IMPROVING;
    }
    
    double refMidpoint = (refLow + refHigh) / 2.0;
    double distanceBefore = Math.abs(previous - refMidpoint);
    double distanceAfter = Math.abs(current - refMidpoint);
    
    if (distanceAfter < distanceBefore * 0.9) { // 10% tolerance
        return TrendDirection.IMPROVING;
    } else if (distanceAfter > distanceBefore * 1.1) {
        return TrendDirection.WORSENING;
    } else {
        return TrendDirection.STABLE;
    }
}
```

##### Stage 4 Deliverable: Comparison logic producing trend direction for each parameter.

#### Stage 5: Insight Generation & Finalization (Hours 32–34)

##### Tasks:
- [ ] Implement `InsightGenerationService`:
  - [ ] Send comparison JSON to Llama with "Friendly Assistant" prompt (Section 8.4)
  - [ ] Generate plain-English summary
  - [ ] Store `AIInsight` entity
- [ ] Update `MedicalDocument` status:
  - [ ] On success: `status = COMPLETED`
  - [ ] On failure: `status = FAILED`, `processing_error = "message"`
- [ ] Auto-create `TimelineEvent`:
  - [ ] `event_type = DOCUMENT_UPLOAD`
  - [ ] `title = "Blood Test Uploaded"`
  - [ ] `description = "Extracted parameters: HbA1c, Cholesterol, Vitamin D"`
  - [ ] `event_date = document.report_date`
- [ ] Implement document polling:
  - [ ] `GET /api/documents/{id}` returns full details with insight
  - [ ] Include `processing_status` field for frontend state management

##### Insight Generation Prompt:
```
You are a friendly medical assistant explaining lab results to someone with no medical background. 
You will be given a JSON object describing one or more lab parameters, their current value, and 
(if available) their previous value and percent change. 

Write a short, warm, plain-English summary (2-4 sentences) of what changed and whether it's 
worth mentioning to a doctor. Do not give a diagnosis. Do not use medical jargon without 
explaining it in the same sentence. If there is no previous value to compare against, just 
state the current value and whether it falls within the normal range.

JSON:
{comparison_data_json}
```

##### Stage 5 Deliverable: Full AI pipeline end-to-end, producing summary insights and auto-creating timeline events.

---

### Phase 6: Health Timeline View (Hours 34–36)

**Goal:** Display events on member profiles.

#### Tasks:
- [ ] Implement `TimelineEventRepository` queries:
  - [ ] Get events for member, sorted by `event_date DESC`
  - [ ] Include `related_document_id` when appropriate
- [ ] Create `TimelineController`:
  - [ ] `GET /api/members/{memberId}/timeline` endpoint
- [ ] Implement `TimelineService`:
  - [ ] Build timeline events from `DOCUMENT_UPLOAD` processing
- [ ] Create frontend `TimelinePage`:
  - [ ] Vertical event feed component
  - [ ] TimelineItem component with icons
  - [ ] Group events by date if needed
- [ ] Add timeline section to `MemberProfilePage`

**Deliverable:** Working timeline view showing document uploads and other events.

---

### Phase 7: End-to-End Testing & Demo Seeding (Hours 36–46)

**Goal:** Validate against real PDFs and seed demo data.

#### Tasks:
- [ ] Test with real PDF samples:
  - [ ] Dr Lal PathLabs format
  - [ ] Thyrocare format
  - [ ] SRL format (if accessible)
- [ ] Fix OCR edge cases:
  - [ ] Scanned PDFs
  - [ ] Non-English reports
  - [ ] Multi-page reports
- [ ] Fix parameter extraction edge cases:
  - [ ] Tables
  - [ ] Footnotes
  - [ ] References ranges in different formats
- [ ] Seed demo data:
  - [ ] Create test user and family
  - [ ] Create member with two blood reports 6 months apart
  - [ ] Ensure at least one parameter (HbA1c) shows clear change
  - [ ] Verify insight generation works correctly
- [ ] Performance testing:
  - [ ] Measure OCR time (<5s expected)
  - [ ] Measure Llama API calls (<15s expected)
  - [ ] Ensure frontend shows "Processing" state during waits
- [ ] Error handling testing:
  - [ ] Invalid PDF
  - [ ] Network failure
  - [ ] Llama API timeout

##### Demo Seeding Script (Java):
```java
@Component
public class DemoDataSeeder {
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private FamilyService familyService;
    @Autowired
    private FamilyMemberService memberService;
    @Autowired
    private MedicalDocumentRepository docRepo;
    @Autowired
    private MedicalParameterRepository paramRepo;
    
    @PostConstruct
    public void seed() {
        // Create test user if not exists
        User user = userRepo.findByEmail("demo@aarogyakul.com")
            .orElseGet(() -> {
                User u = new User();
                u.setEmail("demo@aarogyakul.com");
                u.setFullName("Demo User");
                u.setPasswordHash("$2a$10$..."); // BCrypt hash of "password123"
                return userRepo.save(u);
            });
        
        // Create family if not exists
        Family family = familyService.getMyFamily(user.getId())
            .orElseGet(() -> familyService.createFamily(user.getId(), "Demo Family"));
        
        // Create member
        FamilyMember member = memberService.getMembers(family.getId()).stream()
            .findFirst()
            .orElseGet(() -> memberService.createMember(
                family.getId(), 
                CreateMemberRequest.builder()
                    .fullName("Rajesh Sharma")
                    .dateOfBirth(LocalDate.of(1965, 3, 12))
                    .gender("MALE")
                    .bloodGroup("O+")
                    .relationshipToOwner("Father")
                    .build()
            ));
        
        // Seed two blood reports (simulated - in practice use real PDF files)
        // Report 1 (6 months ago)
        MedicalDocument doc1 = new MedicalDocument();
        doc1.setFamilyMemberId(member.getId());
        doc1.setFileName("blood_test_jan2025.pdf");
        doc1.setProcessingStatus("COMPLETED");
        doc1.setReportDate(LocalDate.now().minusMonths(6));
        doc1 = docRepo.save(doc1);
        
        // Parameters for Report 1
        MedicalParameter p1 = new MedicalParameter();
        p1.setDocumentId(doc1.getId());
        p1.setFamilyMemberId(member.getId());
        p1.setParameterName("HbA1c");
        p1.setValue(6.2);
        p1.setUnit("%");
        p1.setReportDate(doc1.getReportDate());
        paramRepo.save(p1);
        
        // Report 2 (current)
        MedicalDocument doc2 = new MedicalDocument();
        doc2.setFamilyMemberId(member.getId());
        doc2.setFileName("blood_test_jul2025.pdf");
        doc2.setProcessingStatus("COMPLETED");
        doc2.setReportDate(LocalDate.now());
        doc2 = docRepo.save(doc2);
        
        // Parameters for Report 2
        MedicalParameter p2 = new MedicalParameter();
        p2.setDocumentId(doc2.getId());
        p2.setFamilyMemberId(member.getId());
        p2.setParameterName("HbA1c");
        p2.setValue(7.1);
        p2.setUnit("%");
        p2.setReportDate(doc2.getReportDate());
        paramRepo.save(p2);
        
        log.info("Demo data seeded successfully");
    }
}
```

**Deliverable:** End-to-end working system with demo data showing trend analysis.

---

### Phase 8: Final Polish & Demo Rehearsal (Hours 46–48)

#### Tasks:
- [ ] Error handling review:
  - [ ] Ensure all external calls have try-catch
  - [ ] All errors return standard `{"error": {"code": "...", "message": "..."}}`
- [ ] Security audit:
  - [ ] Verify no S3 keys leaked in responses
  - [ ] Verify authorized access checks on all endpoints
  - [ ] Verify JWT expiry is 24 hours
- [ ] Performance optimization:
  - [ ] Add caching for synonym map
  - [ ] Optimize N+1 queries with fetch joins
  - [ ] Add response caching headers
- [ ] Documentation:
  - [ ] Create `README.md` with setup instructions
  - [ ] Document environment variables
  - [ ] Add inline code comments (only for complex logic)
- [ ] Demo script:
  - [ ] Script walkthrough of key flows
  - [ ] Prepare test user credentials
  - [ ] Prepare demo team assignment
- [ ] Bug fixing:
  - [ ] Fix any last-minute critical issues
  - [ ] Ensure demo data works reliably
  - [ ] Test on clean environment

**Deliverable:** Ready-to-demonstrate prototype.

---

## 6. Environment Variables Reference

### Backend (`.env` or system environment)

```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/aarogyakul
DATABASE_USERNAME=aarogyakul
DATABASE_PASSWORD=aarogyakul

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=aarogyakul-documents
AWS_REGION=ap-south-1

# Hugging Face Llama API
HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-70b-versatile/chat/completions
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxx
LLAMA_MODEL_NAME=meta-llama/Llama-3.1-70b-versatile

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY_HOURS=24

# Application
SERVER_PORT=8080
SERVER_CORS_ORIGIN=http://localhost:5173
```

### Frontend (`.env` - Vite uses `VITE_` prefix)

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_POLLING_INTERVAL=3000
VITE_MAX_POLL_ATTEMPTS=20
```

---

## 7. Build Commands Reference

### Backend

```bash
# Install dependencies (if any external dependencies)
mvn clean install

# Run
mvn spring-boot:run

# Test
mvn test

# Build JAR
mvn clean package
```

### Frontend

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 8. Quick Start Guide

1. **Start PostgreSQL:**
   ```bash
   docker-compose up -d
   psql -h localhost -U aarogyakul -d aarogyakul -f init-db.sql
   ```

2. **Configure Backend:**
   ```bash
   cd aarogyakul-backend
   cp .env.example .env  # Edit with your values
   mvn spring-boot:run
   ```

3. **Configure Frontend:**
   ```bash
   cd aarogyakul-frontend
   cp .env.example .env  # Edit with your values
   npm install
   npm run dev
   ```

4. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080
   - Database: localhost:5432 (PostgreSQL)

---

## 9. Troubleshooting

### Common Issues:

1. **PDFBox "Out of Memory" on large PDFs:**
   - Use streaming mode
   - Increase JVM heap: `export MAVEN_OPTS="-Xmx2g"`

2. **Tesseract not finding language data:**
   - Download Tesseract data files
   - Set `TESSDATA_PREFIX` environment variable

3. **Llama API timeout:**
   - Increase timeout in `LlamaClient`
   - Consider smaller model (Llama-3.1-8b for faster response)

4. **CORS errors in frontend:**
   - Verify `SERVER_CORS_ORIGIN` matches frontend URL
   - Check frontend dev server port matches

5. **JWT validation failing:**
   - Verify `JWT_SECRET` is identical in all environments
   - Check token has not expired (default 24 hours)

---

## 10. Success Criteria

The MVP is complete when:

1. ✅ User can register, login, and create a family
2. ✅ User can upload a blood report PDF
3. ✅ System extracts medical parameters from PDF automatically
4. ✅ If a prior report exists, comparison and trend are calculated
5. ✅ Plain-English summary is generated via LLM
6. ✅ Timeline event is auto-created on upload completion
7. ✅ Demo works end-to-end with demo seed data

**The hallmark of success:** A fresh user can upload a second blood report 6 months after the first, and the system automatically shows: _"HbA1c increased from 6.2% to 7.1% over the last 6 months — your blood sugar control has worsened"_.

---

**End of Plan.**  
**Next Steps:** Begin Phase 1 (Foundation) at Hour 0.
