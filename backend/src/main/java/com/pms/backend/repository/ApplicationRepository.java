package com.pms.backend.repository;

import com.pms.backend.dto.response.CompanyApplicationStatsResponse;
import com.pms.backend.dto.response.DriveApplicationStatsResponse;
import com.pms.backend.entity.Application;
import com.pms.backend.entity.PlacementDrive;
import com.pms.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByStudentAndDrive(Student student, PlacementDrive drive);

    List<Application> findByStudent(Student student);

    List<Application> findByDrive(PlacementDrive drive);

    // =========================
    // ADMIN DASHBOARD
    // =========================

    @Query("""
        SELECT COUNT(a)
        FROM Application a
        WHERE a.status = com.pms.backend.enums.ApplicationStatus.OFFERED
    """)
    long countSelectedStudents();

    @Query("""
        SELECT new com.pms.backend.dto.response.DriveApplicationStatsResponse(
            a.drive.id,
            a.drive.company.name,
            COUNT(a)
        )
        FROM Application a
        GROUP BY a.drive.id, a.drive.company.name
        ORDER BY COUNT(a) DESC
    """)
    List<DriveApplicationStatsResponse> getApplicationsPerDrive();

    @Query("""
        SELECT new com.pms.backend.dto.response.CompanyApplicationStatsResponse(
            a.drive.company.name,
            COUNT(a)
        )
        FROM Application a
        GROUP BY a.drive.company.name
        ORDER BY COUNT(a) DESC
    """)
    List<CompanyApplicationStatsResponse> getApplicationsPerCompany();

    // =========================
    // STUDENT DASHBOARD
    // =========================

    // Total drives the student has applied to
    @Query("""
        SELECT COUNT(a)
        FROM Application a
        WHERE a.student.id = :studentId
    """)
    long countAppliedDrives(@Param("studentId") Long studentId);

    // Rejected applications
    @Query("""
        SELECT COUNT(a)
        FROM Application a
        WHERE a.student.id = :studentId
        AND a.status = com.pms.backend.enums.ApplicationStatus.REJECTED
    """)
    long countRejectedApplications(@Param("studentId") Long studentId);

    // Selected applications
    @Query("""
        SELECT COUNT(a)
        FROM Application a
        WHERE a.student.id = :studentId
        AND a.status = com.pms.backend.enums.ApplicationStatus.OFFERED
    """)
    long countSelectedApplications(@Param("studentId") Long studentId);
}