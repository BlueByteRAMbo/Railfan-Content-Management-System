package com.railfan.archive.controller;

import com.railfan.archive.dto.request.ExpectedLocoConfigRequest;
import com.railfan.archive.entity.ExpectedLocoConfig;
import com.railfan.archive.entity.LocoType;
import com.railfan.archive.repository.ExpectedLocoConfigRepository;
import com.railfan.archive.repository.LocoTypeRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expected-loco-config")
@RequiredArgsConstructor
public class ExpectedLocoConfigController {

    private final ExpectedLocoConfigRepository configRepository;
    private final LocoTypeRepository locoTypeRepository;

    @GetMapping
    public List<ExpectedLocoConfig> getAllConfigs() {
        return configRepository.findAll();
    }

    @PostMapping
    @Transactional
    public ExpectedLocoConfig createConfig(@Valid @RequestBody ExpectedLocoConfigRequest request) {
        LocoType locoType = locoTypeRepository.findById(request.getExpectedLocoTypeId())
            .orElseThrow(() -> new IllegalArgumentException("Invalid Loco Type ID"));

        ExpectedLocoConfig config = configRepository.findByTrainNumber(request.getTrainNumber())
            .orElseGet(() -> {
                ExpectedLocoConfig newConfig = new ExpectedLocoConfig();
                newConfig.setTrainNumber(request.getTrainNumber());
                return newConfig;
            });

        config.setExpectedLocoType(locoType);
        return configRepository.save(config);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteConfig(@PathVariable Long id) {
        configRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
