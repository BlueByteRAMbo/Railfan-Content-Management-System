package com.railfan.archive.service;

import com.railfan.archive.dto.response.DashboardChartsResponse;
import com.railfan.archive.dto.response.DashboardChartsResponse.MonthlyPoint;
import com.railfan.archive.dto.response.DashboardChartsResponse.CategoryPoint;
import com.railfan.archive.dto.response.DashboardStatsResponse;
import com.railfan.archive.dto.response.VideoSummaryResponse;
import com.railfan.archive.enums.UploadStatus;
import com.railfan.archive.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Dashboard service — aggregates statistics and chart data.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final VideoRepository videoRepository;
    private final DuplicateAlertRepository duplicateAlertRepository;
    private final VideoService videoService;

    /** All stat card values */
    public DashboardStatsResponse getStats() {
        LocalDate now = LocalDate.now();

        return DashboardStatsResponse.builder()
            .totalVideos(videoRepository.countByIsDeletedFalse())
            .uploadedVideos(videoRepository.countByUploadStatusAndIsDeletedFalse(UploadStatus.UPLOADED))
            .pendingVideos(videoRepository.countByUploadStatusAndIsDeletedFalse(UploadStatus.PENDING_UPLOAD))
            .scheduledVideos(videoRepository.countByUploadStatusAndIsDeletedFalse(UploadStatus.SCHEDULED_UPLOAD))
            .archivedVideos(videoRepository.countByUploadStatusAndIsDeletedFalse(UploadStatus.ARCHIVED))
            .totalStorageBytes(videoRepository.sumFileSizeBytes())
            .totalDurationSeconds(videoRepository.sumDurationSeconds())
            .averageDurationSeconds(videoRepository.avgDurationSeconds())
            .videosRecordedThisMonth(videoRepository.countRecordedInMonth(now.getYear(), now.getMonthValue()))
            .videosUploadedThisMonth(videoRepository.countUploadedInMonth(now.getYear(), now.getMonthValue()))
            .unresolvedDuplicates(duplicateAlertRepository.countByResolvedFalse())
            .build();
    }

    /** All chart data for the last 12 months */
    public DashboardChartsResponse getCharts() {
        LocalDate twelveMonthsAgo = LocalDate.now().minusMonths(12).withDayOfMonth(1);

        // Monthly recordings
        List<Object[]> recRows  = videoRepository.countRecordingsByMonthSince(twelveMonthsAgo);
        List<Object[]> uplRows  = videoRepository.countUploadsByMonthSince(twelveMonthsAgo);
        List<Object[]> locoRows = videoRepository.findMostRecordedLocos(PageRequest.of(0, 10));

        // Loco type distribution
        List<CategoryPoint> locoTypeDist = buildLocoTypeDistribution();
        List<CategoryPoint> shedDist     = buildShedDistribution();
        List<CategoryPoint> catDist      = buildTrainCategoryDistribution();

        return DashboardChartsResponse.builder()
            .recordingsPerMonth(toMonthlyPoints(recRows))
            .uploadsPerMonth(toMonthlyPoints(uplRows))
            .locoTypeDistribution(locoTypeDist)
            .shedDistribution(shedDist)
            .trainCategoryDistribution(catDist)
            .build();
    }

    /** 10 most recently added videos */
    public List<VideoSummaryResponse> getRecentVideos() {
        return videoRepository
            .findAll(PageRequest.of(0, 10,
                org.springframework.data.domain.Sort.by("createdAt").descending()))
            .getContent()
            .stream()
            .filter(v -> !v.getIsDeleted())
            .map(videoService::toSummary)
            .toList();
    }

    // ── private helpers ───────────────────────────────────────

    private List<MonthlyPoint> toMonthlyPoints(List<Object[]> rows) {
        List<MonthlyPoint> points = new ArrayList<>();
        for (Object[] row : rows) {
            int year  = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            long cnt  = ((Number) row[2]).longValue();
            String label = Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year;
            points.add(MonthlyPoint.builder()
                .year(year).month(month).label(label).count(cnt).build());
        }
        return points;
    }

    private List<CategoryPoint> buildLocoTypeDistribution() {
        return videoRepository.findMostRecordedLocoTypes(PageRequest.of(0, 15))
            .stream()
            .map(r -> CategoryPoint.builder()
                .name((String) r[0])
                .count(((Number) r[1]).longValue())
                .build())
            .toList();
    }

    private List<CategoryPoint> buildShedDistribution() {
        return videoRepository.findMostRecordedTrains(PageRequest.of(0, 10))
            .stream()
            .map(r -> CategoryPoint.builder()
                .name((String) r[0])
                .count(((Number) r[1]).longValue())
                .build())
            .toList();
    }

    private List<CategoryPoint> buildTrainCategoryDistribution() {
        return videoRepository.countByTrainCategory(PageRequest.of(0, 15))
            .stream()
            .map(r -> CategoryPoint.builder()
                .name((String) r[0])
                .count(((Number) r[1]).longValue())
                .build())
            .toList();
    }
}
