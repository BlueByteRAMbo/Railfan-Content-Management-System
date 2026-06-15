package com.railfan.archive.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Reference table: locomotive sheds
 * Examples: Itarsi ELS, Bhusawal ELS, Kalyan ELS, Erode ELS
 */
@Entity
@Table(name = "loco_sheds")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LocoShed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 50)
    private String zone;

    @Column(length = 150)
    private String location;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
