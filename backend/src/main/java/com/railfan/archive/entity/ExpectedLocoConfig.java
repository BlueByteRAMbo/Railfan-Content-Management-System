package com.railfan.archive.entity;

import jakarta.persistence.*;
import lombok.*;
import com.railfan.archive.entity.User;

@Entity
@Table(name = "expected_loco_config", uniqueConstraints = {
    @UniqueConstraint(name = "uq_config_user_train", columnNames = {"user_id", "train_number"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpectedLocoConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String trainNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expected_loco_type_id", nullable = false)
    private LocoType expectedLocoType;
}
