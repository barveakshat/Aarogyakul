# Phase 8: Final Polish & Demo Rehearsal (Hours 46–48)

**Goal:** Ready-to-demonstrate prototype.

## Tasks

### Error Handling Review
- [ ] Ensure all external calls have try-catch
- [ ] All errors return standard `{"error": {"code": "...", "message": "..."}}`

### Security Audit
- [ ] Verify no S3 keys leaked in responses
- [ ] Verify authorized access checks on all endpoints
- [ ] Verify JWT expiry is 24 hours

### Performance Optimization
- [ ] Add caching for synonym map
- [ ] Optimize N+1 queries with fetch joins
- [ ] Add response caching headers

### Documentation
- [ ] Create `README.md` with setup instructions
- [ ] Document environment variables
- [ ] Add inline code comments (only for complex logic)

### Demo Script
- [ ] Script walkthrough of key flows
- [ ] Prepare test user credentials
- [ ] Prepare demo team assignment

### Bug Fixing
- [ ] Fix any last-minute critical issues
- [ ] Ensure demo data works reliably
- [ ] Test on clean environment

## Environment Variables Reference

### Backend
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

### Frontend
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_POLLING_INTERVAL=3000
VITE_MAX_POLL_ATTEMPTS=20
```

## Deliverable
Ready-to-demonstrate prototype.

## Quick Start Guide
```bash
# 1. Start PostgreSQL
docker-compose up -d
psql -h localhost -U aarogyakul -d aarogyakul -f init-db.sql

# 2. Backend
cd aarogyakul-backend
cp .env.example .env  # Edit with your values
mvn spring-boot:run

# 3. Frontend
cd aarogyakul-frontend
cp .env.example .env  # Edit with your values
npm install
npm run dev

# 4. Access Application
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
# Database: localhost:5432
```
