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
