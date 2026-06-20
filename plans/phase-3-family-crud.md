# Phase 3: Family & Member CRUD (Hours 10–18)

**Goal:** Enable users to create families and manage family members.

## Tasks

### Backend
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
- [ ] Fix any N+1 query issues with JPA fetch joins

### Frontend
- [ ] Create frontend pages: `DashboardPage`, `MemberProfilePage`
- [ ] Create reusable components: `FamilyMemberCard`, `MemberForm`

### Testing
- [ ] Test CRUD operations with real database

## Deliverable
Fully functional family/member CRUD with proper authorization, allergies, and chronic conditions sub-resources.

## Database Schema
See `plan.md` Section 3 for tables: `families`, `family_members`, `allergies`, `chronic_conditions`

## Environment Variables
```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/aarogyakul
DATABASE_USERNAME=aarogyakul
DATABASE_PASSWORD=aarogyakul
```
