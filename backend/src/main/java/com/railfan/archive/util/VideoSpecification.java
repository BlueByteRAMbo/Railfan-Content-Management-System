package com.railfan.archive.util;

import com.railfan.archive.entity.*;
import com.railfan.archive.enums.Priority;
import com.railfan.archive.enums.UploadStatus;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specification builder for dynamic multi-filter video queries.
 *
 * Combines all active filters with AND logic.
 * Always filters out soft-deleted records (isDeleted = false).
 *
 * Usage:
 *   Specification<Video> spec = VideoSpecification.build(params);
 *   Page<Video> page = videoRepository.findAll(spec, pageable);
 */
public class VideoSpecification {

    private VideoSpecification() {}  // Utility class

    public static Specification<Video> build(
        String q,
        UploadStatus uploadStatus,
        Priority priority,
        String trainNumber,
        String trainName,
        String locoNumber,
        Long locoTypeId,
        Long locoShedId,
        Long trainCategoryId,
        Long stationId,
        LocalDate recordingDateFrom,
        LocalDate recordingDateTo,
        LocalDate uploadDateFrom,
        LocalDate uploadDateTo,
        Boolean kavachFitted,
        Long collectionId,
        Long userId
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always exclude soft-deleted
            predicates.add(cb.isFalse(root.get("isDeleted")));

            // Filter by Owner/User ID
            if (userId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), userId));
            }

            // Full-text search across title, trainName, trainNumber, locoNumber, notes
            if (StringUtils.hasText(q)) {
                String pattern = "%" + q.toLowerCase() + "%";
                Predicate titleMatch     = cb.like(cb.lower(root.get("title")), pattern);
                Predicate trainNameMatch = cb.like(cb.lower(root.get("trainName")), pattern);
                Predicate trainNumMatch  = cb.like(cb.lower(root.get("trainNumber")), pattern);
                Predicate locoNumMatch   = cb.like(cb.lower(root.get("locoNumber")), pattern);
                Predicate notesMatch     = cb.like(cb.lower(root.get("notes")), pattern);
                predicates.add(cb.or(titleMatch, trainNameMatch, trainNumMatch, locoNumMatch, notesMatch));
            }

            // Status filter
            if (uploadStatus != null) {
                predicates.add(cb.equal(root.get("uploadStatus"), uploadStatus));
            }

            // Priority filter
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            // Train number (exact, case-insensitive)
            if (StringUtils.hasText(trainNumber)) {
                predicates.add(cb.equal(cb.lower(root.get("trainNumber")), trainNumber.toLowerCase()));
            }

            // Train name (contains)
            if (StringUtils.hasText(trainName)) {
                predicates.add(cb.like(cb.lower(root.get("trainName")), "%" + trainName.toLowerCase() + "%"));
            }

            // Loco number (exact, case-insensitive)
            if (StringUtils.hasText(locoNumber)) {
                predicates.add(cb.equal(cb.lower(root.get("locoNumber")), locoNumber.toLowerCase()));
            }

            // FK filters (join-based)
            if (locoTypeId != null) {
                Join<Video, LocoType> join = root.join("locoType", JoinType.LEFT);
                predicates.add(cb.equal(join.get("id"), locoTypeId));
            }

            if (locoShedId != null) {
                Join<Video, LocoShed> join = root.join("locoShed", JoinType.LEFT);
                predicates.add(cb.equal(join.get("id"), locoShedId));
            }

            if (trainCategoryId != null) {
                Join<Video, TrainCategory> join = root.join("trainCategory", JoinType.LEFT);
                predicates.add(cb.equal(join.get("id"), trainCategoryId));
            }

            if (stationId != null) {
                Join<Video, Station> join = root.join("station", JoinType.LEFT);
                predicates.add(cb.equal(join.get("id"), stationId));
            }

            // Collection filter (many-to-many)
            if (collectionId != null) {
                Join<Video, RailCollection> join = root.join("collections", JoinType.LEFT);
                predicates.add(cb.equal(join.get("id"), collectionId));
            }

            // Date range — recording date
            if (recordingDateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("recordingDate"), recordingDateFrom));
            }
            if (recordingDateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("recordingDate"), recordingDateTo));
            }

            // Date range — upload date
            if (uploadDateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("uploadDate"), uploadDateFrom));
            }
            if (uploadDateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("uploadDate"), uploadDateTo));
            }

            // KAVACH filter
            if (kavachFitted != null) {
                predicates.add(cb.equal(root.get("kavachFitted"), kavachFitted));
            }

            // Deduplicate results when joins create cartesian products
            if (query != null) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
