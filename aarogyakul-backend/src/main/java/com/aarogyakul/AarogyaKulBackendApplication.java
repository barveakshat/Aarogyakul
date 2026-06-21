package com.aarogyakul;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.TimeZone;

@EnableAsync
@SpringBootApplication
public class AarogyaKulBackendApplication {
    public static void main(String[] args) {
        // PostgreSQL expects canonical IANA zone IDs; Windows may expose the legacy Asia/Calcutta alias.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(AarogyaKulBackendApplication.class, args);
    }
}
