package com.pms.backend.repository;

import com.pms.backend.entity.PlacementDrive;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, Long> {


    Page<PlacementDrive> findByCompany_NameContainingIgnoreCase(
            String companyName,
            Pageable pageable
    );

    // =========================
    // STUDENT DASHBOARD
    // =========================

    // Upcoming drives
    @Query("""
        SELECT d
        FROM PlacementDrive d
        WHERE d.deadline > :now
        ORDER BY d.deadline ASC
    """)
    List<PlacementDrive> findUpcomingDrives(
            @Param("now") LocalDateTime now
    );
}