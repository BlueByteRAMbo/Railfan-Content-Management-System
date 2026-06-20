package com.railfan.archive.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocoAppearanceDto {
    private Long videoId;
    private String videoTitle;
    private LocalTime recordingTime;
    private String trainNumber;
    private String trainName;
    private String stationName;
}
