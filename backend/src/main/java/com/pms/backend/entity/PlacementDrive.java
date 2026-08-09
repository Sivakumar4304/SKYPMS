// src/main/java/com/pms/backend/entity/PlacementDrive.java
package com.pms.backend.entity;

import com.pms.backend.enums.Branch;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "placement_drives")
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String role;

    @Column(name = "package", nullable = false)
    private String jobPackage;

    @Column(name = "job_location")
    private String jobLocation;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Column(columnDefinition = "TEXT")
    private String driveDescription;

    @Column(columnDefinition = "TEXT")
    private String jobDescription;

    @Column(columnDefinition = "TEXT")
    private String recruitmentProcess;

    @Column(columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(name = "min_cgpa")
    private Double minCgpa;

    @Column(name = "backlog_restrictions")
    private Integer backlogRestrictions;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @ElementCollection(targetClass = Branch.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "drive_eligible_branches", joinColumns = @JoinColumn(name = "drive_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "branch")
    @Builder.Default
    private List<Branch> eligibleBranches = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "placementDrive",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    @Builder.Default
    private List<Form> forms = new ArrayList<>();
}
