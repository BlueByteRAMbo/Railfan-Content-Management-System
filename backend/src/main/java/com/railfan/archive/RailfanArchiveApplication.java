package com.railfan.archive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Railfan Archive Manager — Spring Boot entry point.
 * Manages train video records for railfan YouTubers.
 */
@SpringBootApplication
@EnableJpaAuditing
public class RailfanArchiveApplication {
    public static void main(String[] args) {
        SpringApplication.run(RailfanArchiveApplication.class, args);
    }
}
