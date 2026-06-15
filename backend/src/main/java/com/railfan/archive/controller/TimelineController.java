package com.railfan.archive.controller;

import com.railfan.archive.dto.response.TimelineMonthResponse;
import com.railfan.archive.dto.response.VideoSummaryResponse;
import com.railfan.archive.service.TimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Timeline feature endpoints.
 */
@RestController
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    @GetMapping("/recording")
    public ResponseEntity<List<TimelineMonthResponse>> getRecordingTimeline(
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) Integer month
    ) {
        return ResponseEntity.ok(timelineService.getRecordingTimeline(year, month));
    }

    @GetMapping("/upload")
    public ResponseEntity<List<TimelineMonthResponse>> getUploadTimeline(
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) Integer month
    ) {
        return ResponseEntity.ok(timelineService.getUploadTimeline(year, month));
    }
}
