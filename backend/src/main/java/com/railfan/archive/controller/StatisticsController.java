package com.railfan.archive.controller;

import com.railfan.archive.dto.response.StatCountResponse;
import com.railfan.archive.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Statistics endpoints for the deep stats view.
 */
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/most-recorded-trains")
    public ResponseEntity<List<StatCountResponse>> getMostRecordedTrains(
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(statisticsService.getMostRecordedTrains(limit));
    }

    @GetMapping("/most-recorded-locos")
    public ResponseEntity<List<StatCountResponse>> getMostRecordedLocos(
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(statisticsService.getMostRecordedLocos(limit));
    }

    @GetMapping("/most-recorded-sheds")
    public ResponseEntity<List<StatCountResponse>> getMostRecordedSheds(
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(statisticsService.getMostRecordedSheds(limit));
    }

    @GetMapping("/most-recorded-stations")
    public ResponseEntity<List<StatCountResponse>> getMostRecordedStations(
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(statisticsService.getMostRecordedStations(limit));
    }
}
