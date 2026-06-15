package com.railfan.archive.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.railfan.archive.dto.response.YouTubeMetadataResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class YouTubeService {

    @Value("${youtube.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public YouTubeMetadataResponse fetchMetadata(String videoId) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your_youtube_data_api_v3_key_here")) {
            log.warn("YouTube API key is missing or invalid. Returning empty metadata.");
            return YouTubeMetadataResponse.builder().build();
        }

        String url = String.format(
            "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=%s&key=%s",
            videoId, apiKey
        );

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Failed to fetch YouTube metadata: HTTP {}", response.getStatusCode());
                return YouTubeMetadataResponse.builder().build();
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode items = root.path("items");
            
            if (items.isEmpty()) {
                log.warn("YouTube video not found: {}", videoId);
                return YouTubeMetadataResponse.builder().build();
            }

            JsonNode video = items.get(0);
            JsonNode snippet = video.path("snippet");
            JsonNode contentDetails = video.path("contentDetails");

            String title = snippet.path("title").asText(null);
            String description = snippet.path("description").asText(null);
            
            // Extract highest resolution thumbnail available
            String thumbnailUrl = null;
            JsonNode thumbnails = snippet.path("thumbnails");
            if (thumbnails.has("maxres")) {
                thumbnailUrl = thumbnails.path("maxres").path("url").asText();
            } else if (thumbnails.has("high")) {
                thumbnailUrl = thumbnails.path("high").path("url").asText();
            } else if (thumbnails.has("default")) {
                thumbnailUrl = thumbnails.path("default").path("url").asText();
            }

            // Parse ISO 8601 duration (e.g. PT1H2M10S)
            String durationIso = contentDetails.path("duration").asText("");
            Long durationSeconds = null;
            try {
                if (!durationIso.isBlank()) {
                    durationSeconds = Duration.parse(durationIso).getSeconds();
                }
            } catch (Exception e) {
                log.error("Failed to parse YouTube duration: {}", durationIso, e);
            }

            return YouTubeMetadataResponse.builder()
                    .title(title)
                    .description(description)
                    .durationSeconds(durationSeconds)
                    .thumbnailUrl(thumbnailUrl)
                    .build();

        } catch (Exception e) {
            log.error("Error calling YouTube API", e);
            return YouTubeMetadataResponse.builder().build();
        }
    }
}
