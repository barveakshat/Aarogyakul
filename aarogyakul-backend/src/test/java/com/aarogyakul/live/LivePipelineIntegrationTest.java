package com.aarogyakul.live;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.util.LinkedMultiValueMap;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;

@Tag("live")
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_LIVE_TESTS", matches = "true")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = "app.storage-mode=s3")
class LivePipelineIntegrationTest {
    @Autowired
    TestRestTemplate rest;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void uploadBloodReportRunsFullAiPipeline() throws Exception {
        String token = registerAndLogin();
        HttpHeaders authHeaders = authHeaders(token);

        UUID familyId = postJson("/api/families", Map.of("familyName", "Live Smoke Family"), authHeaders)
                .get("familyId").traverse(objectMapper).readValueAs(UUID.class);

        JsonNode member = postJson("/api/families/" + familyId + "/members", Map.of(
                "fullName", "Live Smoke Member",
                "dateOfBirth", "1980-01-01",
                "gender", "OTHER",
                "bloodGroup", "O+",
                "relationshipToOwner", "Self"
        ), authHeaders);
        UUID memberId = member.get("memberId").traverse(objectMapper).readValueAs(UUID.class);

        JsonNode upload = uploadPdf(memberId, authHeaders);
        UUID documentId = upload.get("documentId").traverse(objectMapper).readValueAs(UUID.class);

        JsonNode completed = waitForCompletion(documentId, authHeaders);
        assertThat(completed.get("processingStatus").asText()).isEqualTo("COMPLETED");
        assertThat(completed.withArray("parameters").size()).isGreaterThan(0);
        assertThat(completed.at("/insight/summaryText").asText()).isNotBlank();

        ResponseEntity<Void> delete = rest.exchange("/api/documents/" + documentId, HttpMethod.DELETE,
                new HttpEntity<>(authHeaders), Void.class);
        assertThat(delete.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    }

    private String registerAndLogin() throws Exception {
        String email = "live-smoke-" + UUID.randomUUID() + "@aarogyakul.test";
        JsonNode response = postJson("/api/auth/register", Map.of(
                "email", email,
                "password", "password123",
                "fullName", "Live Smoke User"
        ), new HttpHeaders());
        return response.get("accessToken").asText();
    }

    private JsonNode postJson(String path, Map<String, Object> body, HttpHeaders headers) throws Exception {
        HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.putAll(headers);
        requestHeaders.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> response = rest.postForEntity(path, new HttpEntity<>(body, requestHeaders), String.class);
        assertThat(response.getStatusCode().is2xxSuccessful()).as(response.getBody()).isTrue();
        return objectMapper.readTree(response.getBody());
    }

    private JsonNode uploadPdf(UUID memberId, HttpHeaders authHeaders) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.putAll(authHeaders);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("documentType", "BLOOD_REPORT");
        body.add("file", new ByteArrayResource(createBloodReportPdf()) {
            @Override
            public String getFilename() {
                return "live-blood-report.pdf";
            }
        });
        ResponseEntity<String> response = rest.postForEntity("/api/members/" + memberId + "/documents",
                new HttpEntity<>(body, headers), String.class);
        assertThat(response.getStatusCode()).as(response.getBody()).isEqualTo(HttpStatus.ACCEPTED);
        return objectMapper.readTree(response.getBody());
    }

    private JsonNode waitForCompletion(UUID documentId, HttpHeaders authHeaders) throws Exception {
        for (int i = 0; i < 24; i++) {
            ResponseEntity<String> response = rest.exchange("/api/documents/" + documentId, HttpMethod.GET,
                    new HttpEntity<>(authHeaders), String.class);
            assertThat(response.getStatusCode().is2xxSuccessful()).as(response.getBody()).isTrue();
            JsonNode body = objectMapper.readTree(response.getBody());
            String status = body.get("processingStatus").asText();
            if ("COMPLETED".equals(status) || "FAILED".equals(status)) {
                assertThat(status).as(body.toPrettyString()).isEqualTo("COMPLETED");
                return body;
            }
            Thread.sleep(5_000);
        }
        throw new AssertionError("Document did not finish processing within 120 seconds");
    }

    private HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }

    private byte[] createBloodReportPdf() throws Exception {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                content.beginText();
                content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                content.setLeading(16);
                content.newLineAtOffset(72, 720);
                for (String line : reportLines()) {
                    content.showText(line);
                    content.newLine();
                }
                content.endText();
            }
            document.save(output);
            return output.toByteArray();
        }
    }

    private String[] reportLines() {
        return new String[] {
                "AarogyaKul Demo Diagnostics - Blood Test Report",
                "Report Date: " + LocalDate.now(),
                "Patient: Live Smoke Member",
                "Test Name                 Result       Unit       Biological Reference Interval",
                "HbA1c                     7.1          %          4.0 - 5.6",
                "Total Cholesterol         190          mg/dL      125 - 200",
                "Vitamin D                 24           ng/mL      30 - 100",
                "Hemoglobin                13.8         g/dL       13.0 - 17.0"
        };
    }
}
