package com.railfan.archive.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainHistoryResponse {
    private LocalDate date;
    private boolean locoChanged;
    private List<TrainAppearanceDto> appearances;
}
