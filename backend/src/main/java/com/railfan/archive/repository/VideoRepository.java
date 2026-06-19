package com.railfan.archive.repository;

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
    Page<Video> findAllByIsDeletedFalse(Pageable pageable);

    // ── Status queries ────────────────────────────────────────
    Page<Video> findByUploadStatusAndIsDeletedFalse(UploadStatus status, Pageable pageable);
    long countByUploadStatusAndIsDeletedFalse(UploadStatus status);
    long countByIsDeletedFalse();

    // ── Dashboard: this month ─────────────────────────────────
    @Query("""
        SELECT COUNT(v) FROM Video v
        WHERE v.isDeleted = false
        AND YEAR(v.recordingDate) = :year
        AND MONTH(v.recordingDate) = :month
        """)
    long countRecordedInMonth(@Param("year") int year, @Param("month") int month);

    @Query("""
        SELECT COUNT(v) FROM Video v
        WHERE v.isDeleted = false
        AND v.uploadStatus = 'UPLOADED'
        AND YEAR(v.uploadDate) = :year
        AND MONTH(v.uploadDate) = :month
        """)
    long countUploadedInMonth(@Param("year") int year, @Param("month") int month);

    // ── Dashboard: totals ─────────────────────────────────────
    @Query("SELECT COALESCE(SUM(v.fileSizeBytes), 0) FROM Video v WHERE v.isDeleted = false")
    long sumFileSizeBytes();

    @Query("SELECT COALESCE(SUM(v.durationSeconds), 0) FROM Video v WHERE v.isDeleted = false")
    long sumDurationSeconds();

    @Query("SELECT COALESCE(AVG(v.durationSeconds), 0) FROM Video v WHERE v.isDeleted = false AND v.durationSeconds IS NOT NULL")
    double avgDurationSeconds();

    // ── Timeline queries ──────────────────────────────────────
    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false
        AND YEAR(v.recordingDate) = :year
        AND MONTH(v.recordingDate) = :month
        ORDER BY v.recordingDate ASC, v.recordingTime ASC
        """)
    List<Video> findByRecordingYearMonth(@Param("year") int year, @Param("month") int month);

    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false
        AND v.uploadStatus = 'UPLOADED'
        AND YEAR(v.uploadDate) = :year
        AND MONTH(v.uploadDate) = :month
        ORDER BY v.uploadDate ASC
        """)
    List<Video> findByUploadYearMonth(@Param("year") int year, @Param("month") int month);

    // ── Calendar queries ──────────────────────────────────────
    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false
        AND v.recordingDate = :date
        ORDER BY v.recordingTime ASC
        """)
    List<Video> findByRecordingDate(@Param("date") LocalDate date);

    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false
        AND v.uploadDate = :date
        ORDER BY v.uploadTime ASC
        """)
    List<Video> findByUploadDate(@Param("date") LocalDate date);

    // ── Duplicate detection ───────────────────────────────────
    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false
        AND v.trainNumber = :trainNumber
        AND v.recordingDate = :recordingDate
        AND (:excludeId IS NULL OR v.id != :excludeId)
        """)
    List<Video> findPotentialDuplicatesByTrainAndDate(
        @Param("trainNumber") String trainNumber,
        @Param("recordingDate") LocalDate recordingDate,
        @Param("excludeId") Long excludeId
    );

    @Query("""
        SELECT v FROM Video v
        WHERE v.isDeleted = false
        AND v.locoNumber = :locoNumber
        AND v.recordingDate = :recordingDate
        AND (:excludeId IS NULL OR v.id != :excludeId)
        """)
    List<Video> findPotentialDuplicatesByLocoAndDate(
        @Param("locoNumber") String locoNumber,
        @Param("recordingDate") LocalDate recordingDate,
        @Param("excludeId") Long excludeId
    );

    // ── Chart data ────────────────────────────────────────────
    @Query("SELECT YEAR(v.recordingDate), MONTH(v.recordingDate), COUNT(v) FROM Video v WHERE v.isDeleted = false GROUP BY YEAR(v.recordingDate), MONTH(v.recordingDate) ORDER BY YEAR(v.recordingDate), MONTH(v.recordingDate)")
    List<Object[]> countRecordingsByMonthAllTime();

    @Query("SELECT YEAR(v.recordingDate), MONTH(v.recordingDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND YEAR(v.recordingDate) = :year GROUP BY YEAR(v.recordingDate), MONTH(v.recordingDate) ORDER BY MONTH(v.recordingDate)")
    List<Object[]> countRecordingsByMonth(@Param("year") Integer year);

    @Query("SELECT YEAR(v.recordingDate), DAY(v.recordingDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND YEAR(v.recordingDate) = :year AND MONTH(v.recordingDate) = :month GROUP BY YEAR(v.recordingDate), DAY(v.recordingDate) ORDER BY DAY(v.recordingDate)")
    List<Object[]> countRecordingsByDay(@Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT YEAR(v.uploadDate), MONTH(v.uploadDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.uploadStatus = 'UPLOADED' GROUP BY YEAR(v.uploadDate), MONTH(v.uploadDate) ORDER BY YEAR(v.uploadDate), MONTH(v.uploadDate)")
    List<Object[]> countUploadsByMonthAllTime();

    @Query("SELECT YEAR(v.uploadDate), MONTH(v.uploadDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.uploadStatus = 'UPLOADED' AND YEAR(v.uploadDate) = :year GROUP BY YEAR(v.uploadDate), MONTH(v.uploadDate) ORDER BY MONTH(v.uploadDate)")
    List<Object[]> countUploadsByMonth(@Param("year") Integer year);

    @Query("SELECT YEAR(v.uploadDate), DAY(v.uploadDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.uploadStatus = 'UPLOADED' AND YEAR(v.uploadDate) = :year AND MONTH(v.uploadDate) = :month GROUP BY YEAR(v.uploadDate), DAY(v.uploadDate) ORDER BY DAY(v.uploadDate)")
    List<Object[]> countUploadsByDay(@Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT YEAR(v.recordingDate), MONTH(v.recordingDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.recordingDate >= :fromDate GROUP BY YEAR(v.recordingDate), MONTH(v.recordingDate) ORDER BY YEAR(v.recordingDate), MONTH(v.recordingDate)")
    List<Object[]> countRecordingsByMonthSince(@Param("fromDate") LocalDate fromDate);

    @Query("SELECT YEAR(v.uploadDate), MONTH(v.uploadDate), COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.uploadStatus = 'UPLOADED' AND v.uploadDate >= :fromDate GROUP BY YEAR(v.uploadDate), MONTH(v.uploadDate) ORDER BY YEAR(v.uploadDate), MONTH(v.uploadDate)")
    List<Object[]> countUploadsByMonthSince(@Param("fromDate") LocalDate fromDate);

    // ── Statistics ────────────────────────────────────────────
    @Query("""
        SELECT v.trainName, COUNT(v) as cnt FROM Video v
        WHERE v.isDeleted = false AND v.trainName IS NOT NULL
        GROUP BY v.trainName ORDER BY cnt DESC
        """)
    List<Object[]> findMostRecordedTrains(Pageable pageable);

    @Query("""
        SELECT v.locoNumber, COUNT(v) as cnt FROM Video v
        WHERE v.isDeleted = false AND v.locoNumber IS NOT NULL AND TRIM(v.locoNumber) != ''
        GROUP BY v.locoNumber ORDER BY cnt DESC
        """)
    List<Object[]> findMostRecordedLocos(Pageable pageable);

    @Query("""
        SELECT lt.name, COUNT(v) as cnt FROM Video v
        JOIN v.locoType lt
        WHERE v.isDeleted = false AND lt.name IS NOT NULL AND TRIM(lt.name) != ''
        GROUP BY lt.name ORDER BY cnt DESC
        """)
    List<Object[]> findMostRecordedLocoTypes(Pageable pageable);

    // ── Upload planner ────────────────────────────────────────
    List<Video> findByUploadStatusAndScheduledUploadDateBetweenAndIsDeletedFalseOrderByScheduledUploadDateAsc(
        UploadStatus status, LocalDate from, LocalDate to
    );

    // ── YouTube ID check ──────────────────────────────────────
    boolean existsByYoutubeVideoIdAndIsDeletedFalse(String youtubeVideoId);
    // ── Deep Statistics ───────────────────────────────────────
    @Query("SELECT v.trainName, COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.trainName IS NOT NULL AND TRIM(v.trainName) != '' GROUP BY v.trainName ORDER BY COUNT(v) DESC")
    List<Object[]> countByTrainName(Pageable pageable);

    @Query("SELECT v.locoNumber, COUNT(v) FROM Video v WHERE v.isDeleted = false AND v.locoNumber IS NOT NULL AND TRIM(v.locoNumber) != '' GROUP BY v.locoNumber ORDER BY COUNT(v) DESC")
    List<Object[]> countByLocoNumber(Pageable pageable);

    @Query("SELECT s.name, COUNT(v) FROM Video v JOIN v.locoShed s WHERE v.isDeleted = false AND s.name IS NOT NULL AND TRIM(s.name) != '' GROUP BY s.name ORDER BY COUNT(v) DESC")
    List<Object[]> countByLocoShed(Pageable pageable);

    @Query("SELECT s.name, COUNT(v) FROM Video v JOIN v.station s WHERE v.isDeleted = false AND s.name IS NOT NULL AND TRIM(s.name) != '' GROUP BY s.name ORDER BY COUNT(v) DESC")
    List<Object[]> countByStation(Pageable pageable);

    @Query("SELECT c.name, COUNT(v) FROM Video v JOIN v.trainCategory c WHERE v.isDeleted = false AND c.name IS NOT NULL AND TRIM(c.name) != '' GROUP BY c.name ORDER BY COUNT(v) DESC")
    List<Object[]> countByTrainCategory(Pageable pageable);
}
