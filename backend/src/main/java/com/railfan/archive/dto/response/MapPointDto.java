package com.railfan.archive.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MapPointDto(
    Long id,
    BigDecimal gpsLat,
    BigDecimal gpsLng,
    String locoTypeName,
    String locoNumber,
    LocalDate recordingDate,
    String thumbnail
) {}
