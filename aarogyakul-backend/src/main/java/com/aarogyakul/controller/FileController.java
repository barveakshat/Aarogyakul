package com.aarogyakul.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Serves locally stored files (photos, documents) over HTTP.
 * Only active when using local storage mode (the default for development).
 */
@RestController
@ConditionalOnProperty(name = "app.storage-mode", havingValue = "local", matchIfMissing = true)
public class FileController {
    private final Path root;

    public FileController(@Value("${app.local-storage-dir}") String dir) {
        this.root = Path.of(dir);
    }

    @GetMapping("/api/files/**")
    public ResponseEntity<Resource> serve(HttpServletRequest request) {
        String fullPath = request.getRequestURI();
        String key = fullPath.substring("/api/files/".length());

        Path file = root.resolve(key).normalize();
        if (!file.startsWith(root.normalize()) || !Files.exists(file) || !Files.isRegularFile(file)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String contentType;
        try {
            contentType = Files.probeContentType(file);
        } catch (Exception e) {
            contentType = "application/octet-stream";
        }
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(new FileSystemResource(file));
    }
}
