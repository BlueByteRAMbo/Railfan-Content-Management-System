package com.railfan.archive.controller;

import com.railfan.archive.enums.Priority;
import com.railfan.archive.enums.UploadStatus;
import com.railfan.archive.service.ImportExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

/**
 * Controller for importing and exporting data.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ImportExportController {

    private final ImportExportService importExportService;

    // ── Exports ────────────────────────────────────────────────

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) UploadStatus uploadStatus,
        @RequestParam(required = false) Priority priority,
        @RequestParam(required = false) String trainNumber,
        @RequestParam(required = false) String trainName,
        @RequestParam(required = false) String locoNumber,
        @RequestParam(required = false) Long locoTypeId,
        @RequestParam(required = false) Long locoShedId,
        @RequestParam(required = false) Long trainCategoryId,
        @RequestParam(required = false) Long stationId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordingDateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordingDateTo,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate uploadDateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate uploadDateTo,
        @RequestParam(required = false) Boolean kavachFitted,
        @RequestParam(required = false) Long collectionId
    ) throws Exception {
        byte[] data = importExportService.exportCsv(
            q, uploadStatus, priority, trainNumber, trainName, locoNumber,
            locoTypeId, locoShedId, trainCategoryId, stationId,
            recordingDateFrom, recordingDateTo, uploadDateFrom, uploadDateTo, kavachFitted, collectionId
        );
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"videos.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(data);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) UploadStatus uploadStatus,
        @RequestParam(required = false) Priority priority,
        @RequestParam(required = false) String trainNumber,
        @RequestParam(required = false) String trainName,
        @RequestParam(required = false) String locoNumber,
        @RequestParam(required = false) Long locoTypeId,
        @RequestParam(required = false) Long locoShedId,
        @RequestParam(required = false) Long trainCategoryId,
        @RequestParam(required = false) Long stationId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordingDateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordingDateTo,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate uploadDateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate uploadDateTo,
        @RequestParam(required = false) Boolean kavachFitted,
        @RequestParam(required = false) Long collectionId
    ) throws Exception {
        byte[] data = importExportService.exportExcel(
            q, uploadStatus, priority, trainNumber, trainName, locoNumber,
            locoTypeId, locoShedId, trainCategoryId, stationId,
            recordingDateFrom, recordingDateTo, uploadDateFrom, uploadDateTo, kavachFitted, collectionId
        );
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"videos.xlsx\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(data);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) UploadStatus uploadStatus,
        @RequestParam(required = false) Priority priority,
        @RequestParam(required = false) String trainNumber,
        @RequestParam(required = false) String trainName,
        @RequestParam(required = false) String locoNumber,
        @RequestParam(required = false) Long locoTypeId,
        @RequestParam(required = false) Long locoShedId,
        @RequestParam(required = false) Long trainCategoryId,
        @RequestParam(required = false) Long stationId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordingDateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordingDateTo,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate uploadDateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate uploadDateTo,
        @RequestParam(required = false) Boolean kavachFitted,
        @RequestParam(required = false) Long collectionId
    ) throws Exception {
        byte[] data = importExportService.exportPdf(
            q, uploadStatus, priority, trainNumber, trainName, locoNumber,
            locoTypeId, locoShedId, trainCategoryId, stationId,
            recordingDateFrom, recordingDateTo, uploadDateFrom, uploadDateTo, kavachFitted, collectionId
        );
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"videos.pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(data);
    }

    // ── Imports ────────────────────────────────────────────────

    @PostMapping("/import/csv")
    public ResponseEntity<Map<String, String>> importCsv(@RequestParam("file") MultipartFile file) throws Exception {
        int count = importExportService.importCsv(file);
        return ResponseEntity.ok(Map.of("message", "Imported " + count + " videos successfully"));
    }

    @PostMapping("/import/excel")
    public ResponseEntity<Map<String, String>> importExcel(@RequestParam("file") MultipartFile file) throws Exception {
        int count = importExportService.importExcel(file);
        return ResponseEntity.ok(Map.of("message", "Imported " + count + " videos successfully"));
    }
}
