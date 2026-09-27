package com.pms.backend.service.impl;

import com.pms.backend.dto.request.NotificationRequest;
import com.pms.backend.dto.response.ApplicationResponse;
import com.pms.backend.entity.Application;
import com.pms.backend.entity.PlacementDrive;
import com.pms.backend.entity.Student;
import com.pms.backend.enums.ApplicationStatus;
import com.pms.backend.repository.ApplicationRepository;
import com.pms.backend.repository.PlacementDriveRepository;
import com.pms.backend.repository.StudentRepository;
import com.pms.backend.service.ApplicationService;
import com.pms.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final PlacementDriveRepository placementDriveRepository;
    private final NotificationService notificationService;

    private ApplicationResponse toResponse(Application app) {

        PlacementDrive drive = app.getDrive();
        Student student = app.getStudent();

        return ApplicationResponse.builder()
                .id(app.getId())

                .studentId(student.getId())
                .studentName(
                        student.getUser().getFirstName() + " " +
                                student.getUser().getLastName()
                )
                .rollNumber(student.getRollNumber())

                .driveId(drive.getId())
                .companyName(drive.getCompany().getName())
                .role(drive.getRole())
                .jobPackage(drive.getJobPackage())
                .jobLocation(drive.getJobLocation())

                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .build();
    }

    @Override
    public ApplicationResponse applyForDrive(Long studentId, Long driveId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() ->
                        new RuntimeException("Placement Drive not found"));

        // Already applied
        if (applicationRepository.existsByStudentAndDrive(student, drive)) {
            throw new RuntimeException(
                    "You have already applied for this drive."
            );
        }

        // Branch eligibility
        if (drive.getEligibleBranches() != null &&
                !drive.getEligibleBranches().isEmpty() &&
                !drive.getEligibleBranches().contains(student.getBranch())) {

            throw new RuntimeException(
                    "Not eligible: Your branch is " +
                            student.getBranch() +
                            ", but this drive accepts: " +
                            drive.getEligibleBranches()
                                    .stream()
                                    .map(String::valueOf)
                                    .collect(Collectors.joining(", "))
            );
        }

        // CGPA eligibility
        if (drive.getMinCgpa() != null &&
                student.getCgpa() < drive.getMinCgpa()) {

            throw new RuntimeException(
                    "Not eligible: Minimum CGPA required is " +
                            drive.getMinCgpa() +
                            ", but your CGPA is " +
                            student.getCgpa()
            );
        }

        // Backlog eligibility
        if (drive.getBacklogRestrictions() != null &&
                student.getBacklogs() > drive.getBacklogRestrictions()) {

            throw new RuntimeException(
                    "Not eligible: Maximum allowed backlogs are " +
                            drive.getBacklogRestrictions() +
                            ", but you have " +
                            student.getBacklogs()
            );
        }

        // Graduation year eligibility
        if (drive.getGraduationYear() != null &&
                !drive.getGraduationYear()
                        .equals(student.getGraduationYear())) {

            throw new RuntimeException(
                    "Not eligible: Required graduation year is " +
                            drive.getGraduationYear() +
                            ", but your graduation year is " +
                            student.getGraduationYear()
            );
        }

        // Deadline eligibility
        if (drive.getDeadline() != null &&
                drive.getDeadline().isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Application closed: The deadline for this drive was " +
                            drive.getDeadline()
            );
        }

        // Create application
        Application application = Application.builder()
                .student(student)
                .drive(drive)
                .status(ApplicationStatus.APPLIED)
                .build();

        // Save application
        Application savedApplication =
                applicationRepository.save(application);

        // Notification: Application Submitted
        NotificationRequest notificationRequest =
                NotificationRequest.builder()
                        .userId(student.getUser().getId())
                        .title("Application Submitted")
                        .message(
                                "Your application for " +
                                        drive.getCompany().getName() +
                                        " has been submitted successfully."
                        )
                        .build();

        notificationService.createNotification(notificationRequest);

        return toResponse(savedApplication);
    }

    @Override
    public void withdrawApplication(Long applicationId) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        application.setStatus(ApplicationStatus.WITHDRAWN);

        applicationRepository.save(application);

        Student student = application.getStudent();
        PlacementDrive drive = application.getDrive();

        // Notification: Application Withdrawn
        NotificationRequest notificationRequest =
                NotificationRequest.builder()
                        .userId(student.getUser().getId())
                        .title("Application Withdrawn")
                        .message(
                                "Your application for " +
                                        drive.getCompany().getName() +
                                        " has been withdrawn successfully."
                        )
                        .build();

        notificationService.createNotification(notificationRequest);
    }

    @Override
    public List<ApplicationResponse> getApplicationsByStudent(
            Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        return applicationRepository.findByStudent(student)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApplicationResponse> getApplicationsByDrive(
            Long driveId) {

        PlacementDrive drive = placementDriveRepository.findById(driveId)
                .orElseThrow(() ->
                        new RuntimeException("Placement Drive not found"));

        return applicationRepository.findByDrive(drive)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ApplicationResponse updateApplicationStatus(
            Long applicationId,
            ApplicationStatus status) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        application.setStatus(status);

        // Save updated application
        Application updatedApplication =
                applicationRepository.save(application);

        Student student = application.getStudent();
        PlacementDrive drive = application.getDrive();

        // Notification: Application Status Updated
        NotificationRequest notificationRequest =
                NotificationRequest.builder()
                        .userId(student.getUser().getId())
                        .title("Application Status Updated")
                        .message(
                                "Your application for " +
                                        drive.getCompany().getName() +
                                        " has been updated to " +
                                        status +
                                        "."
                        )
                        .build();

        notificationService.createNotification(notificationRequest);

        return toResponse(updatedApplication);
    }
}