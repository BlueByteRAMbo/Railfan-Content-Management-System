package com.railfan.archive.service;

import com.railfan.archive.dto.response.StatCountResponse;
import com.railfan.archive.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final VideoRepository videoRepository;

    @Transactional(readOnly = true)
    public List<StatCountResponse> getMostRecordedTrains(int limit) {
        return videoRepository.countByTrainName(PageRequest.of(0, limit))
            .stream()
            .map(row -> new StatCountResponse((String) row[0], ((Number) row[1]).longValue()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<StatCountResponse> getMostRecordedLocos(int limit) {
        return videoRepository.countByLocoNumber(PageRequest.of(0, limit))
            .stream()
            .map(row -> new StatCountResponse((String) row[0], ((Number) row[1]).longValue()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<StatCountResponse> getMostRecordedSheds(int limit) {
        return videoRepository.countByLocoShed(PageRequest.of(0, limit))
            .stream()
            .map(row -> new StatCountResponse((String) row[0], ((Number) row[1]).longValue()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<StatCountResponse> getMostRecordedStations(int limit) {
        return videoRepository.countByStation(PageRequest.of(0, limit))
            .stream()
            .map(row -> new StatCountResponse((String) row[0], ((Number) row[1]).longValue()))
            .toList();
    }
}
