package com.railfan.archive.dto.request;

import com.railfan.archive.enums.EncounterType;
import lombok.Data;

@Data
public class TrainEncounterRequest {
    private EncounterType encounterType;
    private String trainNumber;
    private String trainName;
    private Long trainCategoryId;
    private String locoNumber;
    private Long locoTypeId;
    private Long locoShedId;
}
