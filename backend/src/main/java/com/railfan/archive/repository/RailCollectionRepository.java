package com.railfan.archive.repository;

import com.railfan.archive.entity.RailCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RailCollectionRepository extends JpaRepository<RailCollection, Long> {
    Optional<RailCollection> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
