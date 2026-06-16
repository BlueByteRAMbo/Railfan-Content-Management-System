package com.railfan.archive.repository;

import com.railfan.archive.entity.Station;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    Optional<Station> findByNameIgnoreCase(String name);
    Optional<Station> findByStationCodeIgnoreCase(String code);
    List<Station> findByNameStartingWithIgnoreCaseOrderByNameAsc(String prefix);
    List<Station> findByRailwayZoneIgnoreCaseOrderByNameAsc(String zone);
    boolean existsByStationCode(String stationCode);

    @Query("SELECT s FROM Station s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.stationCode) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY s.name ASC")
    List<Station> searchByNameOrCode(@Param("q") String q, Pageable pageable);
}

