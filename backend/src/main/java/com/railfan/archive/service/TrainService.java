package com.railfan.archive.service;

import com.railfan.archive.dto.response.TrainAppearanceDto;
import com.railfan.archive.dto.response.TrainHistoryResponse;
import com.railfan.archive.entity.User;
import com.railfan.archive.entity.Video;
import com.railfan.archive.repository.UserRepository;
import com.railfan.archive.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TrainService {

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;

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

    @Transactional(readOnly = true)
    public List<TrainHistoryResponse> getTrainHistory(String trainNumber) {
        User currentUser = getCurrentUser();
        List<Video> videos = videoRepository.findTrainHistory(trainNumber, currentUser);

        // Group appearances by date.
        // LinkedHashMap preserves chronological ordering from the DB query (ordered by date/time).
        Map<LocalDate, List<Video>> grouped = new LinkedHashMap<>();
        for (Video v : videos) {
            LocalDate date = v.getRecordingDate();
            if (date != null) {
                grouped.computeIfAbsent(date, k -> new ArrayList<>()).add(v);
            }
        }

        List<TrainHistoryResponse> result = new ArrayList<>();
        String lastSeenLoco = null;

        for (Map.Entry<LocalDate, List<Video>> entry : grouped.entrySet()) {
            LocalDate date = entry.getKey();
            List<Video> dateVideos = entry.getValue();

            List<TrainAppearanceDto> appearances = new ArrayList<>();
            boolean dateLocoChanged = false;

            for (Video v : dateVideos) {
                String currentLoco = v.getLocoNumber();

                if (currentLoco != null && !currentLoco.isBlank()) {
                    String cleanLoco = currentLoco.trim();
                    if (lastSeenLoco != null && !lastSeenLoco.equalsIgnoreCase(cleanLoco)) {
                        dateLocoChanged = true;
                    }
                    lastSeenLoco = cleanLoco;
                }

                appearances.add(TrainAppearanceDto.builder()
                    .videoId(v.getId())
                    .videoTitle(v.getTitle())
                    .recordingTime(v.getRecordingTime())
                    .locoNumber(v.getLocoNumber())
                    .locoTypeName(v.getLocoType() != null ? v.getLocoType().getName() : null)
                    .locoShedName(v.getLocoShed() != null ? v.getLocoShed().getName() : null)
                    .stationName(v.getStation() != null ? v.getStation().getName() : null)
                    .build());
            }

            result.add(new TrainHistoryResponse(date, dateLocoChanged, appearances));
        }

        return result;
    }
}
