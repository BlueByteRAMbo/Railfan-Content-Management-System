package com.railfan.archive.repository;

import com.railfan.archive.entity.User;
import com.railfan.archive.entity.Video;
import com.railfan.archive.enums.UploadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Video repository with custom queries for dashboard, timeline, and duplicate detection.
 * Extends JpaSpecificationExecutor for dynamic multi-filter queries.
 */
@Repository
public interface VideoRepository extends JpaRepository<Video, Long>, JpaSpecificationExecutor<Video> {

    // ── Soft delete aware lookups ─────────────────────────────
    Optional<Video> findByIdAndIsDeletedFalse(Long id);
    Page<Video> findByUserAndIsDeletedFalse(User user, Pageable pageable);

    // ── Status queries ────────────────────────────────────────
    long countByUploadStatusAndUserAndIsDeletedFalse(UploadStatus status, User user);
    long countByUserAndIsDeletedFalse(User user);

    // ── Dashboard: this month ─────────────────────────────────
    @Query("""
        SELECT COUNT(v) FROM Video v
        WHERE v.isDeleted = false AND v.user = :user
        AND YEAR(v.recordingDate) = :year
        AND MONTH(v.recordingDate) = :month
        """)
    long countRecordedInMonth(@Param("year") int year, @Param("month") int month, @Param("user") User user);

    @Query("""
        SELECT COUNT(v) FROM Video v
        WHERE v.isDeleted = false AND v.user = :user
        AND v.uploadStatus = 'UPLOADED'
        AND YEAR(v.uploadDate) = :year
        AND MONTH(v.uploadDate) = :month
        """)
    long countUploadedInMonth(@Param("year") int year, @Param("month") int month, @Param("user") User user);

    // ── Dashboard: totals ─────────────────────────────────────
    @Query("SELECT COALESCE(SUM(v.fileSizeBytes), 0) FROM Video v WHERE v.isDeleted = false AND v.user = :user")
    long sumFileSizeBytes(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(v.durationSeconds), 0) FROM Video v WHERE v.isDeleted = false AND v.user = :user")
    long sumDurationSeconds(@Param("user") User user);

    @Query("SELECT COALESCE(AVG(v.durationSeconds), 0) FROM Video v WHERE v.isDeleted = false AND v.user = :user AND v.durationSeconds IS NOT NULL")
    double avgDurationSeconds(@Param("user") User user);

    // ── Timeline queries ──────────────────────────────────────
    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false AND v.user = :user
        AND YEAR(v.recordingDate) = :year
        AND MONTH(v.recordingDate) = :month
        ORDER BY v.recordingDate ASC, v.recordingTime ASC
        """)
    List<Video> findByRecordingYearMonth(@Param("year") int year, @Param("month") int month, @Param("user") User user);

    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false AND v.user = :user
        AND v.uploadStatus = 'UPLOADED'
        AND YEAR(v.uploadDate) = :year
        AND MONTH(v.uploadDate) = :month
        ORDER BY v.uploadDate ASC
        """)
    List<Video> findByUploadYearMonth(@Param("year") int year, @Param("month") int month, @Param("user") User user);

    // ── Calendar queries ──────────────────────────────────────
    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false AND v.user = :user
        AND v.recordingDate = :date
        ORDER BY v.recordingTime ASC
        """)
    List<Video> findByRecordingDate(@Param("date") LocalDate date, @Param("user") User user);

    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false AND v.user = :user
        AND v.uploadDate = :date
        ORDER BY v.uploadTime ASC
        """)
    List<Video> findByUploadDate(@Param("date") LocalDate date, @Param("user") User user);

    // ── Duplicate detection ───────────────────────────────────
    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false AND v.user = :user
        AND v.trainNumber = :trainNumber
        AND v.recordingDate = :recordingDate
        AND (:excludeId IS NULL OR v.id != :excludeId)
        """)
    List<Video> findPotentialDuplicatesByTrainAndDate(
        @Param("trainNumber") String trainNumber,
        @Param("recordingDate") LocalDate recordingDate,
        @Param("excludeId") Long excludeId,
        @Param("user") User user
    );

    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false AND v.user = :user
        AND v.locoNumber = :locoNumber
        AND v.recordingDate = :recordingDate
        AND (:excludeId IS NULL OR v.id != :excludeId)
        """)
    List<Video> findPotentialDuplicatesByLocoAndDate(
        @Param("locoNumber") String locoNumber,
        @Param("recordingDate") LocalDate recordingDate,
        @Param("excludeId") Long excludeId,
        @Param("user") User user
    );

    // ── Chart data ────────────────────────────────────────────
    @Query("SELECT YEAR(v.recordingDate), MONTH(v.recordingDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.user = :user GROUP BY YEAR(v.recordingDate), MONTH(v.recordingDate) ORDER BY YEAR(v.recordingDate), MONTH(v.recordingDate)")
    List<Object[]> countRecordingsByMonthAllTime(@Param("user") User user);

    @Query("SELECT YEAR(v.recordingDate), MONTH(v.recordingDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.user = :user AND YEAR(v.recordingDate) = :year GROUP BY YEAR(v.recordingDate), MONTH(v.recordingDate) ORDER BY MONTH(v.recordingDate)")
    List<Object[]> countRecordingsByMonth(@Param("year") Integer year, @Param("user") User user);

    @Query("SELECT YEAR(v.recordingDate), DAY(v.recordingDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.user = :user AND YEAR(v.recordingDate) = :year AND MONTH(v.recordingDate) = :month GROUP BY YEAR(v.recordingDate), DAY(v.recordingDate) ORDER BY DAY(v.recordingDate)")
    List<Object[]> countRecordingsByDay(@Param("year") Integer year, @Param("month") Integer month, @Param("user") User user);

    @Query("SELECT YEAR(v.uploadDate), MONTH(v.uploadDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.user = :user AND v.uploadStatus = 'UPLOADED' GROUP BY YEAR(v.uploadDate), MONTH(v.uploadDate) ORDER BY YEAR(v.uploadDate), MONTH(v.uploadDate)")
    List<Object[]> countUploadsByMonthAllTime(@Param("user") User user);

    @Query("SELECT YEAR(v.uploadDate), MONTH(v.uploadDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.user = :user AND v.uploadStatus = 'UPLOADED' AND YEAR(v.uploadDate) = :year GROUP BY YEAR(v.uploadDate), MONTH(v.uploadDate) ORDER BY MONTH(v.uploadDate)")
    List<Object[]> countUploadsByMonth(@Param("year") Integer year, @Param("user") User user);

    @Query("SELECT YEAR(v.uploadDate), DAY(v.uploadDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.user = :user AND v.uploadStatus = 'UPLOADED' AND YEAR(v.uploadDate) = :year AND MONTH(v.uploadDate) = :month GROUP BY YEAR(v.uploadDate), DAY(v.uploadDate) ORDER BY DAY(v.uploadDate)")
    List<Object[]> countUploadsByDay(@Param("year") Integer year, @Param("month") Integer month, @Param("user") User user);

    @Query("SELECT YEAR(v.recordingDate), MONTH(v.recordingDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.user = :user AND v.recordingDate >= :fromDate GROUP BY YEAR(v.recordingDate), MONTH(v.recordingDate) ORDER BY YEAR(v.recordingDate), MONTH(v.recordingDate)")
    List<Object[]> countRecordingsByMonthSince(@Param("fromDate") LocalDate fromDate, @Param("user") User user);

    @Query("SELECT YEAR(v.uploadDate), MONTH(v.uploadDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.user = :user AND v.uploadStatus = 'UPLOADED' AND v.uploadDate >= :fromDate GROUP BY YEAR(v.uploadDate), MONTH(v.uploadDate) ORDER BY YEAR(v.uploadDate), MONTH(v.uploadDate)")
    List<Object[]> countUploadsByMonthSince(@Param("fromDate") LocalDate fromDate, @Param("user") User user);

    // ── Statistics ────────────────────────────────────────────
    @Query("""
        SELECT v.trainName, COUNT(v) as cnt FROM Video v
        WHERE v.isDeleted = false AND v.user = :user AND v.trainName IS NOT NULL
        GROUP BY v.trainName ORDER BY cnt DESC
        """)
    List<Object[]> findMostRecordedTrains(Pageable pageable, @Param("user") User user);

    @Query("""
        SELECT v.locoNumber, COUNT(v) as cnt FROM Video v
        WHERE v.isDeleted = false AND v.user = :user AND v.locoNumber IS NOT NULL AND TRIM(v.locoNumber) != ''
        GROUP BY v.locoNumber ORDER BY cnt DESC
        """)
    List<Object[]> findMostRecordedLocos(Pageable pageable, @Param("user") User user);

    @Query("""
        SELECT lt.name, COUNT(v) as cnt FROM Video v
        JOIN v.locoType lt
        WHERE v.isDeleted = false AND v.user = :user AND lt.name IS NOT NULL AND TRIM(lt.name) != ''
        GROUP BY lt.name ORDER BY cnt DESC
        """)
    List<Object[]> findMostRecordedLocoTypes(Pageable pageable, @Param("user") User user);

    // ── Upload planner ────────────────────────────────────────
    List<Video> findByUserAndUploadStatusAndScheduledUploadDateBetweenAndIsDeletedFalseOrderByScheduledUploadDateAsc(
        User user, UploadStatus status, LocalDate from, LocalDate to
    );

    // ── YouTube ID check ──────────────────────────────────────
    boolean existsByUserAndYoutubeVideoIdAndIsDeletedFalse(User user, String youtubeVideoId);
    // ── Deep Statistics ───────────────────────────────────────
    @Query("""
        SELECT v.trainName, COUNT(v) FROM Video v
        WHERE v.isDeleted = false AND v.user = :user
        AND v.trainName IS NOT NULL AND TRIM(v.trainName) != ''
        AND (:startDate IS NULL OR v.recordingDate >= :startDate)
        AND (:endDate IS NULL OR v.recordingDate <= :endDate)
        GROUP BY v.trainName ORDER BY COUNT(v) DESC
        """)
    List<Object[]> countByTrainName(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable,
        @Param("user") User user
    );

    @Query("""
        SELECT v.locoNumber, COUNT(v) FROM Video v
        WHERE v.isDeleted = false AND v.user = :user
        AND v.locoNumber IS NOT NULL AND TRIM(v.locoNumber) != ''
        AND (:startDate IS NULL OR v.recordingDate >= :startDate)
        AND (:endDate IS NULL OR v.recordingDate <= :endDate)
        GROUP BY v.locoNumber ORDER BY COUNT(v) DESC
        """)
    List<Object[]> countByLocoNumber(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable,
        @Param("user") User user
    );

    @Query("""
        SELECT s.name, COUNT(v) FROM Video v JOIN v.locoShed s
        WHERE v.isDeleted = false AND v.user = :user
        AND s.name IS NOT NULL AND TRIM(s.name) != ''
        AND (:startDate IS NULL OR v.recordingDate >= :startDate)
        AND (:endDate IS NULL OR v.recordingDate <= :endDate)
        GROUP BY s.name ORDER BY COUNT(v) DESC
        """)
    List<Object[]> countByLocoShed(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable,
        @Param("user") User user
    );

    @Query("""
        SELECT s.name, COUNT(v) FROM Video v JOIN v.station s
        WHERE v.isDeleted = false AND v.user = :user
        AND s.name IS NOT NULL AND TRIM(s.name) != ''
        AND (:startDate IS NULL OR v.recordingDate >= :startDate)
        AND (:endDate IS NULL OR v.recordingDate <= :endDate)
        GROUP BY s.name ORDER BY COUNT(v) DESC
        """)
    List<Object[]> countByStation(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable,
        @Param("user") User user
    );

    @Query("SELECT c.name, COUNT(v) FROM Video v JOIN v.trainCategory c WHERE v.isDeleted = false AND v.user = :user AND c.name IS NOT NULL AND TRIM(c.name) != '' GROUP BY c.name ORDER BY COUNT(v) DESC")
    List<Object[]> countByTrainCategory(Pageable pageable, @Param("user") User user);

    @Query("""
        SELECT v FROM Video v
        LEFT JOIN FETCH v.station
        LEFT JOIN FETCH v.locoType
        LEFT JOIN FETCH v.locoShed
        WHERE v.isDeleted = false AND v.user = :user
        AND v.trainNumber = :trainNumber
        ORDER BY v.recordingDate ASC, v.recordingTime ASC
        """)
    List<Video> findTrainHistory(
        @Param("trainNumber") String trainNumber,
        @Param("user") User user
    );
    // ── Loco Logbook queries ──────────────────────────────────
    @Query("SELECT new com.railfan.archive.dto.response.LocoSummaryDto(v.locoNumber, COUNT(v), MIN(v.recordingDate), MAX(v.recordingDate)) " +
           "FROM Video v WHERE v.user = :user AND v.isDeleted = false AND v.locoNumber IS NOT NULL AND v.locoNumber != '' " +
           "GROUP BY v.locoNumber ORDER BY COUNT(v) DESC")
    List<com.railfan.archive.dto.response.LocoSummaryDto> getLocoSummaries(@Param("user") User user);

    @Query("SELECT v FROM Video v " +
           "LEFT JOIN FETCH v.locoType LEFT JOIN FETCH v.locoShed LEFT JOIN FETCH v.station " +
           "WHERE v.isDeleted = false AND v.user = :user AND v.locoNumber = :locoNumber " +
           "ORDER BY v.recordingDate DESC, v.recordingTime DESC")
    List<Video> findLocoHistory(@Param("locoNumber") String locoNumber, @Param("user") User user);

    // ── Spotter Map ───────────────────────────────────────────
    @Query("SELECT new com.railfan.archive.dto.response.MapPointDto(v.id, v.gpsLat, v.gpsLng, lt.name, v.locoNumber, v.recordingDate, v.thumbnail) " +
           "FROM Video v LEFT JOIN v.locoType lt " +
           "WHERE v.user = :user AND v.isDeleted = false AND v.gpsLat IS NOT NULL AND v.gpsLng IS NOT NULL")
    List<com.railfan.archive.dto.response.MapPointDto> findMapPoints(@Param("user") User user);
}
