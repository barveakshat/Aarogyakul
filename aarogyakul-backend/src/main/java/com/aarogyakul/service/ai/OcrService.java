package com.aarogyakul.service.ai;

import com.aarogyakul.exception.ApiException;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.nio.file.*;

@Service
public class OcrService {
    private final String tessdataPath;

    public OcrService(@Value("${tesseract.datapath}") String tessdataPath) {
        this.tessdataPath = tessdataPath;
    }

    public String extractText(Path pdfFile) {
        try (PDDocument document = Loader.loadPDF(pdfFile.toFile())) {
            String text = new PDFTextStripper().getText(document).trim();
            if (text.length() >= 50) {
                return text;
            }
            return extractWithTesseract(document);
        } catch (Exception e) {
            throw ApiException.processing("Failed to extract text from PDF");
        }
    }

    private String extractWithTesseract(PDDocument document) throws Exception {
        Tesseract tesseract = new Tesseract();
        if (tessdataPath != null && !tessdataPath.isBlank()) {
            tesseract.setDatapath(tessdataPath);
        }
        PDFRenderer renderer = new PDFRenderer(document);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < document.getNumberOfPages(); i++) {
            Path page = Files.createTempFile("aarogyakul-page-", ".png");
            try {
                ImageIO.write(renderer.renderImageWithDPI(i, 250), "png", page.toFile());
                sb.append(tesseract.doOCR(page.toFile())).append('\n');
            } finally {
                Files.deleteIfExists(page);
            }
        }
        String text = sb.toString().trim();
        if (text.length() < 20) {
            throw ApiException.processing("No readable text found in PDF");
        }
        return text;
    }
}
