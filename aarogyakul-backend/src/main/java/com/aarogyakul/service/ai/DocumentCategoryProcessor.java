package com.aarogyakul.service.ai;

import com.aarogyakul.entity.AiInsight;
import com.aarogyakul.entity.MedicalDocument;
import com.aarogyakul.util.Enums.DocumentType;

public interface DocumentCategoryProcessor {
    boolean supports(DocumentType type);
    
    /**
     * Processes the extracted text from the document.
     * Must save the extracted structured data using its own repositories.
     * 
     * @param document The document being processed.
     * @param extractedText The OCR text of the document.
     * @return The final AiInsight to be saved, containing the summary and comparison/metadata JSON.
     * @throws ExtractionValidationException if critical identifying fields fail validation.
     */
    AiInsight process(MedicalDocument document, String extractedText);
}
