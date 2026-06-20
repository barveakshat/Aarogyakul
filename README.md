# AarogyaKul

Healthcare management system with AI-powered report analysis.

## Quick Start

```bash
# Start PostgreSQL
docker-compose up -d
psql -h localhost -U aarogyakul -d aarogyakul -f init-db.sql

# Backend
cd aarogyakul-backend
cp .env.example .env  # Edit with your values
mvn spring-boot:run

# Frontend
cd aarogyakul-frontend
cp .env.example .env  # Edit with your values
npm install
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
