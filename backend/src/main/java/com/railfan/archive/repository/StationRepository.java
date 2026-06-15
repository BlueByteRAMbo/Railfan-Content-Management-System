package com.railfan.archive.repository;

import com.railfan.archive.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    Optional<Station> findByNameIgnoreCase(String name);
    Optional<Station> findByStationCodeIgnoreCase(String code);
    List<Station> findByNameStartingWithIgnoreCaseOrderByNameAsc(String prefix);
    List<Station> findByRailwayZoneIgnoreCaseOrderByNameAsc(String zone);
}
