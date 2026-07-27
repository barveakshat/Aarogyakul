package com.aarogyakul.controller;

import com.aarogyakul.dto.Dtos.*;
import com.aarogyakul.entity.MedicalParameter;
import com.aarogyakul.repository.MedicalParameterRepository;
import com.aarogyakul.security.CurrentUser;
import com.aarogyakul.service.MemberService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/members/{memberId}/parameters")
public class ParameterHistoryController {
    private final MedicalParameterRepository parameters;
    private final MemberService memberService;
    private final CurrentUser currentUser;

    public ParameterHistoryController(MedicalParameterRepository parameters,
                                      MemberService memberService,
                                      CurrentUser currentUser) {
        this.parameters = parameters;
        this.memberService = memberService;
        this.currentUser = currentUser;
    }

    /** List distinct parameter names tracked for a member. */
    @GetMapping("/tracked")
    public TrackedParametersResponse tracked(@PathVariable UUID memberId) {
        memberService.requireOwnedMember(memberId, currentUser.id());
        List<String> names = parameters.findDistinctParameterNamesByFamilyMemberId(memberId);
        return new TrackedParametersResponse(names);
    }

    /** Get trend data (all readings over time) for a specific parameter. */
    @GetMapping("/trend")
    public ParameterTrendResponse trend(@PathVariable UUID memberId,
                                        @RequestParam String parameterName) {
        memberService.requireOwnedMember(memberId, currentUser.id());
        List<MedicalParameter> readings = parameters.findByFamilyMemberIdAndParameterNameOrderByReportDateAsc(
                memberId, parameterName);
        String unit = readings.isEmpty() ? "" : readings.getFirst().unit;
        List<ParameterDataPoint> dataPoints = readings.stream()
                .map(p -> new ParameterDataPoint(p.reportDate, p.value, p.referenceRangeLow, p.referenceRangeHigh))
                .toList();
        return new ParameterTrendResponse(parameterName, unit, dataPoints);
    }
}
