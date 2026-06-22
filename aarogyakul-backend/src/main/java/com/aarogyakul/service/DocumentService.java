package com.aarogyakul.service;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.*;
import com.aarogyakul.exception.ApiException;
import com.aarogyakul.repository.*;
import com.aarogyakul.service.ai.DocumentProcessingService;
import com.aarogyakul.util.Enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.util.*;

@Service
public class DocumentService {
    private static final long MAX_PDF_BYTES = 15L * 1024 * 1024;
    private final MemberService memberService;
    private final MedicalDocumentRepository documents;
    private final MedicalParameterRepository parameters;
    private final AiInsightRepository insights;
    private final TimelineEventRepository timelineEvents;
    private final StorageService storage;
    private final DocumentProcessingService processingService;
    private final Mapper mapper;

    public DocumentService(MemberService memberService, MedicalDocumentRepository documents,
                           MedicalParameterRepository parameters, AiInsightRepository insights,
                           TimelineEventRepository timelineEvents, StorageService storage,
                           DocumentProcessingService processingService, Mapper mapper) {
        this.memberService = memberService;
        this.documents = documents;
        this.parameters = parameters;
        this.insights = insights;
        this.timelineEvents = timelineEvents;
        this.storage = storage;
        this.processingService = processingService;
        this.mapper = mapper;
    }

    @Transactional
    public DocumentUploadResponse upload(UUID memberId, UUID userId, DocumentType type, MultipartFile file) {
        validatePdf(file);
        FamilyMember member = memberService.requireOwnedMember(memberId, userId);

        MedicalDocument document = new MedicalDocument();
        document.familyMember = member;
        document.documentType = type == null ? DocumentType.BLOOD_REPORT : type;
        document.fileName = Optional.ofNullable(file.getOriginalFilename()).orElse("report.pdf");
        document.fileSizeBytes = file.getSize();
        document.mimeType = Optional.ofNullable(file.getContentType()).orElse("application/pdf");
        document.processingStatus = requiresAiProcessing(document.documentType) ? ProcessingStatus.PENDING : ProcessingStatus.COMPLETED;
        document.fileUrl = "pending";
        document = documents.save(document);

        Path temp = copyToTemp(file);
        String key = "documents/%s/%s.pdf".formatted(member.id, document.id);
        document.fileUrl = storage.put(key, temp, document.mimeType);
        documents.save(document);

        if (requiresAiProcessing(document.documentType)) {
            UUID documentId = document.id;
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        processingService.process(documentId, temp);
                    }
                });
            } else {
                processingService.process(documentId, temp);
            }
        }
        return new DocumentUploadResponse(document.id, document.fileName, document.documentType, document.processingStatus, document.uploadedAt);
    }

    private boolean requiresAiProcessing(DocumentType type) {
        return type == DocumentType.BLOOD_REPORT || type == DocumentType.LAB_REPORT;
    }

    @Transactional(readOnly = true)
    public DocumentResponse get(UUID documentId, UUID userId) {
        MedicalDocument document = requireOwnedDocument(documentId, userId);
        var params = parameters.findByDocumentIdOrderByParameterNameAsc(document.id).stream().map(mapper::parameter).toList();
        var insight = insights.findByDocumentId(document.id).map(mapper::insight).orElse(null);
        return new DocumentResponse(document.id, document.fileName, document.documentType, document.processingStatus,
                document.reportDate, document.processingError, params, insight, document.uploadedAt);
    }

    @Transactional(readOnly = true)
    public List<DocumentSummaryResponse> listForMember(UUID memberId, UUID userId) {
        memberService.requireOwnedMember(memberId, userId);
        return documents.findByFamilyMemberIdOrderByUploadedAtDesc(memberId).stream().map(mapper::documentSummary).toList();
    }

    @Transactional
    public void delete(UUID documentId, UUID userId) {
        MedicalDocument document = requireOwnedDocument(documentId, userId);
        timelineEvents.deleteByRelatedDocumentId(document.id);
        insights.deleteByDocumentId(document.id);
        parameters.deleteByDocumentId(document.id);
        storage.delete(document.fileUrl);
        documents.delete(document);
    }

    public MedicalDocument requireOwnedDocument(UUID documentId, UUID userId) {
        return documents.findByIdAndFamilyMemberFamilyOwnerId(documentId, userId)
                .orElseThrow(() -> ApiException.notFound("Document not found"));
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.validation("PDF file is required");
        }
        if (file.getSize() > MAX_PDF_BYTES) {
            throw ApiException.payloadTooLarge("PDF must be 15MB or smaller");
        }
        String type = Optional.ofNullable(file.getContentType()).orElse("");
        String name = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase();
        if (!type.equalsIgnoreCase("application/pdf") && !name.endsWith(".pdf")) {
            throw ApiException.validation("Only PDF uploads are supported");
        }
    }

    private Path copyToTemp(MultipartFile file) {
        try {
            Path temp = Files.createTempFile("aarogyakul-report-", ".pdf");
            file.transferTo(temp);
            return temp;
        } catch (Exception e) {
            throw ApiException.processing("Could not prepare uploaded PDF");
        }
    }
}
