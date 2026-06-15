package com.railfan.archive.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class YouTubeMetadataResponse {
    private String title;
    private String description;
    private Long durationSeconds;
    private String thumbnailUrl;
}
