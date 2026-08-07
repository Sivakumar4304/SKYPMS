package com.pms.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.pms.backend.dto.request.CreateStudentRequest;
import com.pms.backend.dto.request.UpdateStudentRequest;
import com.pms.backend.dto.response.StudentResponse;
import com.pms.backend.dto.CollegeResultResponse;
import com.pms.backend.entity.Skill;
import com.pms.backend.entity.Student;
import com.pms.backend.entity.User;
import com.pms.backend.exception.StudentNotFoundException;
import com.pms.backend.exception.DuplicateRollNumberException;
import com.pms.backend.repository.SkillRepository;
import com.pms.backend.repository.StudentRepository;
import com.pms.backend.repository.UserRepository;
import com.pms.backend.service.CloudinaryService;
import com.pms.backend.service.JwtService;
import com.pms.backend.service.StudentService;
import com.pms.backend.utils.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import com.pms.backend.enums.Branch;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final SkillRepository skillRepository;
    private final Cloudinary cloudinary;
    private final CloudinaryService cloudinaryService;
    private final CollegeResultServiceImpl collegeResultService;
    private JwtService jwtService;

    private StudentResponse mapToResponse(Student student){
        List<String> responseSkills = new ArrayList<>();
        for(Skill skill: student.getSkills()){
            responseSkills.add(skill.getName());
        }
        return StudentResponse.builder()
                .id(student.getId())
                .name(student.getUser().getFirstName() + " " + student.getUser().getLastName())
                .email(student.getUser().getEmail())
                .rollNumber(student.getRollNumber())
                .branch(student.getBranch())
                .backlogs(student.getBacklogs())
                .phoneNumber(student.getPhoneNumber())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .graduationYear(student.getGraduationYear())
                .cgpa(student.getCgpa())
                .skills(responseSkills)
                .profileImageUrl(student.getProfileImageUrl())
                .resumeUrl(student.getResumeUrl())
                .githubUrl(student.getGithubUrl())
                .linkedinUrl(student.getLinkedinUrl())
                .portfolioUrl(student.getPortfolioUrl())
                .build();
    }

    private List<Skill> processSkills(List<String> skills){
        List<Skill> userSkills = new ArrayList<>();
        for(String skill: skills){
            Optional<Skill> optionalSkill = skillRepository.findByName(skill);
            Skill skillEntity;
            if(optionalSkill.isPresent()){
                skillEntity = optionalSkill.get();
            } else{
                skillEntity = Skill.builder()
                        .name(skill)
                        .build();
                skillEntity = skillRepository.save(skillEntity);
            }
            userSkills.add(skillEntity);
        }
        return userSkills;
    }

    private Student getCurrentStudent() {
        String email = AuthUtils.getLoggedInUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return studentRepository.findByUser(user)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
    }


    private Branch deriveBranch(String rollNumber) {

        String branchCode = rollNumber.substring(6, 8);

        return switch (branchCode) {
            case "01" -> Branch.MECH;
            case "02" -> Branch.EEE;
            case "03" -> Branch.CIVIL;
            case "04" -> Branch.ECE;
            case "05" -> Branch.CSE;
            case "12" -> Branch.IT;
            case "42" -> Branch.AIML;
            case "45" -> Branch.AIDS;
            case "57" -> Branch.CSBS;
            default -> throw new IllegalArgumentException(
                    "Invalid branch code in roll number: " + branchCode
            );
        };
    }

    @Override
    public StudentResponse createProfile(CreateStudentRequest request) {
        String loggedInUserEmail = AuthUtils.getLoggedInUserEmail();
        User currUser = userRepository.findByEmail(loggedInUserEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not Found"));
        studentRepository.findByUser(currUser).ifPresent(student -> {
            throw new RuntimeException("Profile already Created");
        });

        // Derive roll number from the first 10 characters of the verified college email
        String localPart = loggedInUserEmail.substring(0, loggedInUserEmail.indexOf('@'));
        if (localPart.length() < 10) {
            throw new IllegalArgumentException("Email format invalid: local part must be at least 10 characters");
        }
        String rollNumber = localPart.substring(0, 10).toUpperCase();
        Branch branch = deriveBranch(rollNumber);
        int joiningYear = 2000 + Integer.parseInt(rollNumber.substring(0, 2));

        boolean isLateralEntry = rollNumber.substring(4, 6).equals("5A");

        int graduationYear = isLateralEntry
                ? joiningYear + 3
                : joiningYear + 4;

        if(studentRepository.existsByRollNumber(rollNumber)){
            throw new DuplicateRollNumberException("Roll number " + rollNumber + " is already taken");
        }
        List<Skill> userSkills = processSkills(request.getSkills());

        CollegeResultResponse result = collegeResultService.fetchResults(rollNumber);

        Student student = Student.builder()
                .rollNumber(rollNumber)
                .branch(branch)
                .backlogs(result.getTotalBacklogs())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .graduationYear(graduationYear)
                .cgpa(result.getCgpa())
                .user(currUser)
                .skills(userSkills)
                .githubUrl(request.getGithubUrl())
                .linkedinUrl(request.getLinkedinUrl())
                .portfolioUrl(request.getPortfolioUrl())
                .build();
        student = studentRepository.save(student);
        return mapToResponse(student);
    }

    @Override
    public StudentResponse updateProfile(UpdateStudentRequest request) {
        Student student = getCurrentStudent();

        if(request.getPhoneNumber() != null) {
            student.setPhoneNumber(request.getPhoneNumber());
        }
        if(request.getDateOfBirth() != null) {
            student.setDateOfBirth(request.getDateOfBirth());
        }
        if(request.getGender() != null) {
            student.setGender(request.getGender());
        }

        if(request.getSkills() != null){
            List<Skill> newSkills = processSkills(request.getSkills());
            student.setSkills(newSkills);
        }

        if (request.getGithubUrl() != null) {
            student.setGithubUrl(request.getGithubUrl());
        }

        if (request.getLinkedinUrl() != null) {
            student.setLinkedinUrl(request.getLinkedinUrl());
        }

        if (request.getPortfolioUrl() != null) {
            student.setPortfolioUrl(request.getPortfolioUrl());
        }

        student = studentRepository.save(student);
        return mapToResponse(student);
    }

    @Override
    public StudentResponse getProfile() {
        Student student = getCurrentStudent();
        return mapToResponse(student);
    }

    @Override
    public StudentResponse uploadProfileImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        if (!file.getContentType().startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
        Student student = getCurrentStudent();
        if(student.getProfileImageUrl() != null){
           cloudinaryService.deleteFile(student.getProfileImageUrl(), "image");
        }
        String profileUrl = cloudinaryService.uploadImage(file);
        student.setProfileImageUrl(profileUrl);
        student = studentRepository.save(student);
        return mapToResponse(student);
    }

    @Override
    public StudentResponse uploadResume(MultipartFile file) {
        if(file.isEmpty()){
            throw new RuntimeException("File is empty");
        }
        System.out.println(file.getOriginalFilename());
        System.out.println(file.getContentType());
        Student student = getCurrentStudent();
        if(student.getResumeUrl() != null){
            cloudinaryService.deleteFile(student.getResumeUrl(), "raw");
        }
        String resumeUrl = cloudinaryService.uploadResume(file);
        System.out.println("Resume Url = " + resumeUrl);
        student.setResumeUrl(resumeUrl);

        student = studentRepository.save(student);
        return mapToResponse(student);
    }
    @Override
    public List<StudentResponse> getStudentsByGraduationYear(Integer graduationYear) {

        List<Student> students =
                studentRepository.findByGraduationYear(graduationYear);

        List<StudentResponse> responses = new ArrayList<>();

        for (Student student : students) {
            responses.add(mapToResponse(student));
        }

        return responses;
    }
    @Override
    public List<Integer> getAvailableBatches() {
        return studentRepository.findDistinctGraduationYears();
    }
}
