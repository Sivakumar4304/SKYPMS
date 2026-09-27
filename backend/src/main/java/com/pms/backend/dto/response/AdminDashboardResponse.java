package com.pms.backend.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalStudents;
    private long totalDrives;
    private long totalApplications;
    private long selectedStudents;
    private double placementPercentage;
    private double averageCgpa;
}