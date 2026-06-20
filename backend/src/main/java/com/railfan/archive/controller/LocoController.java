package com.railfan.archive.controller;

import com.railfan.archive.dto.response.LocoHistoryResponse;
import com.railfan.archive.dto.response.LocoSummaryDto;
import com.railfan.archive.service.LocoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locos")
@RequiredArgsConstructor
public class LocoController {

    private final LocoService locoService;

    @GetMapping
    public ResponseEntity<List<LocoSummaryDto>> getLocoSummaries() {
        return ResponseEntity.ok(locoService.getLocoSummaries());
    }

    @GetMapping("/{number}/history")
    public ResponseEntity<List<LocoHistoryResponse>> getLocoHistory(@PathVariable String number) {
        return ResponseEntity.ok(locoService.getLocoHistory(number));
    }
}
