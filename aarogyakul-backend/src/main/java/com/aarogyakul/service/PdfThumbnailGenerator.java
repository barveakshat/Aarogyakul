package com.aarogyakul.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class PdfThumbnailGenerator {
    private static final Logger log = LoggerFactory.getLogger(PdfThumbnailGenerator.class);

    /**
     * Generates a PNG thumbnail for the first page of a PDF.
     * @param pdfFile Path to the PDF file.
     * @return Path to the generated temporary PNG file, or null if it fails.
     */
    public Path generateThumbnail(Path pdfFile) {
        try (PDDocument document = Loader.loadPDF(pdfFile.toFile())) {
            PDFRenderer renderer = new PDFRenderer(document);
            BufferedImage image = renderer.renderImageWithDPI(0, 72);
            Path thumb = Files.createTempFile("aarogyakul-thumb-", ".png");
            ImageIO.write(image, "png", thumb.toFile());
            return thumb;
        } catch (Exception e) {
            log.warn("Failed to generate PDF thumbnail for file {}", pdfFile, e);
            return null;
        }
    }
}
