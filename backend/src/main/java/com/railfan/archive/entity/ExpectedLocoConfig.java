package com.railfan.archive.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "expected_loco_config")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpectedLocoConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String trainNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expected_loco_type_id", nullable = false)
    private LocoType expectedLocoType;
}
