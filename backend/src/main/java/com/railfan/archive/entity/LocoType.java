package com.railfan.archive.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Reference table: locomotive types (WAP-7, WAP-5, WAG-9, WDG-4, etc.)
 * Includes traction type: ELECTRIC, DIESEL, DUAL
 */
@Entity
@Table(name = "loco_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LocoType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    /** ELECTRIC, DIESEL, or DUAL */
    @Column(length = 20)
    private String traction;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
