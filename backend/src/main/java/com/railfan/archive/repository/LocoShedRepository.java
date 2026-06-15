package com.railfan.archive.repository;

import com.railfan.archive.entity.LocoShed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocoShedRepository extends JpaRepository<LocoShed, Long> {
    Optional<LocoShed> findByNameIgnoreCase(String name);
    List<LocoShed> findByZoneIgnoreCase(String zone);
    List<LocoShed> findByNameStartingWithIgnoreCaseOrderByNameAsc(String prefix);
}
