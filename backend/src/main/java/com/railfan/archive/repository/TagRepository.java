package com.railfan.archive.repository;

import com.railfan.archive.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);

    /** Tags ordered by number of associated videos (for autocomplete ranking) */
    @Query("""
        SELECT t FROM Tag t
        LEFT JOIN t.videos v
        WHERE v.isDeleted = false OR v IS NULL
        GROUP BY t
        ORDER BY COUNT(v) DESC
        """)
    List<Tag> findAllOrderedByVideoCount();

    /** Autocomplete: tags whose name starts with given prefix */
    List<Tag> findByNameStartingWithIgnoreCaseOrderByNameAsc(String prefix);
}
