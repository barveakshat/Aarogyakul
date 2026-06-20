package com.aarogyakul.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    public final String code;
    public final HttpStatus status;

    public ApiException(String code, String message, HttpStatus status) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public static ApiException notFound(String message) {
        return new ApiException("RESOURCE_NOT_FOUND", message, HttpStatus.NOT_FOUND);
    }

    public static ApiException forbidden(String message) {
        return new ApiException("FORBIDDEN", message, HttpStatus.FORBIDDEN);
    }

    public static ApiException validation(String message) {
        return new ApiException("VALIDATION_ERROR", message, HttpStatus.BAD_REQUEST);
    }

    public static ApiException payloadTooLarge(String message) {
        return new ApiException("PAYLOAD_TOO_LARGE", message, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    public static ApiException processing(String message) {
        return new ApiException("PROCESSING_ERROR", message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
