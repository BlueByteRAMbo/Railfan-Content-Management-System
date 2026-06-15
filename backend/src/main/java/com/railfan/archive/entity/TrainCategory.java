package com.railfan.archive.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Reference table: train categories (Rajdhani, Duronto, Freight, etc.)
 * Seeded via V2 Flyway migration.
 */
@Entity
@Table(name = "train_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
