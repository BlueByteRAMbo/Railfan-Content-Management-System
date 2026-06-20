package com.railfan.archive.service;

import com.railfan.archive.repository.UserRepository;
import com.railfan.archive.entity.User;
import com.railfan.archive.dto.response.StatCountResponse;
import com.railfan.archive.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsService {

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
    public List<StatCountResponse> getMostRecordedTrains(int limit, LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        return videoRepository.countByTrainName(startDate, endDate, PageRequest.of(0, limit), currentUser)
            .stream()
            .map(row -> new StatCountResponse((String) row[0], ((Number) row[1]).longValue()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<StatCountResponse> getMostRecordedLocos(int limit, LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        return videoRepository.countByLocoType(startDate, endDate, PageRequest.of(0, limit), currentUser)
            .stream()
            .map(row -> new StatCountResponse((String) row[0], ((Number) row[1]).longValue()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<StatCountResponse> getMostRecordedSheds(int limit, LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        return videoRepository.countByLocoShed(startDate, endDate, PageRequest.of(0, limit), currentUser)
            .stream()
            .map(row -> new StatCountResponse((String) row[0], ((Number) row[1]).longValue()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<StatCountResponse> getMostRecordedStations(int limit, LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        return videoRepository.countByStation(startDate, endDate, PageRequest.of(0, limit), currentUser)
            .stream()
            .map(row -> new StatCountResponse((String) row[0], ((Number) row[1]).longValue()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<StatCountResponse> getMostRecordedZones(int limit, LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        return videoRepository.countByRailwayZone(startDate, endDate, PageRequest.of(0, limit), currentUser)
            .stream()
            .map(row -> new StatCountResponse((String) row[0], ((Number) row[1]).longValue()))
            .toList();
    }
}
