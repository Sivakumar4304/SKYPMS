// src/main/java/com/pms/backend/dto/PlacementDriveRequest.java
package com.pms.backend.dto;

import com.pms.backend.enums.Branch;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PlacementDriveRequest {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotBlank(message = "Role cannot be blank")
    private String role;

    @NotBlank(message = "Job package cannot be blank")
    private String jobPackage;

    private String jobLocation;

    @NotNull(message = "Deadline is required")
    private LocalDateTime deadline;

    private String driveDescription;
    private String jobDescription;
    private String recruitmentProcess;
    private String requiredSkills;

    private Double minCgpa;
    private Integer backlogRestrictions;
    private Integer graduationYear;
    private List<Branch> eligibleBranches;
}