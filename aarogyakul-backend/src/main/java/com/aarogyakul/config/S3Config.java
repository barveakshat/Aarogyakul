package com.aarogyakul.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {
    @Bean
    @Conditional(S3EnabledCondition.class)
    S3Client s3Client(@Value("${aws.region}") String region,
                      @Value("${aws.access-key-id}") String accessKey,
                      @Value("${aws.secret-access-key}") String secretKey) {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    @Bean
    @Conditional(S3EnabledCondition.class)
    S3Presigner s3Presigner(@Value("${aws.region}") String region,
                            @Value("${aws.access-key-id}") String accessKey,
                            @Value("${aws.secret-access-key}") String secretKey) {
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }
}
