package com.aarogyakul.controller;

import com.aarogyakul.dto.Dtos;
import com.aarogyakul.dto.Dtos.TimelineEventRequest;
import com.aarogyakul.dto.Dtos.TimelineEventResponse;
import com.aarogyakul.security.CurrentUser;
import com.aarogyakul.service.TimelineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/members/{memberId}/timeline")
public class TimelineController {
    private final TimelineService timelineService;
    private final CurrentUser currentUser;

    public TimelineController(TimelineService timelineService, CurrentUser currentUser) {
        this.timelineService = timelineService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public Dtos.PaginatedResponse<TimelineEventResponse> list(@PathVariable UUID memberId,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "20") int size) {
        return timelineService.listPaged(memberId, currentUser.id(), page, Math.min(size, 50));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TimelineEventResponse create(@PathVariable UUID memberId,
                                        @Valid @RequestBody TimelineEventRequest request) {
        return timelineService.create(memberId, currentUser.id(), request);
    }

    @DeleteMapping("/{eventId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID memberId, @PathVariable UUID eventId) {
        timelineService.delete(memberId, eventId, currentUser.id());
    }
}
