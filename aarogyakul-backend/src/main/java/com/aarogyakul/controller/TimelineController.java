package com.aarogyakul.controller;

import com.aarogyakul.dto.Dtos.TimelineEventResponse;
import com.aarogyakul.security.CurrentUser;
import com.aarogyakul.service.TimelineService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
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
    public List<TimelineEventResponse> list(@PathVariable UUID memberId) {
        return timelineService.list(memberId, currentUser.id());
    }
}
