package com.aarogyakul.live;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.http.*;
import org.springframework.web.client.RestClient;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;

@Tag("live")
class LiveExternalServicesTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeAll
    static void requireLiveFlag() {
        Assumptions.assumeTrue("true".equalsIgnoreCase(System.getenv("RUN_LIVE_TESTS")),
                "Set RUN_LIVE_TESTS=true to run live external service checks");
    }

    @Test
    void huggingFaceChatCompletionsEndpointResponds() throws Exception {
        String url = requireEnv("HUGGINGFACE_API_URL");
        String key = requireEnv("HUGGINGFACE_API_KEY");
        String model = requireEnv("LLAMA_MODEL_NAME");

        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0,
                "max_tokens", 80,
                "messages", List.of(
                        Map.of("role", "system", "content", "Reply with only valid JSON."),
                        Map.of("role", "user", "content", "Return {\"ok\":true}.")
                )
        );

        String raw = RestClient.create().post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + key)
                .body(body)
                .retrieve()
                .body(String.class);

        JsonNode root = objectMapper.readTree(raw);
        assertThat(root.at("/choices/0/message/content").asText()).isNotBlank();
    }

    @Test
    void s3CanWriteReadAndDeleteObject() {
        String bucket = requireEnv("AWS_S3_BUCKET_NAME");
        String key = "live-tests/aarogyakul-backend-smoke.txt";
        try (S3Client s3 = S3Client.builder()
                .region(Region.of(requireEnv("AWS_REGION")))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(requireEnv("AWS_ACCESS_KEY_ID"), requireEnv("AWS_SECRET_ACCESS_KEY"))))
                .build()) {
            s3.putObject(PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType("text/plain")
                            .build(),
                    RequestBody.fromString("aarogyakul-live-smoke", StandardCharsets.UTF_8));
            String body = s3.getObjectAsBytes(GetObjectRequest.builder().bucket(bucket).key(key).build())
                    .asUtf8String();
            assertThat(body).isEqualTo("aarogyakul-live-smoke");
            s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
        }
    }

    private String requireEnv(String name) {
        String value = System.getenv(name);
        Assumptions.assumeTrue(value != null && !value.isBlank(), name + " is required");
        return value;
    }
}
