package com.pms.backend.service;

import com.pms.backend.dto.response.AdminDashboardResponse;
import com.pms.backend.dto.response.CompanyApplicationStatsResponse;
import com.pms.backend.dto.response.DriveApplicationStatsResponse;
import com.pms.backend.dto.response.StudentDashboardResponse;

import java.util.List;

public interface DashboardService {

    // Admin Dashboard
    AdminDashboardResponse getAdminDashboard();

    List<DriveApplicationStatsResponse> getApplicationsPerDrive();

    List<CompanyApplicationStatsResponse> getApplicationsPerCompany();

    // Student Dashboard
    StudentDashboardResponse getStudentDashboard(Long studentId);
}