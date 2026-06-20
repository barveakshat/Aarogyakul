package com.aarogyakul.service.ai;

import com.aarogyakul.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;

@Service
public class LlamaClient {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiUrl;
    private final String apiKey;
    private final String modelName;

    public LlamaClient(ObjectMapper objectMapper,
                       @Value("${huggingface.api.url}") String apiUrl,
                       @Value("${huggingface.api.key}") String apiKey,
                       @Value("${llama.model.name}") String modelName) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.modelName = modelName;
    }

    public String modelName() {
        return modelName;
    }

    public String chat(String systemPrompt, String userText, int maxTokens) {
        if (apiUrl == null || apiUrl.isBlank() || apiKey == null || apiKey.isBlank()) {
            throw ApiException.processing("Llama API is not configured");
        }
        Map<String, Object> body = Map.of(
                "model", modelName,
                "temperature", 0.2,
                "max_tokens", maxTokens,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userText)
                )
        );
        try {
            String raw = restClient.post()
                    .uri(apiUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(raw);
            JsonNode content = root.at("/choices/0/message/content");
            if (!content.isMissingNode()) {
                return content.asText();
            }
            return raw;
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw ApiException.processing("Llama API call failed");
        }
    }
}
