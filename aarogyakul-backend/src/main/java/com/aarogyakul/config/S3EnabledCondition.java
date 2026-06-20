package com.aarogyakul.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class S3EnabledCondition implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String mode = context.getEnvironment().getProperty("app.storage-mode", "local");
        String bucket = context.getEnvironment().getProperty("aws.s3-bucket-name", "");
        return "s3".equalsIgnoreCase(mode) && !bucket.isBlank();
    }
}
