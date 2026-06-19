package com.railfan.archive.controller;

import com.railfan.archive.dto.response.TrainHistoryResponse;
import com.railfan.archive.service.TrainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for tracking train appearances and runs.
 */
@RestController
@RequestMapping("/api/trains")
@RequiredArgsConstructor
public class TrainController {

    private final TrainService trainService;

    @GetMapping("/{number}/history")
    public ResponseEntity<List<TrainHistoryResponse>> getTrainHistory(@PathVariable String number) {
        return ResponseEntity.ok(trainService.getTrainHistory(number));
    }
}
