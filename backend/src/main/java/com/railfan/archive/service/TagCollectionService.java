package com.railfan.archive.service;

import com.railfan.archive.entity.RailCollection;
import com.railfan.archive.entity.Tag;
import com.railfan.archive.repository.RailCollectionRepository;
import com.railfan.archive.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing tags and collections.
 * Provides find-or-create logic for tags used in Quick Add mode.
 */
@Service
@RequiredArgsConstructor
public class TagCollectionService {

    private final TagRepository tagRepository;
    private final RailCollectionRepository collectionRepository;

    /** Find existing tag or create it (case-insensitive) */
    @Transactional
    public Tag findOrCreateTag(String name) {
        return tagRepository.findByNameIgnoreCase(name.trim())
            .orElseGet(() -> {
                Tag tag = new Tag();
                tag.setName(name.trim().toLowerCase());
                return tagRepository.save(tag);
            });
    }

    /** Resolve a set of tag names to Tag entities (creating missing ones) */
    @Transactional
    public Set<Tag> resolveTagNames(Set<String> names) {
        return names.stream()
            .filter(n -> n != null && !n.isBlank())
            .map(this::findOrCreateTag)
            .collect(Collectors.toSet());
    }

    /** Resolve tag IDs to entities */
    @Transactional(readOnly = true)
    public Set<Tag> resolveTagIds(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) return Set.of();
        return ids.stream()
            .map(id -> tagRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tag not found: " + id)))
            .collect(Collectors.toSet());
    }

    /** Resolve collection IDs to entities */
    @Transactional(readOnly = true)
    public Set<RailCollection> resolveCollectionIds(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) return Set.of();
        return ids.stream()
            .map(id -> collectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found: " + id)))
            .collect(Collectors.toSet());
    }

    @Transactional
    public Tag updateTag(Long id, String name) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Tag not found: " + id));
        tag.setName(name.trim().toLowerCase());
        return tagRepository.save(tag);
    }

    @Transactional
    public void deleteTag(Long id) {
        Tag tag = tagRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Tag not found: " + id));
        for (com.railfan.archive.entity.Video video : tag.getVideos()) {
            video.getTags().remove(tag);
        }
        tagRepository.delete(tag);
    }
}
