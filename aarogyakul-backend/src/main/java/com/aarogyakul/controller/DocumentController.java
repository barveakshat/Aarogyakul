package com.aarogyakul.controller;

import com.aarogyakul.dto.Dtos;
import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.security.CurrentUser;
import com.aarogyakul.service.DocumentService;
import com.aarogyakul.util.Enums.DocumentType;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@RestController
public class DocumentController {
    private final DocumentService documentService;
    private final CurrentUser currentUser;

    public DocumentController(DocumentService documentService, CurrentUser currentUser) {
        this.documentService = documentService;
        this.currentUser = currentUser;
    }

    @PostMapping(value = "/api/members/{memberId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentUploadResponse> upload(@PathVariable UUID memberId,
                                                         @RequestParam MultipartFile file,
                                                         @RequestParam(defaultValue = "BLOOD_REPORT") DocumentType documentType) {
        return ResponseEntity.accepted().body(documentService.upload(memberId, currentUser.id(), documentType, file));
    }

    @GetMapping("/api/documents/{documentId}")
    public DocumentResponse get(@PathVariable UUID documentId) {
        return documentService.get(documentId, currentUser.id());
    }

    @GetMapping("/api/members/{memberId}/documents")
    public Dtos.PaginatedResponse<DocumentSummaryResponse> list(@PathVariable UUID memberId,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "20") int size) {
        return documentService.listForMemberPaged(memberId, currentUser.id(), page, Math.min(size, 50));
    }

    @DeleteMapping("/api/documents/{documentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID documentId) {
        documentService.delete(documentId, currentUser.id());
    }
}
