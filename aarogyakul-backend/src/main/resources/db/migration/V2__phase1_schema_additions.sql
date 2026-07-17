-- ============================================================
-- V2: Phase 1 schema additions
-- Adds columns and indexes for stuck-document recovery,
-- confidence scoring, and auto-updated timestamps.
-- ============================================================

-- Stuck document recovery (Task 1.4)
ALTER TABLE medical_documents ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE medical_documents ADD COLUMN retry_count INT NOT NULL DEFAULT 0;
CREATE INDEX idx_documents_status ON medical_documents(processing_status);
CREATE INDEX idx_documents_status_updated ON medical_documents(processing_status, updated_at);

-- Confidence scoring (Task 1.5)
ALTER TABLE medical_parameters ADD COLUMN confidence VARCHAR(20) NOT NULL DEFAULT 'MEDIUM';

-- Trigger for auto-updating updated_at on medical_documents
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_medical_documents_updated_at
    BEFORE UPDATE ON medical_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
