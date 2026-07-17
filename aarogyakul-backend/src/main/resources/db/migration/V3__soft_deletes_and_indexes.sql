-- Soft deletes: add deleted_at column to entities that support deletion
ALTER TABLE family_members ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE medical_documents ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE timeline_events ADD COLUMN deleted_at TIMESTAMPTZ;

-- Partial indexes: only index non-deleted rows for common queries
CREATE INDEX idx_family_members_family_active ON family_members(family_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_member_active ON medical_documents(family_member_id, uploaded_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_timeline_events_member_active ON timeline_events(family_member_id, event_date DESC) WHERE deleted_at IS NULL;

-- Missing index: families.owner_id is queried on every auth-checked request
CREATE INDEX idx_families_owner_id ON families(owner_id);
