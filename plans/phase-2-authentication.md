# Phase 2: Authentication System (Hours 4–10)

**Goal:** Enable user registration, login, and JWT-based authorization.

## Tasks

### Backend
- [ ] Implement `User` entity with BCrypt password encoding
- [ ] Create `UserRepository` with custom query for email lookup
- [ ] Implement `AuthService` with registration and login methods
- [ ] Configure JWT token generation (24-hour expiry, HS256)
- [ ] Create `SecurityConfig` with Spring Security filter chain
- [ ] Exclude `/api/auth/**` from security filters
- [ ] Implement `JwtAuthenticationFilter` for Bearer token validation
- [ ] Create `AuthController` with `/register` and `/login` endpoints
- [ ] Implement `AuthResponse` DTO
- [ ] Seed demo user for testing

### Frontend
- [ ] Implement `AuthContext` in React frontend
- [ ] Implement `LoginPage` and `RegisterPage` components
- [ ] Add Axios interceptors for automatic token refresh

### Testing
- [ ] Test auth flow end-to-end with insomnia/postman

## API Contracts

### POST /api/auth/register
**Request:**
```json
{
  "email": "akshat@example.com",
  "password": "min8chars",
  "fullName": "Akshat Barve",
  "phoneNumber": "+91 9876543210"
}
```

**Response (201):**
```json
{
  "userId": "uuid",
  "email": "akshat@example.com",
  "fullName": "Akshat Barve",
  "accessToken": "jwt-token-here"
}
```

### POST /api/auth/login
**Request:**
```json
{
  "email": "akshat@example.com",
  "password": "min8chars"
}
```

**Response (200):**
```json
{
  "userId": "uuid",
  "email": "akshat@example.com",
  "fullName": "Akshat Barve",
  "accessToken": "jwt-token-here"
}
```

## Deliverable
Working auth system with JWT tokens, BCrypt password hashing, and frontend login/register forms.

## Environment Variables
```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY_HOURS=24
```
