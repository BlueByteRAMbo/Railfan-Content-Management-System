package com.railfan.archive.entity;

import com.railfan.archive.enums.SecondaryLocoRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "secondary_locos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SecondaryLoco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(length = 20)
    private String locoNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loco_type_id")
    private LocoType locoType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loco_shed_id")
    private LocoShed locoShed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SecondaryLocoRole role;

    // Helper to manage bi-directional sync (if needed, though we usually set on Video side)
}
