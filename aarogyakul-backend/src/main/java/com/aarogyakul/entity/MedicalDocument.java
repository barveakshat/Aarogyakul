package com.aarogyakul.entity;

import com.aarogyakul.util.Enums.DocumentType;
import com.aarogyakul.util.Enums.ProcessingStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_documents")
public class MedicalDocument {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "family_member_id")
    public FamilyMember familyMember;
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    public DocumentType documentType;
    @Column(name = "file_name", nullable = false)
    public String fileName;
    @Column(name = "file_url", nullable = false)
    public String fileUrl;
    @Column(name = "file_size_bytes", nullable = false)
    public long fileSizeBytes;
    @Column(name = "mime_type", nullable = false)
    public String mimeType;
    @Column(name = "report_date")
    public LocalDate reportDate;
    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status", nullable = false)
    public ProcessingStatus processingStatus = ProcessingStatus.PENDING;
    @Column(name = "processing_error", columnDefinition = "TEXT")
    public String processingError;
    @Column(name = "uploaded_at", nullable = false)
    public OffsetDateTime uploadedAt;

    @PrePersist
    void prePersist() {
        uploadedAt = uploadedAt == null ? OffsetDateTime.now() : uploadedAt;
    }
}
