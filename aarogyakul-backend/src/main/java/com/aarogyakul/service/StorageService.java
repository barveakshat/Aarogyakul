package com.aarogyakul.service;

import java.nio.file.Path;
import java.time.Duration;

public interface StorageService {
    String put(String key, Path file, String contentType);
    String presignedUrl(String key, Duration duration);
    void delete(String key);
}
