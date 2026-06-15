package com.railfan.archive.controller;

import com.railfan.archive.dto.response.DashboardChartsResponse;
import com.railfan.archive.dto.response.DashboardStatsResponse;
import com.railfan.archive.dto.response.VideoSummaryResponse;
import com.railfan.archive.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Dashboard data endpoints.
 *
 * GET /api/dashboard/stats   → all stat card values
 * GET /api/dashboard/charts  → all chart datasets
 * GET /api/dashboard/recent  → 10 most recent videos
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/charts")
    public ResponseEntity<DashboardChartsResponse> getCharts() {
        return ResponseEntity.ok(dashboardService.getCharts());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<VideoSummaryResponse>> getRecent() {
        return ResponseEntity.ok(dashboardService.getRecentVideos());
    }
}
