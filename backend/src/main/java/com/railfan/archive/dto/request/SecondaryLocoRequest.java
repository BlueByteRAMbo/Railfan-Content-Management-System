package com.railfan.archive.dto.request;

import com.railfan.archive.enums.SecondaryLocoRole;
import lombok.Data;

@Data
public class SecondaryLocoRequest {
    private String locoNumber;
    private Long locoTypeId;
    private Long locoShedId;
    private SecondaryLocoRole role;
}
