package com.railfan.archive.dto.response;

import lombok.*;

/**
 * Generic response wrapper for paginated results.
 * Mirrors Spring's Page<T> structure for frontend compatibility.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
    private java.util.List<T> content;
    private long totalElements;
    private int totalPages;
    private int size;
    private int number;     // current page (0-indexed)
    private boolean first;
    private boolean last;
}
