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
        String url = "https://www.youtube.com/watch?v=" + videoId;

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Failed to fetch YouTube page: HTTP {}", response.getStatusCode());
                return YouTubeMetadataResponse.builder().build();
            }

            String html = response.getBody();

            // Extract Title
            String title = extractRegex(html, "<meta\\s+(?:property|name)=\"og:title\"\\s+content=\"([^\"]+)\"");
            if (title != null) title = org.springframework.web.util.HtmlUtils.htmlUnescape(title);

            // Extract Description
            String description = extractRegex(html, "<meta\\s+(?:property|name)=\"og:description\"\\s+content=\"([^\"]+)\"");
            if (description != null) description = org.springframework.web.util.HtmlUtils.htmlUnescape(description);

            // Extract Thumbnail
            String thumbnailUrl = extractRegex(html, "<meta\\s+(?:property|name)=\"og:image\"\\s+content=\"([^\"]+)\"");

            // Extract Duration
            String durationStr = extractRegex(html, "\"lengthSeconds\":\"(\\d+)\"");
            Long durationSeconds = null;
            if (durationStr != null) {
                try {
                    durationSeconds = Long.parseLong(durationStr);
                } catch (NumberFormatException ignored) {}
            }

            return YouTubeMetadataResponse.builder()
                    .title(title)
                    .description(description)
                    .durationSeconds(durationSeconds)
                    .thumbnailUrl(thumbnailUrl)
                    .build();

        } catch (Exception e) {
            log.error("Error scraping YouTube HTML", e);
            return YouTubeMetadataResponse.builder().build();
        }
    }

    private String extractRegex(String html, String regex) {
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(html);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}
