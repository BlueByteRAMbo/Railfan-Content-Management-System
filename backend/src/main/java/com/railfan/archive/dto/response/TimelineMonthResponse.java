package com.railfan.archive.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimelineMonthResponse {
    private String label; // e.g. "January 2025"
    private int year;
    private int month;
    private long count;
}
