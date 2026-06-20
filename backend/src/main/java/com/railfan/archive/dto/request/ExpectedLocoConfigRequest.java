package com.railfan.archive.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExpectedLocoConfigRequest {
    @NotBlank(message = "Train number is required")
    private String trainNumber;

    @NotNull(message = "Expected loco type is required")
    private Long expectedLocoTypeId;
}
