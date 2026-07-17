package com.aarogyakul.service.ai;

import com.aarogyakul.entity.MedicalDocument;
import com.aarogyakul.repository.MedicalDocumentRepository;
import com.aarogyakul.util.Enums.ProcessingStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

/**
 * Manages document processing status transitions in an independent transaction.
 * This exists as a separate bean to avoid the Spring proxy self-invocation problem:
 * calling @Transactional methods from within the same class bypasses the proxy,
 * meaning the transaction annotation has no effect. By extracting status mutations
 * into this service with REQUIRES_NEW propagation, we guarantee that status updates
 * commit independently — even if the caller's transaction rolls back.
 */
@Service
public class DocumentStatusService {
    private static final Logger log = LoggerFactory.getLogger(DocumentStatusService.class);
    private final MedicalDocumentRepository documents;

    public DocumentStatusService(MedicalDocumentRepository documents) {
        this.documents = documents;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markProcessing(UUID documentId) {
        documents.findById(documentId).ifPresentOrElse(document -> {
            document.processingStatus = ProcessingStatus.PROCESSING;
            document.processingError = null;
            documents.saveAndFlush(document);
            log.info("Document {} marked PROCESSING", documentId);
        }, () -> log.warn("markProcessing: document {} not found", documentId));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markCompleted(UUID documentId) {
        documents.findById(documentId).ifPresentOrElse(document -> {
            document.processingStatus = ProcessingStatus.COMPLETED;
            documents.saveAndFlush(document);
            log.info("Document {} marked COMPLETED", documentId);
        }, () -> log.warn("markCompleted: document {} not found", documentId));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markFailed(UUID documentId, String message) {
        documents.findById(documentId).ifPresentOrElse(document -> {
            document.processingStatus = ProcessingStatus.FAILED;
            document.processingError = message == null || message.isBlank()
                    ? "Document processing failed"
                    : message;
            document.retryCount = document.retryCount + 1;
            documents.saveAndFlush(document);
            log.error("Document {} marked FAILED (retry #{}): {}", documentId, document.retryCount, document.processingError);
        }, () -> log.warn("markFailed: document {} not found", documentId));
    }

    @Transactional(readOnly = true)
    public boolean canRetry(UUID documentId, int maxRetries) {
        return documents.findById(documentId)
                .map(doc -> doc.retryCount < maxRetries)
                .orElse(false);
    }
}
