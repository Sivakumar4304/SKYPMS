package com.pms.backend.service.impl;

import com.pms.backend.dto.response.AdminDashboardResponse;
import com.pms.backend.dto.response.CompanyApplicationStatsResponse;
import com.pms.backend.dto.response.DriveApplicationStatsResponse;
import com.pms.backend.dto.response.StudentDashboardResponse;
import com.pms.backend.entity.PlacementDrive;
import com.pms.backend.entity.Student;
import com.pms.backend.repository.ApplicationRepository;
import com.pms.backend.repository.PlacementDriveRepository;
import com.pms.backend.repository.StudentRepository;
import com.pms.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final StudentRepository studentRepository;
    private final PlacementDriveRepository placementDriveRepository;
    private final ApplicationRepository applicationRepository;

    // =========================
    // ADMIN DASHBOARD
    // =========================

    @Override
    public AdminDashboardResponse getAdminDashboard() {

        long totalStudents = studentRepository.count();

        long totalDrives = placementDriveRepository.count();

        long totalApplications = applicationRepository.count();

        long selectedStudents =
                applicationRepository.countSelectedStudents();

        double placementPercentage =
                totalStudents == 0
                        ? 0
                        : ((double) selectedStudents / totalStudents) * 100;

        double averageCgpa =
                studentRepository.findAverageCgpa();

        return AdminDashboardResponse.builder()
                .totalStudents(totalStudents)
                .totalDrives(totalDrives)
                .totalApplications(totalApplications)
                .selectedStudents(selectedStudents)
                .placementPercentage(placementPercentage)
                .averageCgpa(averageCgpa)
                .build();
    }

    // =========================
    // ADMIN ANALYTICS
    // =========================

    @Override
    public List<DriveApplicationStatsResponse> getApplicationsPerDrive() {
        return applicationRepository.getApplicationsPerDrive();
    }

    @Override
    public List<CompanyApplicationStatsResponse> getApplicationsPerCompany() {
        return applicationRepository.getApplicationsPerCompany();
    }

    // =========================
    // STUDENT DASHBOARD
    // =========================

    @Override
    public StudentDashboardResponse getStudentDashboard(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        long appliedDrives =
                applicationRepository.countAppliedDrives(studentId);

        long rejectedApplications =
                applicationRepository.countRejectedApplications(studentId);

        long selectedApplications =
                applicationRepository.countSelectedApplications(studentId);

        long upcomingDrives =
                placementDriveRepository
                        .findUpcomingDrives(LocalDateTime.now())
                        .size();

        long eligibleDrives = 0;

        List<PlacementDrive> drives =
                placementDriveRepository.findAll();

        for (PlacementDrive drive : drives) {

            if (drive.getDeadline() != null &&
                    drive.getDeadline().isBefore(LocalDateTime.now())) {
                continue;
            }

            // Branch eligibility
            if (drive.getEligibleBranches() != null &&
                    !drive.getEligibleBranches().isEmpty() &&
                    !drive.getEligibleBranches()
                            .contains(student.getBranch())) {
                continue;
            }

            // CGPA eligibility
            if (drive.getMinCgpa() != null &&
                    student.getCgpa() < drive.getMinCgpa()) {
                continue;
            }

            // Backlog eligibility
            if (drive.getBacklogRestrictions() != null &&
                    student.getBacklogs() >
                            drive.getBacklogRestrictions()) {
                continue;
            }

            // Graduation year eligibility
            if (drive.getGraduationYear() != null &&
                    !drive.getGraduationYear()
                            .equals(student.getGraduationYear())) {
                continue;
            }

            eligibleDrives++;
        }

        return StudentDashboardResponse.builder()
                .appliedDrives(appliedDrives)
                .eligibleDrives(eligibleDrives)
                .upcomingDrives(upcomingDrives)
                .rejectedApplications(rejectedApplications)
                .selectedApplications(selectedApplications)
                .build();
    }
}