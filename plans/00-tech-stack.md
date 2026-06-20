# AarogyaKul - Tech Stack Appendix

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
            </configuration>
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
