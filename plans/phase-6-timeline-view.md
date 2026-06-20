# Phase 6: Health Timeline View (Hours 34–36)

**Goal:** Display events on member profiles.

## Tasks

### Backend
- [ ] Implement `TimelineEventRepository` queries:
  - [ ] Get events for member, sorted by `event_date DESC`
  - [ ] Include `related_document_id` when appropriate
- [ ] Create `TimelineController`:
  - [ ] `GET /api/members/{memberId}/timeline` endpoint
- [ ] Implement `TimelineService`:
  - [ ] Build timeline events from `DOCUMENT_UPLOAD` processing

### Frontend
- [ ] Create frontend `TimelinePage`:
  - [ ] Vertical event feed component
  - [ ] TimelineItem component with icons
  - [ ] Group events by date if needed
- [ ] Add timeline section to `MemberProfilePage`

## API Endpoint
```
GET /api/members/{memberId}/timeline
```

**Response:**
```json
[
  {
    "id": "uuid",
    "eventType": "DOCUMENT_UPLOAD",
    "eventDate": "2025-07-15",
    "title": "Blood Test Uploaded",
    "description": "Extracted parameters: HbA1c, Cholesterol, Vitamin D",
    "relatedDocumentId": "uuid",
    "createdAt": "2025-07-15T10:30:00Z"
  }
]
```

## Database Schema
See `plan.md` Section 3: `timeline_events` table

## Deliverable
Working timeline view showing document uploads and other events.
