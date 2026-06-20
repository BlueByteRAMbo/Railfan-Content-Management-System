package com.railfan.archive.dto.response;

import java.time.LocalDate;
import java.util.List;

public record LocoHistoryResponse(
    LocalDate date,
    boolean shedOrLiveryChanged,
    String currentShed,
    String currentLivery,
    List<LocoAppearanceDto> appearances
) {}
