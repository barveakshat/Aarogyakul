package com.aarogyakul.service.ai;

import com.aarogyakul.repository.MedicalParameterRepository;
import com.aarogyakul.util.Enums.TrendDirection;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class ComparisonServiceTest {
    private final ComparisonService service = new ComparisonService(mock(MedicalParameterRepository.class));

    @Test
    void stableWhenChangeIsLessThanFivePercent() {
        assertThat(service.calculateTrend(bd("100"), bd("103"), bd("70"), bd("110"))).isEqualTo(TrendDirection.STABLE);
    }

    @Test
    void improvingWhenMovingTowardReferenceMidpoint() {
        assertThat(service.calculateTrend(bd("180"), bd("130"), bd("70"), bd("110"))).isEqualTo(TrendDirection.IMPROVING);
    }

    @Test
    void worseningWhenMovingAwayFromReferenceMidpoint() {
        assertThat(service.calculateTrend(bd("100"), bd("150"), bd("70"), bd("110"))).isEqualTo(TrendDirection.WORSENING);
    }

    private BigDecimal bd(String value) {
        return new BigDecimal(value);
    }
}
