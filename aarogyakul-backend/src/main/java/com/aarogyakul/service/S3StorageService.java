package com.aarogyakul.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import java.nio.file.Path;
import java.time.Duration;

@Service
@ConditionalOnProperty(name = "app.storage-mode", havingValue = "s3")
public class S3StorageService implements StorageService {
    private final S3Client s3;
    private final S3Presigner presigner;
    private final String bucket;

    public S3StorageService(S3Client s3, S3Presigner presigner,
                            @Value("${aws.s3-bucket-name}") String bucket) {
        this.s3 = s3;
        this.presigner = presigner;
        this.bucket = bucket;
    }

    @Override
    public String put(String key, Path file, String contentType) {
        s3.putObject(PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .build(),
                RequestBody.fromFile(file));
        return key;
    }

    @Override
    public String presignedUrl(String key, Duration duration) {
        var get = GetObjectRequest.builder().bucket(bucket).key(key).build();
        var request = GetObjectPresignRequest.builder().signatureDuration(duration).getObjectRequest(get).build();
        return presigner.presignGetObject(request).url().toString();
    }

    @Override
    public void delete(String key) {
        s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }
}
