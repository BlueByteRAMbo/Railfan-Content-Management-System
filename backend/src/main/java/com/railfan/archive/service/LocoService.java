package com.railfan.archive.service;

import com.railfan.archive.dto.response.LocoAppearanceDto;
import com.railfan.archive.dto.response.LocoHistoryResponse;
import com.railfan.archive.dto.response.LocoSummaryDto;
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
public class LocoService {

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
    public List<LocoSummaryDto> getLocoSummaries() {
        User currentUser = getCurrentUser();
        return videoRepository.getLocoSummaries(currentUser);
    }

    @Transactional(readOnly = true)
    public List<LocoHistoryResponse> getLocoHistory(String locoNumber) {
        User currentUser = getCurrentUser();
        List<Video> videos = videoRepository.findLocoHistory(locoNumber, currentUser);

        Map<LocalDate, List<Video>> grouped = new LinkedHashMap<>();
        for (Video v : videos) {
            LocalDate date = v.getRecordingDate();
            if (date != null) {
                grouped.computeIfAbsent(date, k -> new ArrayList<>()).add(v);
            }
        }

        List<LocoHistoryResponse> result = new ArrayList<>();
        String lastSeenShed = null;
        String lastSeenLivery = null;

        for (Map.Entry<LocalDate, List<Video>> entry : grouped.entrySet()) {
            LocalDate date = entry.getKey();
            List<Video> dateVideos = entry.getValue();

            List<LocoAppearanceDto> appearances = new ArrayList<>();
            boolean shedOrLiveryChanged = false;
            String currentShed = null;
            String currentLivery = null;

            for (Video v : dateVideos) {
                String shed = v.getLocoShed() != null ? v.getLocoShed().getName() : null;
                String livery = v.getLocoLivery();
                
                if (currentShed == null) currentShed = shed;
                if (currentLivery == null) currentLivery = livery;

                if (shed != null && lastSeenShed != null && !shed.equalsIgnoreCase(lastSeenShed)) {
                    shedOrLiveryChanged = true;
                }
                if (livery != null && lastSeenLivery != null && !livery.equalsIgnoreCase(lastSeenLivery)) {
                    shedOrLiveryChanged = true;
                }
                
                if (shed != null) lastSeenShed = shed;
                if (livery != null) lastSeenLivery = livery;

                appearances.add(LocoAppearanceDto.builder()
                    .videoId(v.getId())
                    .videoTitle(v.getTitle())
                    .recordingTime(v.getRecordingTime())
                    .trainNumber(v.getTrainNumber())
                    .trainName(v.getTrainName())
                    .stationName(v.getStation() != null ? v.getStation().getName() : null)
                    .build());
            }

            result.add(new LocoHistoryResponse(date, shedOrLiveryChanged, currentShed, currentLivery, appearances));
        }

        return result;
    }
}
