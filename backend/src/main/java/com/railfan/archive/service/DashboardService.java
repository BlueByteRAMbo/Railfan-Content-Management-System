package com.railfan.archive.service;

import com.railfan.archive.dto.response.DashboardChartsResponse;
import com.railfan.archive.dto.response.DashboardChartsResponse.MonthlyPoint;
import com.railfan.archive.dto.response.DashboardChartsResponse.CategoryPoint;
import com.railfan.archive.dto.response.DashboardStatsResponse;
import com.railfan.archive.dto.response.VideoSummaryResponse;
import com.railfan.archive.entity.User;
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
    private final UserRepository userRepository;
    private final DuplicateAlertRepository duplicateAlertRepository;
    private final VideoService videoService;

    private User getCurrentUser() {
        org.springframework.security.core.Authentication auth =
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.security.authentication.BadCredentialsException("Not authenticated");
        }
        String username = auth.getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + username));
    }

    /** All stat card values */
    public DashboardStatsResponse getStats() {
        LocalDate now = LocalDate.now();
        User currentUser = getCurrentUser();

        return DashboardStatsResponse.builder()
            .totalVideos(videoRepository.countByUserAndIsDeletedFalse(currentUser))
            .uploadedVideos(videoRepository.countByUploadStatusAndUserAndIsDeletedFalse(UploadStatus.UPLOADED, currentUser))
            .pendingVideos(videoRepository.countByUploadStatusAndUserAndIsDeletedFalse(UploadStatus.PENDING_UPLOAD, currentUser))
            .scheduledVideos(videoRepository.countByUploadStatusAndUserAndIsDeletedFalse(UploadStatus.SCHEDULED_UPLOAD, currentUser))
            .archivedVideos(videoRepository.countByUploadStatusAndUserAndIsDeletedFalse(UploadStatus.ARCHIVED, currentUser))
            .totalStorageBytes(videoRepository.sumFileSizeBytes(currentUser))
            .totalDurationSeconds(videoRepository.sumDurationSeconds(currentUser))
            .averageDurationSeconds(videoRepository.avgDurationSeconds(currentUser))
            .videosRecordedThisMonth(videoRepository.countRecordedInMonth(now.getYear(), now.getMonthValue(), currentUser))
            .videosUploadedThisMonth(videoRepository.countUploadedInMonth(now.getYear(), now.getMonthValue(), currentUser))
            .unresolvedDuplicates(duplicateAlertRepository.countByResolvedFalseAndUser(currentUser))
            .build();
    }

    /** All chart data for the last 12 months */
    public DashboardChartsResponse getCharts() {
        LocalDate twelveMonthsAgo = LocalDate.now().minusMonths(12).withDayOfMonth(1);
        User currentUser = getCurrentUser();

        // Monthly recordings
        List<Object[]> recRows  = videoRepository.countRecordingsByMonthSince(twelveMonthsAgo, currentUser);
        List<Object[]> uplRows  = videoRepository.countUploadsByMonthSince(twelveMonthsAgo, currentUser);

        // Loco type distribution
        List<CategoryPoint> locoTypeDist = buildLocoTypeDistribution(currentUser);
        List<CategoryPoint> shedDist     = buildShedDistribution(currentUser);
        List<CategoryPoint> catDist      = buildTrainCategoryDistribution(currentUser);
        List<CategoryPoint> zoneDist     = buildRailwayZoneDistribution(currentUser);

        return DashboardChartsResponse.builder()
            .recordingsPerMonth(toMonthlyPoints(recRows))
            .uploadsPerMonth(toMonthlyPoints(uplRows))
            .locoTypeDistribution(locoTypeDist)
            .shedDistribution(shedDist)
            .trainCategoryDistribution(catDist)
            .railwayZoneDistribution(zoneDist)
            .build();
    }

    /** 10 most recently added videos */
    public List<VideoSummaryResponse> getRecentVideos() {
        User currentUser = getCurrentUser();
        return videoRepository
            .findByUserAndIsDeletedFalse(currentUser, PageRequest.of(0, 10,
                org.springframework.data.domain.Sort.by("createdAt").descending()))
            .getContent()
            .stream()
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

    private List<CategoryPoint> buildLocoTypeDistribution(User user) {
        return videoRepository.findMostRecordedLocoTypes(PageRequest.of(0, 15), user)
            .stream()
            .map(r -> CategoryPoint.builder()
                .name((String) r[0])
                .count(((Number) r[1]).longValue())
                .build())
            .toList();
    }

    private List<CategoryPoint> buildShedDistribution(User user) {
        return videoRepository.findMostRecordedTrains(PageRequest.of(0, 10), user)
            .stream()
            .map(r -> CategoryPoint.builder()
                .name((String) r[0])
                .count(((Number) r[1]).longValue())
                .build())
            .toList();
    }

    private List<CategoryPoint> buildTrainCategoryDistribution(User user) {
        return videoRepository.countByTrainCategory(PageRequest.of(0, 15), user)
            .stream()
            .map(r -> CategoryPoint.builder()
                .name((String) r[0])
                .count(((Number) r[1]).longValue())
                .build())
            .toList();
    }

    private List<CategoryPoint> buildRailwayZoneDistribution(User user) {
        return videoRepository.countByRailwayZone(null, null, PageRequest.of(0, 15), user)
            .stream()
            .map(r -> CategoryPoint.builder()
                .name((String) r[0])
                .count(((Number) r[1]).longValue())
                .build())
            .toList();
    }
}
