package com.railfan.archive.controller;

import com.railfan.archive.entity.*;
import com.railfan.archive.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Reference data endpoints for populating dropdowns in the frontend.
 *
 * GET  /api/reference/train-categories
 * GET  /api/reference/loco-types
 * GET  /api/reference/loco-sheds?q=
 * GET  /api/reference/stations?q=
 * POST /api/reference/loco-sheds   → quick-create a new shed
 * POST /api/reference/stations     → quick-create a new station
 */
@RestController
@RequestMapping("/api/reference")
@RequiredArgsConstructor
public class ReferenceDataController {

    private final TrainCategoryRepository trainCategoryRepository;
    private final LocoTypeRepository locoTypeRepository;
    private final LocoShedRepository locoShedRepository;
    private final StationRepository stationRepository;

    @GetMapping("/train-categories")
    @Cacheable("referenceData_trainCategories")
    public ResponseEntity<List<TrainCategory>> getTrainCategories() {
        return ResponseEntity.ok(trainCategoryRepository.findAll(
            org.springframework.data.domain.Sort.by("name")));
    }

    @GetMapping("/loco-types")
    @Cacheable("referenceData_locoTypes")
    public ResponseEntity<List<LocoType>> getLocoTypes() {
        return ResponseEntity.ok(locoTypeRepository.findAll(
            org.springframework.data.domain.Sort.by("name")));
    }

    @GetMapping("/loco-sheds")
    @Cacheable(value = "referenceData_locoSheds", key = "#q")
    public ResponseEntity<List<LocoShed>> getLocoSheds(
        @RequestParam(required = false, defaultValue = "") String q
    ) {
        if (q.isBlank()) {
            return ResponseEntity.ok(locoShedRepository.findAll(
                org.springframework.data.domain.Sort.by("name")));
        }
        return ResponseEntity.ok(
            locoShedRepository.findByNameStartingWithIgnoreCaseOrderByNameAsc(q)
        );
    }

    @GetMapping("/stations")
    public ResponseEntity<List<Station>> getStations(
        @RequestParam(required = false, defaultValue = "") String q,
        @RequestParam(defaultValue = "20") int limit
    ) {
        if (q.isBlank()) {
            // Return nothing when no query — frontend should prompt user to type
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(
            stationRepository.searchByNameOrCode(q, PageRequest.of(0, limit))
        );
    }

    @PostMapping("/loco-sheds")
    @CacheEvict(value = "referenceData_locoSheds", allEntries = true)
    public ResponseEntity<LocoShed> createLocoShed(@RequestBody Map<String, String> body) {
        LocoShed shed = new LocoShed();
        shed.setName(body.get("name"));
        shed.setZone(body.get("zone"));
        shed.setLocation(body.get("location"));
        return ResponseEntity.status(HttpStatus.CREATED).body(locoShedRepository.save(shed));
    }

    @PostMapping("/stations")
    @CacheEvict(value = "referenceData_stations", allEntries = true)
    public ResponseEntity<Station> createStation(@RequestBody Map<String, String> body) {
        Station station = new Station();
        station.setName(body.get("name"));
        station.setStationCode(body.get("stationCode"));
        station.setState(body.get("state"));
        station.setRailwayZone(body.get("railwayZone"));
        return ResponseEntity.status(HttpStatus.CREATED).body(stationRepository.save(station));
    }
}
