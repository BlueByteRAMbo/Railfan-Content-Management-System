package com.railfan.archive.repository;

import com.railfan.archive.entity.ExpectedLocoConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.railfan.archive.entity.User;
import java.util.List;

public interface ExpectedLocoConfigRepository extends JpaRepository<ExpectedLocoConfig, Long> {
    Optional<ExpectedLocoConfig> findByTrainNumberAndUser(String trainNumber, User user);
    List<ExpectedLocoConfig> findAllByUser(User user);
}
