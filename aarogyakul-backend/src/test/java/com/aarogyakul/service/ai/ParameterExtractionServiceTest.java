package com.aarogyakul.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class ParameterExtractionServiceTest {
    private final ParameterExtractionService service = new ParameterExtractionService(mock(LlamaClient.class), new ObjectMapper());

    @Test
    void recoversJsonFromModelCommentary() {
        var report = service.parseResponse("""
                Here is the output:
                {"reportDate":"2025-09-10","parameters":[{"name":"Hemoglobin A1c","value":7.1,"unit":"%","referenceRangeLow":4.0,"referenceRangeHigh":5.6}]}
                """);
        assertThat(report.reportDate().toString()).isEqualTo("2025-09-10");
        assertThat(report.parameters()).hasSize(1);
        assertThat(report.parameters().getFirst().name()).isEqualTo("HbA1c");
    }
}
