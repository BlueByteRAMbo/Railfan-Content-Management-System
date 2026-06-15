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
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImportExportService {

    private final VideoRepository videoRepository;
    private final VideoService videoService; // to re-use create logic

    // ── EXPORT ──────────────────────────────────────────────────

    private List<Video> fetchExportData(
        String q, UploadStatus uploadStatus, Priority priority,
        String trainNumber, String trainName, String locoNumber,
        Long locoTypeId, Long locoShedId, Long trainCategoryId,
        Long stationId, LocalDate recordingDateFrom, LocalDate recordingDateTo,
        LocalDate uploadDateFrom, LocalDate uploadDateTo,
        Boolean kavachFitted, Long collectionId
    ) {
        Specification<Video> spec = VideoSpecification.build(
            q, uploadStatus, priority, trainNumber, trainName, locoNumber,
            locoTypeId, locoShedId, trainCategoryId, stationId,
            recordingDateFrom, recordingDateTo, uploadDateFrom, uploadDateTo,
            kavachFitted, collectionId
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

            String[] header = lines.get(0); // Optional: parse headers for mapping, but we assume a fixed format for now:
            // Title(0), RecordingDate(1), Status(2), TrainNo(3), TrainName(4), LocoNo(5)

            for (int i = 1; i < lines.size(); i++) {
                String[] row = lines.get(i);
                if (row.length < 2) continue; // Minimum Title and Date
                
                VideoCreateRequest req = new VideoCreateRequest();
                req.setTitle(row[0]);
                req.setRecordingDate(LocalDate.parse(row[1]));
                req.setUploadStatus(row.length > 2 && !row[2].isBlank() ? UploadStatus.valueOf(row[2]) : UploadStatus.PENDING_UPLOAD);
                if (row.length > 3) req.setTrainNumber(row[3]);
                if (row.length > 4) req.setTrainName(row[4]);
                if (row.length > 5) req.setLocoNumber(row[5]);
                
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
