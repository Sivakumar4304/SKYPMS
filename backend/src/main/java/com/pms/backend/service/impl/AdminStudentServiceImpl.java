package com.pms.backend.service.impl;

import com.pms.backend.dto.response.AdminStudentResponse;
import com.pms.backend.entity.Application;
import com.pms.backend.entity.Skill;
import com.pms.backend.entity.Student;
import com.pms.backend.enums.ApplicationStatus;
import com.pms.backend.enums.Branch;
import com.pms.backend.exception.StudentNotFoundException;
import com.pms.backend.repository.ApplicationRepository;
import com.pms.backend.repository.StudentRepository;
import com.pms.backend.service.AdminStudentService;
import com.pms.backend.specification.StudentSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminStudentServiceImpl implements AdminStudentService {

    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    public Page<AdminStudentResponse> getStudents(
            String search,
            Branch branch,
            Double minCgpa,
            Double maxCgpa,
            String skill,
            Boolean placed,
            Integer graduationYear,
            int page,
            int size,
            String sortBy,
            String direction
    ) {

        Sort.Direction sortDirection =
                direction.equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(sortDirection, sortBy)
                );

        return studentRepository.findAll(
                        StudentSpecification.filterStudents(
                                search,
                                branch,
                                minCgpa,
                                maxCgpa,
                                skill,
                                placed,
                                graduationYear
                        ),
                        pageable
                )
                .map(this::mapToAdminResponse);
    }

    @Override
    public AdminStudentResponse getStudentById(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new StudentNotFoundException(
                                "Student not found with id: " + id
                        )
                );

        return mapToAdminResponse(student);
    }

    @Override
    public void deleteStudent(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new StudentNotFoundException(
                                "Student not found with id: " + id
                        )
                );

        /*
         * Applications reference the student.
         * Delete applications first to avoid foreign-key violations.
         */
        List<Application> applications =
                applicationRepository.findByStudent(student);

        applicationRepository.deleteAll(applications);

        studentRepository.delete(student);
    }

    private AdminStudentResponse mapToAdminResponse(Student student) {

        List<String> skills = new ArrayList<>();

        if (student.getSkills() != null) {
            for (Skill skill : student.getSkills()) {
                skills.add(skill.getName());
            }
        }

        boolean placed = applicationRepository
                .findByStudent(student)
                .stream()
                .anyMatch(application ->
                        application.getStatus() == ApplicationStatus.OFFERED
                );

        String firstName = student.getUser().getFirstName();
        String lastName = student.getUser().getLastName();

        String name = firstName;

        if (lastName != null && !lastName.isBlank()) {
            name += " " + lastName;
        }

        return AdminStudentResponse.builder()
                .id(student.getId())
                .name(name)
                .email(student.getUser().getEmail())
                .rollNumber(student.getRollNumber())
                .branch(student.getBranch())
                .backlogs(student.getBacklogs())
                .graduationYear(student.getGraduationYear())
                .cgpa(student.getCgpa())
                .skills(skills)
                .phoneNumber(student.getPhoneNumber())
                .profileImageUrl(student.getProfileImageUrl())
                .resumeUrl(student.getResumeUrl())
                .githubUrl(student.getGithubUrl())
                .linkedinUrl(student.getLinkedinUrl())
                .portfolioUrl(student.getPortfolioUrl())
                .placed(placed)
                .build();
    }
}