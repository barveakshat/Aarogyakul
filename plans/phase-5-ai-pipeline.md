# Phase 5: AI Report Reader Pipeline (Hours 22–34)

**Goal:** Implement the flagship OCR → extraction → comparison → insight pipeline.

## Overview
The AI pipeline processes uploaded PDF documents through 5 stages:
1. OCR Extraction
2. Llama API Integration
3. Canonicalization & Parameter Persistence
4. Comparison & Trend Calculation
5. Insight Generation & Finalization

---

## Stage 1: OCR Extraction (Hours 22–26)

### Tasks
- [ ] Implement `OcrService`:
  - [ ] Try PDFBox extraction first (`PDFTextStripper`)
  - [ ] If text length < 50 chars, fallback to Tesseract OCR
  - [ ] Handle exceptions gracefully
  - [ ] Return clean text string or throw `ProcessingException`
- [ ] Configure tess4j dependencies (tesseract-data, leptonica)
- [ ] Test OCR with both text-based and scanned PDF samples

### Text Extraction Logic
```java
public String extractText(File pdfFile) throws ProcessingException {
    try (PDDocument document = PDDocument.load(pdfFile)) {
        String text = new PDFTextStripper().getText(document);
        
        // Fallback to Tesseract if text is too short (scanned image)
        if (text.trim().length() < 50) {
            log.info("PDF appears scanned, falling back to Tesseract OCR");
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath("/usr/local/share/tessdata");
            return tesseract.doOCR(pdfFile);
        }
        
        return text.trim();
    } catch (Exception e) {
        throw new ProcessingException("Failed to extract text from PDF", e);
    }
}
```

### Deliverable
Robust OCR pipeline handling both text-based and scanned PDFs.

---

## Stage 2: Llama API Integration (Hours 26–28)

### Tasks
- [ ] Create `LlamaClient`:
  - [ ] Use OpenAI-compatible HTTP client
  - [ ] Configure base URL from `HUGGINGFACE_API_URL`
  - [ ] Add `Authorization: Bearer {api-key}` header
  - [ ] Set `LLAMA_MODEL_NAME` via environment variable
- [ ] Implement parameter extraction:
  - [ ] Send system prompt + extracted text to LLM
  - [ ] Expect strict JSON response with parameters array
  - [ ] Implement regex-based JSON recovery if model adds commentary
  - [ ] Handle JSON parsing errors gracefully
- [ ] Test Llama API with sample PDF text

### LlamaClient Configuration
```java
@Component
public class LlamaClient {
    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;
    private final String modelName;
    
    public LlamaClient(@Value("${huggingface.api.url}") String apiUrl,
                       @Value("${huggingface.api.key}") String apiKey,
                       @Value("${llama.model.name}") String modelName) {
        this.restTemplate = new RestTemplate();
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.modelName = modelName;
    }
    
    public String callLlama(String systemPrompt, String userText) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        JSONObject requestBody = new JSONObject();
        requestBody.put("model", modelName);
        requestBody.put("messages", Arrays.asList(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", userText)
        ));
        requestBody.put("temperature", 0.3);
        requestBody.put("max_tokens", 2000);
        
        HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new ProcessingException("Llama API call failed", e);
        }
    }
}
```

### Deliverable
Llama API integration with error handling and fallback JSON parsing.

---

## Stage 3: Canonicalization & Parameter Persistence (Hours 28–30)

### Tasks
- [ ] Create static synonym map (`ParameterUtils.java`):
  ```java
  public class ParameterUtils {
      private static final Map<String, String> SYNONYM_MAP = Map.ofEntries(
          Map.entry("hba1c", "HbA1c"),
          Map.entry("glycated hemoglobin", "HbA1c"),
          Map.entry("total cholesterol", "Total Cholesterol"),
          Map.entry("hdl cholesterol", "HDL"),
          Map.entry("ldl cholesterol", "LDL"),
          Map.entry("triglycerides", "Triglycerides"),
          Map.entry("vitamin d", "Vitamin D"),
          Map.entry("25-hydroxy vitamin d", "Vitamin D"),
          Map.entry("hemoglobin", "Hemoglobin"),
          Map.entry("hb", "Hemoglobin"),
          Map.entry("blood glucose", "Blood Glucose"),
          Map.entry("fasting blood glucose", "Blood Glucose"),
          Map.entry("creatinine", "Creatinine"),
          Map.entry("tsh", "TSH"),
          Map.entry("thyroid stimulating hormone", "TSH")
      );
      
      public static String canonicalize(String paramName) {
          String lower = paramName.toLowerCase().trim();
          return SYNONYM_MAP.getOrDefault(lower, paramName);
      }
  }
  ```
- [ ] Implement `ParameterExtractionService`:
  - [ ] Call Llama API with extraction prompt
  - [ ] Parse JSON response
  - [ ] Canonicalize parameter names
  - [ ] Create `MedicalParameter` entities
  - [ ] Save to database
- [ ] Implement `MedicalDocumentRepository` custom query for comparison:
  ```java
  @Query("""
      SELECT mp FROM MedicalParameter mp
      WHERE mp.familyMemberId = :memberId
      AND mp.parameterName = :paramName
      AND mp.reportDate < :reportDate
      ORDER BY mp.reportDate DESC
      """)
  Optional<MedicalParameter> findMostRecentPrior(
      @Param("memberId") UUID memberId,
      @Param("paramName") String paramName,
      @Param("reportDate") LocalDate reportDate
  );
  ```

### Deliverable
Canonicalization logic and parameter persistence to database.

---

## Stage 4: Comparison & Trend Calculation (Hours 30–32)

### Tasks
- [ ] Implement comparison logic:
  - [ ] Query most recent prior parameter for each canonical name
  - [ ] Calculate: `absChange`, `percentChange`, `trendDirection`
  - [ ] Determine trend direction based on reference range midpoint
- [ ] Create `ComparisonData` DTO for each parameter
- [ ] Aggregate all comparisons into `ComparisonContext`
- [ ] Handle edge cases (no prior data, missing reference ranges)

### Trend Logic
```java
public record ComparisonResult(
    String parameterName,
    Double previousValue,
    Double currentValue,
    Double percentChange,
    TrendDirection trend
) {}

public enum TrendDirection {
    IMPROVING, WORSENING, STABLE, UNKNOWN
}

private TrendDirection calculateTrend(
    Double previous, Double current, 
    Double refLow, Double refHigh
) {
    if (previous == null) return TrendDirection.UNKNOWN;
    
    double percentChange = ((current - previous) / previous) * 100;
    
    if (refLow == null || refHigh == null) {
        return percentChange > 0 ? TrendDirection.WORSENING : TrendDirection.IMPROVING;
    }
    
    double refMidpoint = (refLow + refHigh) / 2.0;
    double distanceBefore = Math.abs(previous - refMidpoint);
    double distanceAfter = Math.abs(current - refMidpoint);
    
    if (distanceAfter < distanceBefore * 0.9) {
        return TrendDirection.IMPROVING;
    } else if (distanceAfter > distanceBefore * 1.1) {
        return TrendDirection.WORSENING;
    } else {
        return TrendDirection.STABLE;
    }
}
```

### Deliverable
Comparison logic producing trend direction for each parameter.

---

## Stage 5: Insight Generation & Finalization (Hours 32–34)

### Tasks
- [ ] Implement `InsightGenerationService`:
  - [ ] Send comparison JSON to Llama with "Friendly Assistant" prompt
  - [ ] Generate plain-English summary
  - [ ] Store `AIInsight` entity
- [ ] Update `MedicalDocument` status:
  - [ ] On success: `status = COMPLETED`
  - [ ] On failure: `status = FAILED`, `processing_error = "message"`
- [ ] Auto-create `TimelineEvent`:
  - [ ] `event_type = DOCUMENT_UPLOAD`
  - [ ] `title = "Blood Test Uploaded"`
  - [ ] `description = "Extracted parameters: HbA1c, Cholesterol, Vitamin D"`
  - [ ] `event_date = document.report_date`
- [ ] Implement document polling:
  - [ ] `GET /api/documents/{id}` returns full details with insight
  - [ ] Include `processing_status` field for frontend state management

### Insight Generation Prompt
```
You are a friendly medical assistant explaining lab results to someone with no medical background. 
You will be given a JSON object describing one or more lab parameters, their current value, and 
(if available) their previous value and percent change. 

Write a short, warm, plain-English summary (2-4 sentences) of what changed and whether it's 
worth mentioning to a doctor. Do not give a diagnosis. Do not use medical jargon without 
explaining it in the same sentence. If there is no previous value to compare against, just 
state the current value and whether it falls within the normal range.

JSON:
{comparison_data_json}
```

### Deliverable
Full AI pipeline end-to-end, producing summary insights and auto-creating timeline events.

---

## Environment Variables
```bash
HUGGINGFACE_API_URL=https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-70b-versatile/chat/completions
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxx
LLAMA_MODEL_NAME=meta-llama/Llama-3.1-70b-versatile
```

## Key Services to Implement
- `OcrService.java`
- `LlamaClient.java`
- `ParameterExtractionService.java`
- `InsightGenerationService.java`
- `ParameterUtils.java`
