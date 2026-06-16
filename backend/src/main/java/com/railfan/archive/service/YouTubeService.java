package com.railfan.archive.service;

import com.railfan.archive.dto.response.YouTubeMetadataResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class YouTubeService {

    private final RestTemplate restTemplate = new RestTemplate();

    public YouTubeMetadataResponse fetchMetadata(String videoId) {
        String oembedUrl = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + videoId + "&format=json";

        try {
            // Using Map to easily extract JSON fields without needing a dedicated DTO class
            ResponseEntity<java.util.Map> response = restTemplate.getForEntity(oembedUrl, java.util.Map.class);
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Failed to fetch YouTube oEmbed: HTTP {}", response.getStatusCode());
                return YouTubeMetadataResponse.builder().build();
            }

            java.util.Map<String, Object> data = response.getBody();
            
            String title = (String) data.get("title");
            String thumbnailUrl = (String) data.get("thumbnail_url");

            return YouTubeMetadataResponse.builder()
                    .title(title)
                    .thumbnailUrl(thumbnailUrl)
                    // oEmbed doesn't provide description or duration, but getting title/thumbnail
                    // reliably without an API key is the priority.
                    .description("")
                    .durationSeconds(null)
                    .build();

        } catch (Exception e) {
            log.error("Error fetching YouTube oEmbed data", e);
            return YouTubeMetadataResponse.builder().build();
        }
    }
}
