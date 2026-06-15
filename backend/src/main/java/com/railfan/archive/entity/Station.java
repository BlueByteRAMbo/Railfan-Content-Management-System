package com.railfan.archive.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Reference table: railway stations
 * Examples: Shahad, Kalyan, Dadar, Mumbra, Palasdhari, Khardi
 */
@Entity
@Table(name = "stations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String name;

    @Column(length = 10)
    private String stationCode;

    @Column(length = 100)
    private String state;

    @Column(length = 50)
    private String railwayZone;
}
