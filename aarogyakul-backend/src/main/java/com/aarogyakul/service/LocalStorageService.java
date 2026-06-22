package com.aarogyakul.service;

import com.aarogyakul.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import java.nio.file.*;
import java.time.Duration;

@Service
@ConditionalOnProperty(name = "app.storage-mode", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {
    private final Path root;

    public LocalStorageService(@Value("${app.local-storage-dir}") String dir) {
        this.root = Path.of(dir);
    }

    @Override
    public String put(String key, Path file, String contentType) {
        try {
            Path target = root.resolve(key).normalize();
            if (!target.startsWith(root.normalize())) {
                throw ApiException.validation("Invalid storage key");
            }
            Files.createDirectories(target.getParent());
            Files.copy(file, target, StandardCopyOption.REPLACE_EXISTING);
            return key;
        } catch (Exception e) {
            throw ApiException.processing("Could not store document");
        }
    }

    @Override
    public String presignedUrl(String key, Duration duration) {
        return "/api/files/" + key;
    }

    @Override
    public void delete(String key) {
        try {
            Files.deleteIfExists(root.resolve(key).normalize());
        } catch (Exception ignored) {
        }
    }
}
