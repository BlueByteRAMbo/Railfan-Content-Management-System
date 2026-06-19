package com.railfan.archive.repository;

import com.railfan.archive.entity.DuplicateAlert;
import com.railfan.archive.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DuplicateAlertRepository extends JpaRepository<DuplicateAlert, Long> {
    @Query("SELECT d FROM DuplicateAlert d WHERE d.resolved = false AND d.video.user = :user ORDER BY d.createdAt DESC")
    List<DuplicateAlert> findByResolvedFalseOrderByCreatedAtDesc(@Param("user") User user);

    @Query("SELECT d FROM DuplicateAlert d WHERE d.video.id = :videoId AND d.resolved = false AND d.video.user = :user")
    List<DuplicateAlert> findByVideoIdAndResolvedFalseAndUser(@Param("videoId") Long videoId, @Param("user") User user);

    @Query("SELECT COUNT(d) FROM DuplicateAlert d WHERE d.resolved = false AND d.video.user = :user")
    long countByResolvedFalseAndUser(@Param("user") User user);
}
