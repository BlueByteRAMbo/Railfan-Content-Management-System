package com.railfan.archive.repository;

import com.railfan.archive.entity.TrainCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TrainCategoryRepository extends JpaRepository<TrainCategory, Long> {
    Optional<TrainCategory> findByNameIgnoreCase(String name);
}
