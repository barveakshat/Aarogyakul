# Phase 1: Foundation (Hours 0–4)

**Goal:** Infrastructure ready for parallel frontend/backend work.

## Tasks
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

## Deliverable
Running local dev environment with empty PostgreSQL database accessible via `psql -h localhost -U aarogyakul -d aarogyakul`.

## Environment Setup
```bash
# Start PostgreSQL
docker-compose up -d
psql -h localhost -U aarogyakul -d aarogyakul -f init-db.sql
```

## Tech Stack (Pinned Versions)

### Backend
- Java 21, Spring Boot 3.5.3, Maven 3.9+
- PostgreSQL 17, Spring Data JPA 3.5.3
- Spring Security 6.5.3, AWS SDK v2 2.29.25
- Apache PDFBox 3.0.3, tess4j 5.16.0

### Frontend
- React 19.2.0, TypeScript 6.0.0, Vite 8.0.0
- Tailwind CSS 4.3.0, Recharts 2.15.0
- React Router 7.15.0, Axios 1.17.0

## Project Structure
See `plan.md` Section 4 for complete package structure.
