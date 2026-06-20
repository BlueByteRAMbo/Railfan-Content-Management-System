package com.railfan.archive.dto.response;

import lombok.*;
import java.util.List;

/**
 * All chart datasets for the dashboard.
 * Each dataset is a list of labelled data points.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardChartsResponse {

    private List<MonthlyPoint> recordingsPerMonth;
    private List<MonthlyPoint> uploadsPerMonth;
    private List<CategoryPoint> locoTypeDistribution;
    private List<CategoryPoint> shedDistribution;
    private List<CategoryPoint> trainCategoryDistribution;
    private List<CategoryPoint> railwayZoneDistribution;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyPoint {
        private int year;
        private int month;
        private String label;   // e.g. "Jan 2025"
        private long count;
        private long cumulativeStorage;  // bytes — for storage growth chart
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryPoint {
        private String name;
        private long count;
    }
}
