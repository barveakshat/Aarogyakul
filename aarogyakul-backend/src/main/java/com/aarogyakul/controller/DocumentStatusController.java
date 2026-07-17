package com.aarogyakul.controller;

import com.aarogyakul.exception.ApiException;
import com.aarogyakul.repository.MedicalDocumentRepository;
import com.aarogyakul.security.CurrentUser;
import com.aarogyakul.service.ai.ProcessingStageEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * SSE endpoint for real-time document processing status updates.
 * Clients subscribe to a document's processing stream and receive
 * stage-by-stage progress events pushed by the AI pipeline.
 */
@RestController
@RequestMapping("/api/documents")
public class DocumentStatusController {
    private static final Logger log = LoggerFactory.getLogger(DocumentStatusController.class);
    private static final long SSE_TIMEOUT = 120_000L;

    private final Map<UUID, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final MedicalDocumentRepository documents;
    private final CurrentUser currentUser;

    public DocumentStatusController(MedicalDocumentRepository documents, CurrentUser currentUser) {
        this.documents = documents;
        this.currentUser = currentUser;
    }

    @GetMapping(value = "/{documentId}/status-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter statusStream(@PathVariable UUID documentId) {
        // Verify the requesting user owns this document
        documents.findById(documentId)
                .filter(doc -> doc.familyMember.family.owner.id.equals(currentUser.id()))
                .orElseThrow(() -> ApiException.notFound("Document not found"));

        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        emitters.computeIfAbsent(documentId, k -> Collections.synchronizedList(new ArrayList<>())).add(emitter);

        Runnable cleanup = () -> {
            List<SseEmitter> list = emitters.get(documentId);
            if (list != null) {
                list.remove(emitter);
                if (list.isEmpty()) emitters.remove(documentId);
            }
        };
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(t -> cleanup.run());

        log.debug("SSE client connected for document {}", documentId);
        return emitter;
    }

    @EventListener
    public void onProcessingStage(ProcessingStageEvent event) {
        List<SseEmitter> list = emitters.get(event.documentId());
        if (list == null || list.isEmpty()) return;

        List<SseEmitter> dead = new ArrayList<>();
        synchronized (list) {
            for (SseEmitter emitter : list) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("stage")
                            .data(Map.of(
                                    "stage", event.stage(),
                                    "message", event.message()
                            )));
                    if (ProcessingStageEvent.COMPLETED.equals(event.stage())
                            || ProcessingStageEvent.FAILED.equals(event.stage())) {
                        emitter.complete();
                        dead.add(emitter);
                    }
                } catch (IOException e) {
                    dead.add(emitter);
                }
            }
            list.removeAll(dead);
        }
        if (list.isEmpty()) emitters.remove(event.documentId());
    }
}
