package com.aarogyakul.service.ai;

import com.aarogyakul.dto.Dtos.ComparisonData;
import com.aarogyakul.entity.MedicalParameter;
import com.aarogyakul.repository.MedicalParameterRepository;
import com.aarogyakul.util.Enums.TrendDirection;
import org.springframework.stereotype.Service;
import java.math.*;
import java.util.*;

@Service
public class ComparisonService {
    private final MedicalParameterRepository parameters;

    public ComparisonService(MedicalParameterRepository parameters) {
        this.parameters = parameters;
    }

    public List<ComparisonData> compare(List<MedicalParameter> currentParameters) {
        return currentParameters.stream().map(this::compareOne).toList();
    }

    private ComparisonData compareOne(MedicalParameter current) {
        Optional<MedicalParameter> prior = parameters
                .findFirstByFamilyMemberIdAndParameterNameAndReportDateBeforeOrderByReportDateDescCreatedAtDesc(
                        current.familyMember.id, current.parameterName, current.reportDate);
        BigDecimal previous = prior.map(p -> p.value).orElse(null);
        BigDecimal absolute = previous == null ? null : current.value.subtract(previous);
        Double percent = null;
        if (previous != null && previous.compareTo(BigDecimal.ZERO) != 0) {
            percent = absolute.divide(previous, 6, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }
        TrendDirection trend = calculateTrend(previous, current.value, current.referenceRangeLow, current.referenceRangeHigh);
        return new ComparisonData(current.parameterName, previous, current.value, absolute, percent, trend,
                current.unit, current.referenceRangeLow, current.referenceRangeHigh);
    }

    public TrendDirection calculateTrend(BigDecimal previous, BigDecimal current, BigDecimal refLow, BigDecimal refHigh) {
        if (previous == null || current == null) {
            return TrendDirection.UNKNOWN;
        }
        BigDecimal change = current.subtract(previous).abs();
        BigDecimal baseline = previous.abs().max(BigDecimal.ONE);
        if (change.divide(baseline, 6, RoundingMode.HALF_UP).compareTo(BigDecimal.valueOf(0.05)) < 0) {
            return TrendDirection.STABLE;
        }
        if (refLow == null || refHigh == null) {
            return current.compareTo(previous) > 0 ? TrendDirection.WORSENING : TrendDirection.IMPROVING;
        }
        BigDecimal midpoint = refLow.add(refHigh).divide(BigDecimal.valueOf(2), 6, RoundingMode.HALF_UP);
        BigDecimal before = previous.subtract(midpoint).abs();
        BigDecimal after = current.subtract(midpoint).abs();
        if (after.compareTo(before.multiply(BigDecimal.valueOf(0.9))) < 0) return TrendDirection.IMPROVING;
        if (after.compareTo(before.multiply(BigDecimal.valueOf(1.1))) > 0) return TrendDirection.WORSENING;
        return TrendDirection.STABLE;
    }
}
