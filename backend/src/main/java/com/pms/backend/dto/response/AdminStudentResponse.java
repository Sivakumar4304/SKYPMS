package com.pms.backend.dto.response;

import com.pms.backend.enums.Branch;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminStudentResponse {

    private Long id;
    private String name;
    private String email;
    private String rollNumber;
    private Branch branch;
    private Integer backlogs;
    private Integer graduationYear;
    private Double cgpa;
    private List<String> skills;
    private String phoneNumber;
    private String profileImageUrl;
    private String resumeUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private boolean placed;
}