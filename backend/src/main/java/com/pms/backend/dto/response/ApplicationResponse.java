package com.pms.backend.dto.response;

import com.pms.backend.enums.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {
    private Long id;
    private Long driveId;
    private String companyName;
    private String role;
    private String jobPackage;
    private String jobLocation;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private Long studentId;
    private String studentName;
    private String rollNumber;
}
