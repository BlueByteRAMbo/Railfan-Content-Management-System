package com.railfan.archive.repository;

import com.railfan.archive.entity.ExpectedLocoConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ExpectedLocoConfigRepository extends JpaRepository<ExpectedLocoConfig, Long> {
    Optional<ExpectedLocoConfig> findByTrainNumber(String trainNumber);
}
