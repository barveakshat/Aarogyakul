package com.aarogyakul.service;

import com.aarogyakul.dto.Dtos.PaginatedResponse;
import com.aarogyakul.dto.Dtos.TimelineEventRequest;
import com.aarogyakul.dto.Dtos.TimelineEventResponse;
import com.aarogyakul.entity.TimelineEvent;
import com.aarogyakul.exception.ApiException;
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
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<TimelineEventResponse> listPaged(UUID memberId, UUID userId, int page, int size) {
        memberService.requireOwnedMember(memberId, userId);
        var pageResult = events.findByFamilyMemberId(memberId,
                org.springframework.data.domain.PageRequest.of(page, size,
                        org.springframework.data.domain.Sort.by("eventDate").descending().and(
                                org.springframework.data.domain.Sort.by("createdAt").descending())));
        var data = pageResult.getContent().stream().map(this::toResponse).toList();
        return new PaginatedResponse<>(data, pageResult.getNumber(), pageResult.getTotalPages(), pageResult.getTotalElements(), pageResult.hasNext());
    }

    @Transactional
    public TimelineEventResponse create(UUID memberId, UUID userId, TimelineEventRequest request) {
        var member = memberService.requireOwnedMember(memberId, userId);
        var event = new TimelineEvent();
        event.familyMember = member;
        event.eventType = request.eventType();
        event.eventDate = request.eventDate();
        event.title = request.title().trim();
        event.description = request.description();
        event.relatedDocument = null;
        return toResponse(events.save(event));
    }

    @Transactional
    public void delete(UUID memberId, UUID eventId, UUID userId) {
        memberService.requireOwnedMember(memberId, userId);
        var event = events.findById(eventId)
                .orElseThrow(() -> ApiException.notFound("Timeline event not found"));
        if (!event.familyMember.id.equals(memberId)) {
            throw ApiException.notFound("Timeline event not found");
        }
        if (event.relatedDocument != null) {
            throw ApiException.validation("Cannot delete auto-generated timeline events");
        }
        event.deletedAt = java.time.Instant.now();
        events.save(event);
    }

    private TimelineEventResponse toResponse(TimelineEvent event) {
        return new TimelineEventResponse(
                event.id,
                event.eventType,
                event.eventDate,
                event.title,
                event.description,
                event.relatedDocument == null ? null : event.relatedDocument.id,
                event.relatedDocument == null);
    }
}
