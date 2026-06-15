package com.railfan.archive.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Collection entity for grouping related videos.
 * Named "RailCollection" to avoid collision with java.util.Collection.
 *
 * Default collections seeded: Rajdhani Collection, Duronto Collection,
 * Vande Bharat Collection, Freight Collection, KAVACH Collection, etc.
 */
@Entity
@Table(name = "collections")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RailCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Base64 encoded cover image for the collection */
    @Column(columnDefinition = "TEXT")
    private String coverThumbnail;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @ManyToMany(mappedBy = "collections", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Video> videos = new HashSet<>();
}
