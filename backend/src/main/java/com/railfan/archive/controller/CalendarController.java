package com.railfan.archive.controller;

import com.railfan.archive.dto.response.VideoSummaryResponse;
import com.railfan.archive.service.VideoService;
import com.railfan.archive.enums.UploadStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Calendar feature endpoints to fetch specific videos for a given month.
 */
@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final VideoService videoService;

    @GetMapping("/recording")
    public ResponseEntity<List<VideoSummaryResponse>> getRecordingEvents(
        @RequestParam int year,
        @RequestParam int month
    ) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        
        // Fetch max 500 for a single month view to prevent overload
        return ResponseEntity.ok(
            videoService.findAll(null, null, null, null, null, null, null, null, null, null,
                start, end, null, null, null, null,
                PageRequest.of(0, 500, Sort.by(Sort.Direction.ASC, "recordingDate"))
            ).getContent()
        );
    }

    @GetMapping("/upload")
    public ResponseEntity<List<VideoSummaryResponse>> getUploadEvents(
        @RequestParam int year,
        @RequestParam int month
    ) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        
        return ResponseEntity.ok(
            videoService.findAll(null, UploadStatus.UPLOADED, null, null, null, null, null, null, null, null,
                null, null, start, end, null, null,
                PageRequest.of(0, 500, Sort.by(Sort.Direction.ASC, "uploadDate"))
            ).getContent()
        );
    }
}
