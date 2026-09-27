package com.pms.backend.controller;

import com.pms.backend.dto.response.AdminDashboardResponse;
import com.pms.backend.dto.response.CompanyApplicationStatsResponse;
import com.pms.backend.dto.response.DriveApplicationStatsResponse;
import com.pms.backend.dto.response.StudentDashboardResponse;
import com.pms.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // =========================
    // ADMIN DASHBOARD
    // =========================

    @GetMapping("/admin")
    public AdminDashboardResponse getAdminDashboard() {
        return dashboardService.getAdminDashboard();
    }

    @GetMapping("/admin/applications-per-drive")
    public List<DriveApplicationStatsResponse> getApplicationsPerDrive() {
        return dashboardService.getApplicationsPerDrive();
    }

    @GetMapping("/admin/applications-per-company")
    public List<CompanyApplicationStatsResponse> getApplicationsPerCompany() {
        return dashboardService.getApplicationsPerCompany();
    }

    // =========================
    // STUDENT DASHBOARD
    // =========================

    @GetMapping("/student/{studentId}")
    public StudentDashboardResponse getStudentDashboard(
            @PathVariable Long studentId) {

        return dashboardService.getStudentDashboard(studentId);
    }
}