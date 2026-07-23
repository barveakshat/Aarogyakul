package com.aarogyakul.service.ai;

import com.aarogyakul.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Calls the HuggingFace-hosted LLM API with configurable timeouts
 * and built-in retry with exponential backoff (3 attempts, 1s→2s→4s).
 */
@Service
public class LlamaClient {
    private static final Logger log = LoggerFactory.getLogger(LlamaClient.class);
    private static final int MAX_RETRIES = 3;
    private static final long[] BACKOFF_MS = {1000, 2000, 4000};

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiUrl;
    private final String apiKey;
    private final String modelName;

    public LlamaClient(ObjectMapper objectMapper,
                       @Value("${huggingface.api.url}") String apiUrl,
                       @Value("${huggingface.api.key}") String apiKey,
                       @Value("${llama.model.name}") String modelName,
                       @Value("${llm.connect-timeout-seconds:30}") int connectTimeout,
                       @Value("${llm.read-timeout-seconds:90}") int readTimeout) {
        var settings = ClientHttpRequestFactorySettings.DEFAULTS
                .withConnectTimeout(Duration.ofSeconds(connectTimeout))
                .withReadTimeout(Duration.ofSeconds(readTimeout));
        this.restClient = RestClient.builder()
                .requestFactory(ClientHttpRequestFactories.get(settings))
                .build();
        this.objectMapper = objectMapper;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.modelName = modelName;
    }

    public String modelName() {
        return modelName;
    }

    /**
     * Sends a chat completion request to the LLM API.
     * Retries up to 3 times with exponential backoff on transient failures.
     */
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

        Exception lastException = null;
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
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
                lastException = e;
                if (attempt < MAX_RETRIES) {
                    log.warn("LLM API attempt {}/{} failed: {}. Retrying in {}ms...",
                            attempt, MAX_RETRIES, e.getMessage(), BACKOFF_MS[attempt - 1]);
                    try {
                        Thread.sleep(BACKOFF_MS[attempt - 1]);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw ApiException.processing("LLM API call interrupted");
                    }
                }
            }
        }
        log.error("LLM API failed after {} attempts", MAX_RETRIES, lastException);
        throw ApiException.processing("Llama API call failed after " + MAX_RETRIES + " attempts");
    }
}
