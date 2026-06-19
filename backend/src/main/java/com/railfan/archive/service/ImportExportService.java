package com.railfan.archive.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.railfan.archive.dto.request.VideoCreateRequest;
import com.railfan.archive.entity.Video;
import com.railfan.archive.enums.Priority;
import com.railfan.archive.enums.UploadStatus;
import com.railfan.archive.repository.VideoRepository;
import com.railfan.archive.util.VideoSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImportExportService {

    private final VideoRepository videoRepository;
    private final VideoService videoService; // to re-use create logic
    private final com.railfan.archive.repository.UserRepository userRepository;

    private com.railfan.archive.entity.User getCurrentUser() {
        org.springframework.security.core.Authentication auth =
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.security.authentication.BadCredentialsException("Not authenticated");
        }
        String username = auth.getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + username));
    }

    // ── EXPORT ──────────────────────────────────────────────────

    private List<Video> fetchExportData(
        String q, UploadStatus uploadStatus, Priority priority,
        String trainNumber, String trainName, String locoNumber,
        Long locoTypeId, Long locoShedId, Long trainCategoryId,
        Long stationId, LocalDate recordingDateFrom, LocalDate recordingDateTo,
        LocalDate uploadDateFrom, LocalDate uploadDateTo,
        Boolean kavachFitted, Long collectionId
    ) {
        com.railfan.archive.entity.User currentUser = getCurrentUser();
        Specification<Video> spec = VideoSpecification.build(
            q, uploadStatus, priority, trainNumber, trainName, locoNumber,
            locoTypeId, locoShedId, trainCategoryId, stationId,
            recordingDateFrom, recordingDateTo, uploadDateFrom, uploadDateTo,
            kavachFitted, collectionId, currentUser.getId()
        );
        return videoRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "recordingDate"));
    }

    @Transactional(readOnly = true)
    public byte[] exportCsv(
        String q, UploadStatus uploadStatus, Priority priority,
        String trainNumber, String trainName, String locoNumber,
        Long locoTypeId, Long locoShedId, Long trainCategoryId,
        Long stationId, LocalDate recordingDateFrom, LocalDate recordingDateTo,
        LocalDate uploadDateFrom, LocalDate uploadDateTo,
        Boolean kavachFitted, Long collectionId
    ) throws Exception {
        List<Video> videos = fetchExportData(
            q, uploadStatus, priority, trainNumber, trainName, locoNumber,
            locoTypeId, locoShedId, trainCategoryId, stationId,
            recordingDateFrom, recordingDateTo, uploadDateFrom, uploadDateTo, kavachFitted, collectionId
        );

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos))) {
            writer.writeNext(new String[]{"ID", "Title", "Recording Date", "Status", "Train No", "Train Name", "Loco No"});
            for (Video v : videos) {
                writer.writeNext(new String[]{
                    String.valueOf(v.getId()),
                    v.getTitle(),
                    v.getRecordingDate() != null ? v.getRecordingDate().toString() : "",
                    v.getUploadStatus() != null ? v.getUploadStatus().name() : "",
                    v.getTrainNumber() != null ? v.getTrainNumber() : "",
                    v.getTrainName() != null ? v.getTrainName() : "",
                    v.getLocoNumber() != null ? v.getLocoNumber() : ""
                });
            }
        }
        return baos.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] exportExcel(
        String q, UploadStatus uploadStatus, Priority priority,
        String trainNumber, String trainName, String locoNumber,
        Long locoTypeId, Long locoShedId, Long trainCategoryId,
        Long stationId, LocalDate recordingDateFrom, LocalDate recordingDateTo,
        LocalDate uploadDateFrom, LocalDate uploadDateTo,
        Boolean kavachFitted, Long collectionId
    ) throws Exception {
        List<Video> videos = fetchExportData(
            q, uploadStatus, priority, trainNumber, trainName, locoNumber,
            locoTypeId, locoShedId, trainCategoryId, stationId,
            recordingDateFrom, recordingDateTo, uploadDateFrom, uploadDateTo, kavachFitted, collectionId
        );

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Videos");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("ID");
            header.createCell(1).setCellValue("Title");
            header.createCell(2).setCellValue("Recording Date");
            header.createCell(3).setCellValue("Status");
            header.createCell(4).setCellValue("Train No");
            header.createCell(5).setCellValue("Train Name");
            header.createCell(6).setCellValue("Loco No");

            int rowIdx = 1;
            for (Video v : videos) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(v.getId() != null ? String.valueOf(v.getId()) : "");
                row.createCell(1).setCellValue(v.getTitle() != null ? v.getTitle() : "");
                row.createCell(2).setCellValue(v.getRecordingDate() != null ? v.getRecordingDate().toString() : "");
                row.createCell(3).setCellValue(v.getUploadStatus() != null ? v.getUploadStatus().name() : "");
                row.createCell(4).setCellValue(v.getTrainNumber() != null ? v.getTrainNumber() : "");
                row.createCell(5).setCellValue(v.getTrainName() != null ? v.getTrainName() : "");
                row.createCell(6).setCellValue(v.getLocoNumber() != null ? v.getLocoNumber() : "");
            }
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    @Transactional(readOnly = true)
    public byte[] exportPdf(
        String q, UploadStatus uploadStatus, Priority priority,
        String trainNumber, String trainName, String locoNumber,
        Long locoTypeId, Long locoShedId, Long trainCategoryId,
        Long stationId, LocalDate recordingDateFrom, LocalDate recordingDateTo,
        LocalDate uploadDateFrom, LocalDate uploadDateTo,
        Boolean kavachFitted, Long collectionId
    ) throws Exception {
        List<Video> videos = fetchExportData(
            q, uploadStatus, priority, trainNumber, trainName, locoNumber,
            locoTypeId, locoShedId, trainCategoryId, stationId,
            recordingDateFrom, recordingDateTo, uploadDateFrom, uploadDateTo, kavachFitted, collectionId
        );

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {

            document.add(new Paragraph("Railfan Archive Manager - Video Export").setFontSize(18).setBold());
            document.add(new Paragraph("Total Records: " + videos.size()).setMarginBottom(10));

            Table table = new Table(new float[]{1, 3, 2, 2, 2});
            table.addHeaderCell(new Cell().add(new Paragraph("ID").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Title").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Date").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Status").setBold()));
            table.addHeaderCell(new Cell().add(new Paragraph("Train/Loco").setBold()));

            for (Video v : videos) {
                table.addCell(String.valueOf(v.getId()));
                table.addCell(v.getTitle() != null ? v.getTitle() : "");
                table.addCell(v.getRecordingDate() != null ? v.getRecordingDate().toString() : "");
                table.addCell(v.getUploadStatus() != null ? v.getUploadStatus().name() : "");
                String tl = (v.getTrainNumber() != null ? v.getTrainNumber() : "") + " " +
                            (v.getLocoNumber() != null ? v.getLocoNumber() : "");
                table.addCell(tl.trim());
            }

            document.add(table);
        }
        return baos.toByteArray();
    }

    // ── IMPORT ──────────────────────────────────────────────────

    @Transactional
    public int importCsv(MultipartFile file) throws Exception {
        int count = 0;
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {

            List<String[]> lines = csvReader.readAll();
            if (lines.isEmpty()) return 0;

            String[] header = lines.get(0);
            boolean isGoogleTakeout = header.length > 9 && header[0].trim().equalsIgnoreCase("Video ID");

            int titleIdx = isGoogleTakeout ? 5 : 0;
            int dateIdx = isGoogleTakeout ? 9 : 1;
            int statusIdx = isGoogleTakeout ? -1 : 2;
            int trainNoIdx = isGoogleTakeout ? -1 : 3;
            int trainNameIdx = isGoogleTakeout ? -1 : 4;
            int locoNoIdx = isGoogleTakeout ? -1 : 5;

            for (int i = 1; i < lines.size(); i++) {
                String[] row = lines.get(i);
                if (row.length <= Math.max(titleIdx, dateIdx)) continue;
                
                String title = row[titleIdx];
                String rawDateStr = row[dateIdx];
                if (title == null || title.isBlank() || rawDateStr == null || rawDateStr.isBlank()) continue;

                String dateStr = rawDateStr;
                String timeStr = "12:00:00"; // Default time if missing

                // Handle Google Takeout ISO Timestamp "2024-10-12T11:40:00..."
                if (isGoogleTakeout && rawDateStr.contains("T")) {
                    dateStr = rawDateStr.substring(0, rawDateStr.indexOf("T"));
                    String afterT = rawDateStr.substring(rawDateStr.indexOf("T") + 1);
                    if (afterT.length() >= 8) {
                        timeStr = afterT.substring(0, 8); // Extract HH:mm:ss
                    }
                }

                VideoCreateRequest req = new VideoCreateRequest();
                req.setTitle(title);
                req.setRecordingDate(LocalDate.parse(dateStr));
                
                if (isGoogleTakeout) {
                    req.setUploadStatus(UploadStatus.UPLOADED);
                    req.setUploadDate(LocalDate.parse(dateStr));
                    req.setUploadTime(LocalTime.parse(timeStr));
                    req.setYoutubeVideoId(row[0]); // Save original Video ID
                } else {
                    req.setUploadStatus(statusIdx >= 0 && row.length > statusIdx && !row[statusIdx].isBlank() 
                        ? UploadStatus.valueOf(row[statusIdx]) 
                        : UploadStatus.PENDING_UPLOAD);
                    if (trainNoIdx >= 0 && row.length > trainNoIdx) req.setTrainNumber(row[trainNoIdx]);
                    if (trainNameIdx >= 0 && row.length > trainNameIdx) req.setTrainName(row[trainNameIdx]);
                    if (locoNoIdx >= 0 && row.length > locoNoIdx) req.setLocoNumber(row[locoNoIdx]);
                }
                
                req.setPriority(Priority.MEDIUM);
                videoService.create(req);
                count++;
            }
        }
        log.info("Imported {} videos from CSV", count);
        return count;
    }

    @Transactional
    public int importExcel(MultipartFile file) throws Exception {
        int count = 0;
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || row.getCell(0) == null) continue;

                String title = row.getCell(0).getStringCellValue();
                org.apache.poi.ss.usermodel.Cell dateCell = row.getCell(1);
                LocalDate date = null;
                if (dateCell != null) {
                    if (dateCell.getCellType() == CellType.STRING) {
                        date = LocalDate.parse(dateCell.getStringCellValue());
                    } else if (DateUtil.isCellDateFormatted(dateCell)) {
                        date = LocalDate.ofInstant(dateCell.getDateCellValue().toInstant(), java.time.ZoneId.systemDefault());
                    }
                }
                
                if (title == null || title.isBlank() || date == null) continue;

                VideoCreateRequest req = new VideoCreateRequest();
                req.setTitle(title);
                req.setRecordingDate(date);
                
                org.apache.poi.ss.usermodel.Cell statusCell = row.getCell(2);
                req.setUploadStatus(statusCell != null && statusCell.getCellType() == CellType.STRING 
                    ? UploadStatus.valueOf(statusCell.getStringCellValue()) 
                    : UploadStatus.PENDING_UPLOAD);

                org.apache.poi.ss.usermodel.Cell tnCell = row.getCell(3);
                if (tnCell != null && tnCell.getCellType() == CellType.STRING) req.setTrainNumber(tnCell.getStringCellValue());

                org.apache.poi.ss.usermodel.Cell tnmCell = row.getCell(4);
                if (tnmCell != null && tnmCell.getCellType() == CellType.STRING) req.setTrainName(tnmCell.getStringCellValue());

                org.apache.poi.ss.usermodel.Cell lnCell = row.getCell(5);
                if (lnCell != null && lnCell.getCellType() == CellType.STRING) req.setLocoNumber(lnCell.getStringCellValue());

                req.setPriority(Priority.MEDIUM);
                videoService.create(req);
                count++;
            }
        }
        log.info("Imported {} videos from Excel", count);
        return count;
    }
}
