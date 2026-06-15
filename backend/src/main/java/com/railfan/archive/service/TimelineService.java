package com.railfan.archive.service;

import com.railfan.archive.dto.response.TimelineMonthResponse;
import com.railfan.archive.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TimelineService {

    private final VideoRepository videoRepository;

    @Transactional(readOnly = true)
    public List<TimelineMonthResponse> getRecordingTimeline(Integer year, Integer month) {
        List<Object[]> results;
        if (year != null && month != null) {
            results = videoRepository.countRecordingsByDay(year, month);
        } else if (year != null) {
            results = videoRepository.countRecordingsByMonth(year);
        } else {
            results = videoRepository.countRecordingsByMonthAllTime();
        }
        return mapToTimeline(results, year, month);
    }

    @Transactional(readOnly = true)
    public List<TimelineMonthResponse> getUploadTimeline(Integer year, Integer month) {
        List<Object[]> results;
        if (year != null && month != null) {
            results = videoRepository.countUploadsByDay(year, month);
        } else if (year != null) {
            results = videoRepository.countUploadsByMonth(year);
        } else {
            results = videoRepository.countUploadsByMonthAllTime();
        }
        return mapToTimeline(results, year, month);
    }

    private List<TimelineMonthResponse> mapToTimeline(List<Object[]> results, Integer filterYear, Integer filterMonth) {
        return results.stream().map(row -> {
            int y = ((Number) row[0]).intValue();
            int m = ((Number) row[1]).intValue();
            long c = ((Number) row[2]).longValue();
            
            String label;
            if (filterYear != null && filterMonth != null) {
                // If specific month requested, m is actually the DAY
                label = Month.of(filterMonth).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + m + ", " + y;
            } else {
                label = Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + y;
            }

            return TimelineMonthResponse.builder()
                .year(y)
                .month(m)
                .count(c)
                .label(label)
                .build();
        }).toList();
    }
}
