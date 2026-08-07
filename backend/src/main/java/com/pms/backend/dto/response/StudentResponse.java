package com.pms.backend.dto.response;

import com.pms.backend.enums.Branch;
import com.pms.backend.enums.Gender;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponse {
    private Long id;

    private String name;

    private String email;

    private String rollNumber;

    private Branch branch;

    private Integer backlogs;

    private String phoneNumber;

    private LocalDate dateOfBirth;

    private Gender gender;

    private Integer graduationYear;

    private Double cgpa;

    private List<String> skills;

    private String profileImageUrl;

    private String resumeUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
}
