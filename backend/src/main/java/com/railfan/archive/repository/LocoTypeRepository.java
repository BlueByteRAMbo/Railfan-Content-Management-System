package com.railfan.archive.repository;

import com.railfan.archive.entity.LocoType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocoTypeRepository extends JpaRepository<LocoType, Long> {
    Optional<LocoType> findByNameIgnoreCase(String name);
    List<LocoType> findByTractionIgnoreCase(String traction);
}
