package com.railfan.archive.dto.response;

import java.time.LocalDate;

public record LocoSummaryDto(
    String locoNumber,
    Long count,
    LocalDate firstSeen,
    LocalDate lastSeen
) {}
