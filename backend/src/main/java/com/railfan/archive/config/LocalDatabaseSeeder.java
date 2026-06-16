package com.railfan.archive.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.railfan.archive.entity.*;
import com.railfan.archive.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("local")
@RequiredArgsConstructor
@Slf4j
public class LocalDatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TrainCategoryRepository trainCategoryRepository;
    private final LocoTypeRepository locoTypeRepository;
    private final LocoShedRepository locoShedRepository;
    private final StationRepository stationRepository;
    private final RailCollectionRepository railCollectionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping local seeding.");
            return;
        }

        log.info("Seeding database for local profile...");
        LocalDateTime now = LocalDateTime.now();

        // 1. Seed User
        User defaultUser = User.builder()
                .username("railfan")
                .email("railfan@example.com")
                .password(passwordEncoder.encode("railfan123"))
                .role("ROLE_USER")
                .enabled(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
        userRepository.save(defaultUser);
        log.info("Seeded default user: railfan / railfan123");

        // 2. Seed Train Categories
        trainCategoryRepository.saveAll(List.of(
                TrainCategory.builder().name("Rajdhani Express").description("Premium AC express trains").createdAt(now).build(),
                TrainCategory.builder().name("Duronto Express").description("Non-stop express trains").createdAt(now).build(),
                TrainCategory.builder().name("Vande Bharat Express").description("Semi-high speed electric multiple units").createdAt(now).build(),
                TrainCategory.builder().name("Shatabdi Express").description("Day intercity express trains").createdAt(now).build(),
                TrainCategory.builder().name("Superfast Express").description("Trains running above 55 kmph").createdAt(now).build(),
                TrainCategory.builder().name("Freight").description("Goods carrying trains").createdAt(now).build()
        ));
        log.info("Seeded train categories");

        // 3. Seed Locomotive Types
        locoTypeRepository.saveAll(List.of(
                LocoType.builder().name("WAP-7").traction("ELECTRIC").description("25kV AC passenger locomotive, 6120 HP").createdAt(now).build(),
                LocoType.builder().name("WAP-5").traction("ELECTRIC").description("25kV AC high-speed passenger locomotive").createdAt(now).build(),
                LocoType.builder().name("WAG-9").traction("ELECTRIC").description("25kV AC freight locomotive").createdAt(now).build(),
                LocoType.builder().name("WDP-4D").traction("DIESEL").description("4500 HP diesel passenger locomotive").createdAt(now).build(),
                LocoType.builder().name("WDG-4D").traction("DIESEL").description("4500 HP diesel freight locomotive").createdAt(now).build()
        ));
        log.info("Seeded locomotive types");

        // 4. Seed Locomotive Sheds
        locoShedRepository.saveAll(List.of(
                LocoShed.builder().name("Itarsi Electric Loco Shed").zone("WCR").location("Itarsi, MP").createdAt(now).build(),
                LocoShed.builder().name("Bhusawal Electric Loco Shed").zone("CR").location("Bhusawal, MH").createdAt(now).build(),
                LocoShed.builder().name("Kalyan Electric Loco Shed").zone("CR").location("Kalyan, MH").createdAt(now).build(),
                LocoShed.builder().name("Erode Electric Loco Shed").zone("SR").location("Erode, TN").createdAt(now).build()
        ));
        log.info("Seeded locomotive sheds");

        // 5. Seed ALL Stations from stations.json (GeoJSON FeatureCollection)
        seedStationsFromJson();

        // 6. Seed Collections
        railCollectionRepository.saveAll(List.of(
                RailCollection.builder().name("Rajdhani Collection").description("All Rajdhani Express videos").createdAt(now).updatedAt(now).build(),
                RailCollection.builder().name("Vande Bharat Collection").description("Vande Bharat Express videos").createdAt(now).updatedAt(now).build()
        ));
        log.info("Seeded collections");

        log.info("Local database seeding completed successfully.");
    }

    private void seedStationsFromJson() {
        try {
            ClassPathResource resource = new ClassPathResource("stations.json");
            if (!resource.exists()) {
                log.warn("stations.json not found on classpath – skipping station seeding");
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            InputStream is = resource.getInputStream();
            JsonNode root = mapper.readTree(is);
            JsonNode features = root.get("features");

            if (features == null || !features.isArray()) {
                log.warn("stations.json does not contain a 'features' array");
                return;
            }

            List<Station> batch = new ArrayList<>();
            int skipped = 0;

            for (JsonNode feature : features) {
                JsonNode props = feature.get("properties");
                if (props == null) continue;

                String code = props.path("code").asText(null);
                String name = props.path("name").asText(null);

                // Skip junk entries (null, blank, or placeholder codes)
                if (code == null || name == null || code.isBlank() || name.isBlank()) { skipped++; continue; }
                if (code.startsWith("XX-") || code.startsWith("YY-")) { skipped++; continue; }
                if (code.equals(name)) { skipped++; continue; }           // placeholder entries
                if (stationRepository.existsByStationCode(code)) { skipped++; continue; }

                String state    = props.path("state").asText(null);
                String zone     = props.path("zone").asText(null);
                if ("?".equals(zone)) zone = null;

                batch.add(Station.builder()
                        .name(name)
                        .stationCode(code)
                        .state(state)
                        .railwayZone(zone)
                        .build());

                // Flush in batches of 500 to avoid OOM
                if (batch.size() >= 500) {
                    stationRepository.saveAll(batch);
                    batch.clear();
                }
            }

            if (!batch.isEmpty()) stationRepository.saveAll(batch);

            log.info("Seeded {} stations from stations.json ({} skipped)", stationRepository.count(), skipped);

        } catch (Exception e) {
            log.error("Failed to seed stations from JSON: {}", e.getMessage(), e);
        }
    }
}
