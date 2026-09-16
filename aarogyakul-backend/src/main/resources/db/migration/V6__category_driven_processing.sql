-- V6: Category-Driven Processing Tables
-- Adds support for multi-category extraction

ALTER TABLE medical_documents
ADD COLUMN extracted_metadata JSONB;

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    duration VARCHAR(255),
    prescribing_doctor VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_prescriptions_document_id ON prescriptions(document_id);
CREATE INDEX idx_prescriptions_family_member_id ON prescriptions(family_member_id);

-- Vaccinations
CREATE TABLE vaccinations (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    dose_number VARCHAR(100),
    date_administered DATE,
    administered_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_vaccinations_document_id ON vaccinations(document_id);
CREATE INDEX idx_vaccinations_family_member_id ON vaccinations(family_member_id);

-- Medical Bills
CREATE TABLE medical_bills (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    provider_name VARCHAR(255) NOT NULL,
    total_amount NUMERIC(12,2),
    date_of_service DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_medical_bills_document_id ON medical_bills(document_id);
CREATE INDEX idx_medical_bills_family_member_id ON medical_bills(family_member_id);
