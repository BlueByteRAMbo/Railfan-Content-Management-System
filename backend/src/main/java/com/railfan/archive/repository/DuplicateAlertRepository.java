package com.railfan.archive.repository;

import com.railfan.archive.entity.DuplicateAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DuplicateAlertRepository extends JpaRepository<DuplicateAlert, Long> {
    List<DuplicateAlert> findByResolvedFalseOrderByCreatedAtDesc();
    List<DuplicateAlert> findByVideoIdAndResolvedFalse(Long videoId);
    long countByResolvedFalse();
}
