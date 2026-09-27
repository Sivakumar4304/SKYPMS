package com.pms.backend.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardResponse {

    private long appliedDrives;
    private long eligibleDrives;
    private long upcomingDrives;
    private long rejectedApplications;
    private long selectedApplications;
}