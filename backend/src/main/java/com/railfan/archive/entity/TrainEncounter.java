package com.railfan.archive.entity;

import com.railfan.archive.enums.EncounterType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "train_encounters")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TrainEncounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EncounterType encounterType;

    @Column(length = 10)
    private String trainNumber;

    @Column(length = 200)
    private String trainName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_category_id")
    private TrainCategory trainCategory;

    @Column(length = 20)
    private String locoNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loco_type_id")
    private LocoType locoType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loco_shed_id")
    private LocoShed locoShed;
}
