package com.railfan.archive.service;

import com.railfan.archive.dto.request.BulkActionRequest;
import com.railfan.archive.dto.request.VideoCreateRequest;
import com.railfan.archive.dto.response.VideoResponse;
import com.railfan.archive.dto.response.VideoSummaryResponse;
import com.railfan.archive.entity.*;
import com.railfan.archive.enums.Priority;
import com.railfan.archive.enums.UploadStatus;
import com.railfan.archive.exception.VideoNotFoundException;
import com.railfan.archive.repository.*;
import com.railfan.archive.util.VideoSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Core video management service.
 *
 * Responsibilities:
 *  - Full CRUD with soft deletes
 *  - Business rule enforcement (upload_date/time mandatory when UPLOADED)
 *  - Duplicate detection triggering
 *  - Mapping between Entity ↔ DTO
 *  - Delegating dynamic filtering to VideoSpecification
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VideoService {

    private final VideoRepository videoRepository;
    private final TrainCategoryRepository trainCategoryRepository;
    private final LocoTypeRepository locoTypeRepository;
    private final LocoShedRepository locoShedRepository;
    private final StationRepository stationRepository;
    private final DuplicateAlertRepository duplicateAlertRepository;
    private final TagCollectionService tagCollectionService;

    // ── Read operations ───────────────────────────────────────

    /**
     * Paginated, filtered, sorted list of videos.
     */
    @Transactional(readOnly = true)
    public Page<VideoSummaryResponse> findAll(
        String q, UploadStatus uploadStatus, Priority priority,
        String trainNumber, String trainName, String locoNumber,
        Long locoTypeId, Long locoShedId, Long trainCategoryId,
        Long stationId, LocalDate recordingDateFrom, LocalDate recordingDateTo,
        LocalDate uploadDateFrom, LocalDate uploadDateTo,
        Boolean kavachFitted, Long collectionId,
        Pageable pageable
    ) {
        Specification<Video> spec = VideoSpecification.build(
            q, uploadStatus, priority, trainNumber, trainName, locoNumber,
            locoTypeId, locoShedId, trainCategoryId, stationId,
            recordingDateFrom, recordingDateTo, uploadDateFrom, uploadDateTo,
            kavachFitted, collectionId
        );
        return videoRepository.findAll(spec, pageable).map(this::toSummary);
    }

    /** Get a single video by ID (throws VideoNotFoundException if deleted or missing) */
    @Transactional(readOnly = true)
    public VideoResponse findById(Long id) {
        Video video = videoRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new VideoNotFoundException(id));
        return toResponse(video);
    }

    // ── Write operations ──────────────────────────────────────

    /** Create a new video record */
    @Transactional
    public VideoResponse create(VideoCreateRequest req) {
        validateUploadBusinessRules(req);

        Video video = new Video();
        applyRequest(video, req);
        Video saved = videoRepository.save(video);

        // Async duplicate check
        checkAndSaveDuplicates(saved);

        log.info("Created video id={} title='{}'", saved.getId(), saved.getTitle());
        return toResponse(saved);
    }

    /** Update an existing video */
    @Transactional
    public VideoResponse update(Long id, VideoCreateRequest req) {
        Video video = videoRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new VideoNotFoundException(id));

        validateUploadBusinessRules(req);
        applyRequest(video, req);
        Video saved = videoRepository.save(video);

        log.info("Updated video id={}", id);
        return toResponse(saved);
    }

    /** Change upload status only (used from the queue and bulk actions) */
    @Transactional
    public VideoResponse updateStatus(Long id, UploadStatus newStatus,
                                      LocalDate uploadDate, LocalTime uploadTime,
                                      LocalDate scheduledDate) {
        Video video = videoRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new VideoNotFoundException(id));

        if (newStatus == UploadStatus.UPLOADED) {
            if (uploadDate == null || uploadTime == null) {
                throw new IllegalArgumentException(
                    "Upload date and time are required when marking a video as Uploaded"
                );
            }
            video.setUploadDate(uploadDate);
            video.setUploadTime(uploadTime);
        }

        if (newStatus == UploadStatus.SCHEDULED_UPLOAD && scheduledDate != null) {
            video.setScheduledUploadDate(scheduledDate);
        }

        video.setUploadStatus(newStatus);
        return toResponse(videoRepository.save(video));
    }

    /** Soft-delete a video */
    @Transactional
    public void delete(Long id) {
        Video video = videoRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new VideoNotFoundException(id));
        video.setIsDeleted(true);
        videoRepository.save(video);
        log.info("Soft-deleted video id={}", id);
    }

    /** Bulk action on multiple videos */
    @Transactional
    public void bulkAction(BulkActionRequest req) {
        List<Video> videos = videoRepository.findAllById(req.getVideoIds())
            .stream()
            .filter(v -> !v.getIsDeleted())
            .toList();

        switch (req.getAction()) {
            case "MARK_UPLOADED" -> {
                LocalDate date = LocalDate.parse(req.getUploadDate());
                LocalTime time = req.getUploadTime() != null
                    ? LocalTime.parse(req.getUploadTime())
                    : LocalTime.NOON;
                videos.forEach(v -> {
                    v.setUploadStatus(UploadStatus.UPLOADED);
                    v.setUploadDate(date);
                    v.setUploadTime(time);
                });
            }
            case "SCHEDULE_UPLOAD" -> {
                LocalDate scheduled = LocalDate.parse(req.getScheduledDate());
                videos.forEach(v -> {
                    v.setUploadStatus(UploadStatus.SCHEDULED_UPLOAD);
                    v.setScheduledUploadDate(scheduled);
                });
            }
            case "ARCHIVE" -> videos.forEach(v -> v.setUploadStatus(UploadStatus.ARCHIVED));
            case "DELETE"  -> videos.forEach(v -> v.setIsDeleted(true));
            default -> throw new IllegalArgumentException("Unknown bulk action: " + req.getAction());
        }
        videoRepository.saveAll(videos);
        log.info("Bulk action '{}' applied to {} videos", req.getAction(), videos.size());
    }

    /** Check for potential duplicate videos (same train+date or loco+date) */
    @Transactional(readOnly = true)
    public List<VideoSummaryResponse> checkDuplicates(String trainNumber, String locoNumber,
                                                       LocalDate recordingDate, Long excludeId) {
        Set<Video> duplicates = new HashSet<>();

        if (StringUtils.hasText(trainNumber)) {
            duplicates.addAll(
                videoRepository.findPotentialDuplicatesByTrainAndDate(trainNumber, recordingDate, excludeId)
            );
        }
        if (StringUtils.hasText(locoNumber)) {
            duplicates.addAll(
                videoRepository.findPotentialDuplicatesByLocoAndDate(locoNumber, recordingDate, excludeId)
            );
        }
        return duplicates.stream().map(this::toSummary).toList();
    }

    // ── Mapping ───────────────────────────────────────────────

    /** Convert Video entity → full VideoResponse */
    public VideoResponse toResponse(Video v) {
        return VideoResponse.builder()
            .id(v.getId())
            .title(v.getTitle())
            .description(v.getDescription())
            .recordingDate(v.getRecordingDate())
            .recordingTime(v.getRecordingTime())
            .uploadStatus(v.getUploadStatus())
            .uploadDate(v.getUploadDate())
            .uploadTime(v.getUploadTime())
            .youtubeUrl(v.getYoutubeUrl())
            .youtubeVideoId(v.getYoutubeVideoId())
            .scheduledUploadDate(v.getScheduledUploadDate())
            .priority(v.getPriority())
            .fileName(v.getFileName())
            .durationSeconds(v.getDurationSeconds())
            .fileSizeBytes(v.getFileSizeBytes())
            .resolution(v.getResolution())
            .fps(v.getFps())
            .thumbnail(v.getThumbnail())
            .trainNumber(v.getTrainNumber())
            .trainName(v.getTrainName())
            .trainCategoryId(v.getTrainCategory() != null ? v.getTrainCategory().getId() : null)
            .trainCategoryName(v.getTrainCategory() != null ? v.getTrainCategory().getName() : null)
            .locoNumber(v.getLocoNumber())
            .locoTypeId(v.getLocoType() != null ? v.getLocoType().getId() : null)
            .locoTypeName(v.getLocoType() != null ? v.getLocoType().getName() : null)
            .locoShedId(v.getLocoShed() != null ? v.getLocoShed().getId() : null)
            .locoShedName(v.getLocoShed() != null ? v.getLocoShed().getName() : null)
            .locoLivery(v.getLocoLivery())
            .kavachFitted(v.getKavachFitted())
            .stationId(v.getStation() != null ? v.getStation().getId() : null)
            .stationName(v.getStation() != null ? v.getStation().getName() : null)
            .section(v.getSection())
            .state(v.getState())
            .railwayZone(v.getRailwayZone())
            .gpsLat(v.getGpsLat())
            .gpsLng(v.getGpsLng())
            .notes(v.getNotes())
            .interestingEvents(v.getInterestingEvents())
            .observationNotes(v.getObservationNotes())
            .tags(v.getTags().stream()
                .map(t -> VideoResponse.TagResponse.builder().id(t.getId()).name(t.getName()).build())
                .toList())
            .collections(v.getCollections().stream()
                .map(c -> VideoResponse.CollectionResponse.builder().id(c.getId()).name(c.getName()).build())
                .toList())
            .secondaryLocos(v.getSecondaryLocos().stream()
                .map(l -> com.railfan.archive.dto.response.SecondaryLocoResponse.builder()
                    .id(l.getId())
                    .locoNumber(l.getLocoNumber())
                    .locoType(l.getLocoType() != null ? new com.railfan.archive.dto.response.NamedReference(l.getLocoType().getId(), l.getLocoType().getName()) : null)
                    .locoShed(l.getLocoShed() != null ? new com.railfan.archive.dto.response.NamedReference(l.getLocoShed().getId(), l.getLocoShed().getName()) : null)
                    .role(l.getRole())
                    .build())
                .toList())
            .trainEncounters(v.getTrainEncounters().stream()
                .map(e -> com.railfan.archive.dto.response.TrainEncounterResponse.builder()
                    .id(e.getId())
                    .encounterType(e.getEncounterType())
                    .trainNumber(e.getTrainNumber())
                    .trainName(e.getTrainName())
                    .trainCategory(e.getTrainCategory() != null ? new com.railfan.archive.dto.response.NamedReference(e.getTrainCategory().getId(), e.getTrainCategory().getName()) : null)
                    .locoNumber(e.getLocoNumber())
                    .locoType(e.getLocoType() != null ? new com.railfan.archive.dto.response.NamedReference(e.getLocoType().getId(), e.getLocoType().getName()) : null)
                    .locoShed(e.getLocoShed() != null ? new com.railfan.archive.dto.response.NamedReference(e.getLocoShed().getId(), e.getLocoShed().getName()) : null)
                    .recordingDate(e.getRecordingDate())
                    .recordingTime(e.getRecordingTime())
                    .build())
                .toList())
            .createdAt(v.getCreatedAt())
            .updatedAt(v.getUpdatedAt())
            .daysBetweenRecordingAndUpload(v.getDaysBetweenRecordingAndUpload())
            .build();
    }

    /** Convert Video entity → lightweight VideoSummaryResponse */
    public VideoSummaryResponse toSummary(Video v) {
        return VideoSummaryResponse.builder()
            .id(v.getId())
            .title(v.getTitle())
            .recordingDate(v.getRecordingDate())
            .uploadStatus(v.getUploadStatus())
            .priority(v.getPriority())
            .trainNumber(v.getTrainNumber())
            .trainName(v.getTrainName())
            .trainCategoryName(v.getTrainCategory() != null ? v.getTrainCategory().getName() : null)
            .locoNumber(v.getLocoNumber())
            .locoTypeName(v.getLocoType() != null ? v.getLocoType().getName() : null)
            .locoShedName(v.getLocoShed() != null ? v.getLocoShed().getName() : null)
            .stationName(v.getStation() != null ? v.getStation().getName() : null)
            .railwayZone(v.getRailwayZone())
            .durationSeconds(v.getDurationSeconds())
            .fileSizeBytes(v.getFileSizeBytes())
            .thumbnail(v.getThumbnail())
            .youtubeVideoId(v.getYoutubeVideoId())
            .kavachFitted(v.getKavachFitted())
            .tagNames(v.getTags().stream().map(Tag::getName).toList())
            .build();
    }

    // ── Private helpers ───────────────────────────────────────

    /** Apply all fields from request DTO to the Video entity */
    private void applyRequest(Video v, VideoCreateRequest req) {
        v.setTitle(req.getTitle());
        v.setDescription(req.getDescription());
        v.setRecordingDate(req.getRecordingDate());
        v.setRecordingTime(req.getRecordingTime());
        v.setUploadStatus(req.getUploadStatus());

        // Upload fields
        if (req.getUploadStatus() == UploadStatus.UPLOADED) {
            v.setUploadDate(req.getUploadDate());
            v.setUploadTime(req.getUploadTime());
        } else {
            v.setUploadDate(null);
            v.setUploadTime(null);
        }
        v.setYoutubeUrl(req.getYoutubeUrl());
        v.setYoutubeVideoId(req.getYoutubeVideoId());
        v.setScheduledUploadDate(req.getScheduledUploadDate());
        v.setPriority(req.getPriority() != null ? req.getPriority() : Priority.MEDIUM);

        // Media
        v.setFileName(req.getFileName());
        v.setDurationSeconds(req.getDurationSeconds());
        v.setFileSizeBytes(req.getFileSizeBytes());
        v.setResolution(req.getResolution());
        v.setFps(req.getFps());
        v.setThumbnail(req.getThumbnail());

        // Train
        v.setTrainNumber(req.getTrainNumber());
        v.setTrainName(req.getTrainName());
        v.setTrainCategory(req.getTrainCategoryId() != null
            ? trainCategoryRepository.findById(req.getTrainCategoryId()).orElse(null)
            : null);

        // Loco
        v.setLocoNumber(req.getLocoNumber());
        v.setLocoType(req.getLocoTypeId() != null
            ? locoTypeRepository.findById(req.getLocoTypeId()).orElse(null)
            : null);
        v.setLocoShed(req.getLocoShedId() != null
            ? locoShedRepository.findById(req.getLocoShedId()).orElse(null)
            : null);
        v.setLocoLivery(req.getLocoLivery());
        v.setKavachFitted(req.getKavachFitted() != null && req.getKavachFitted());

        // Location
        v.setStation(req.getStationId() != null
            ? stationRepository.findById(req.getStationId()).orElse(null)
            : null);
        v.setSection(req.getSection());
        v.setState(req.getState());
        v.setRailwayZone(req.getRailwayZone());
        v.setGpsLat(req.getGpsLat());
        v.setGpsLng(req.getGpsLng());

        // Content
        v.setNotes(req.getNotes());
        v.setInterestingEvents(req.getInterestingEvents());
        v.setObservationNotes(req.getObservationNotes());

        // Tags — resolve IDs + auto-create new tag names
        Set<Tag> tags = new HashSet<>();
        tags.addAll(tagCollectionService.resolveTagIds(req.getTagIds()));
        if (req.getNewTagNames() != null && !req.getNewTagNames().isEmpty()) {
            tags.addAll(tagCollectionService.resolveTagNames(req.getNewTagNames()));
        }
        v.setTags(tags);

        // Collections
        v.setCollections(new HashSet<>(tagCollectionService.resolveCollectionIds(req.getCollectionIds())));

        // Multi-Loco mapping
        v.getSecondaryLocos().clear();
        if (req.getSecondaryLocos() != null) {
            req.getSecondaryLocos().forEach(slReq -> {
                com.railfan.archive.entity.SecondaryLoco sl = new com.railfan.archive.entity.SecondaryLoco();
                sl.setVideo(v);
                sl.setLocoNumber(slReq.getLocoNumber());
                sl.setLocoType(slReq.getLocoTypeId() != null ? locoTypeRepository.findById(slReq.getLocoTypeId()).orElse(null) : null);
                sl.setLocoShed(slReq.getLocoShedId() != null ? locoShedRepository.findById(slReq.getLocoShedId()).orElse(null) : null);
                sl.setRole(slReq.getRole());
                v.getSecondaryLocos().add(sl);
            });
        }

        // Multi-Train mapping
        v.getTrainEncounters().clear();
        if (req.getTrainEncounters() != null) {
            req.getTrainEncounters().forEach(teReq -> {
                com.railfan.archive.entity.TrainEncounter te = new com.railfan.archive.entity.TrainEncounter();
                te.setVideo(v);
                te.setEncounterType(teReq.getEncounterType());
                te.setTrainNumber(teReq.getTrainNumber());
                te.setTrainName(teReq.getTrainName());
                te.setTrainCategory(teReq.getTrainCategoryId() != null ? trainCategoryRepository.findById(teReq.getTrainCategoryId()).orElse(null) : null);
                te.setLocoNumber(teReq.getLocoNumber());
                te.setLocoType(teReq.getLocoTypeId() != null ? locoTypeRepository.findById(teReq.getLocoTypeId()).orElse(null) : null);
                te.setLocoShed(teReq.getLocoShedId() != null ? locoShedRepository.findById(teReq.getLocoShedId()).orElse(null) : null);
                te.setRecordingDate(teReq.getRecordingDate());
                te.setRecordingTime(teReq.getRecordingTime());
                v.getTrainEncounters().add(te);
            });
        }
    }

    /** Enforce business rule: upload date/time required when status = UPLOADED */
    private void validateUploadBusinessRules(VideoCreateRequest req) {
        if (req.getUploadStatus() == UploadStatus.UPLOADED) {
            if (req.getUploadDate() == null) {
                throw new IllegalArgumentException("Upload date is required when status is UPLOADED");
            }
            if (req.getUploadTime() == null) {
                throw new IllegalArgumentException("Upload time is required when status is UPLOADED");
            }
        }
    }

    /** Find and persist duplicate alerts for a newly created/updated video */
    private void checkAndSaveDuplicates(Video video) {
        if (video.getTrainNumber() != null && video.getRecordingDate() != null) {
            List<Video> dupes = videoRepository.findPotentialDuplicatesByTrainAndDate(
                video.getTrainNumber(), video.getRecordingDate(), video.getId());
            dupes.forEach(d -> saveDuplicateAlert(video, d, "Same train number + recording date"));
        }
        if (video.getLocoNumber() != null && video.getRecordingDate() != null) {
            List<Video> dupes = videoRepository.findPotentialDuplicatesByLocoAndDate(
                video.getLocoNumber(), video.getRecordingDate(), video.getId());
            dupes.forEach(d -> saveDuplicateAlert(video, d, "Same loco number + recording date"));
        }
    }

    private void saveDuplicateAlert(Video video, Video conflicting, String reason) {
        DuplicateAlert alert = new DuplicateAlert();
        alert.setVideo(video);
        alert.setConflictingVideo(conflicting);
        alert.setReason(reason);
        duplicateAlertRepository.save(alert);
    }
}
