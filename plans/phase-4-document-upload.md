# Phase 4: Document Upload & S3 Integration (Hours 18–22)

**Goal:** Enable PDF upload to S3 with document tracking.

## Tasks

### Backend
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

## Configuration

### Environment Variables
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=aarogyakul-documents
AWS_REGION=ap-south-1
```

### S3 Object Path
```
documents/{memberId}/{docId}.pdf
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents` | Upload PDF document |
| GET | `/api/documents/{id}` | Get document status |
| GET | `/api/members/{id}/documents` | List documents for member |

## Deliverable
Working PDF upload with S3 storage, document tracking, and polling-based status updates.
