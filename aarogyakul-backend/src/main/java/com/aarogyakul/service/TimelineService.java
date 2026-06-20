package com.aarogyakul.service;

import com.aarogyakul.dto.Dtos.TimelineEventResponse;
import com.aarogyakul.repository.TimelineEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class TimelineService {
    private final MemberService memberService;
    private final TimelineEventRepository events;

    public TimelineService(MemberService memberService, TimelineEventRepository events) {
        this.memberService = memberService;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<TimelineEventResponse> list(UUID memberId, UUID userId) {
        memberService.requireOwnedMember(memberId, userId);
        return events.findByFamilyMemberIdOrderByEventDateDescCreatedAtDesc(memberId).stream()
                .map(event -> new TimelineEventResponse(
                        event.id,
                        event.eventType,
                        event.eventDate,
                        event.title,
                        event.description,
                        event.relatedDocument == null ? null : event.relatedDocument.id))
                .toList();
    }
}
