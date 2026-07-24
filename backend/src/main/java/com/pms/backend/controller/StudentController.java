package com.pms.backend.controller;

import com.pms.backend.dto.CollegeResultResponse;
import com.pms.backend.dto.request.CreateStudentRequest;
import com.pms.backend.dto.request.UpdateStudentRequest;
import com.pms.backend.dto.response.StudentResponse;
import com.pms.backend.service.CollegeResultService;
import com.pms.backend.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.pms.backend.repository.SkillRepository;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;
    private final CollegeResultService collegeResultService;
    private final SkillRepository skillRepository;

    @GetMapping("/skills")
    public List<String> getAllSkills() {
        return skillRepository.findAll()
                .stream()
                .map(skill -> skill.getName())
                .sorted()
                .collect(Collectors.toList());
    }

    @PostMapping("/profile")
    public StudentResponse createProfile(@Valid @RequestBody CreateStudentRequest request){
        return studentService.createProfile(request);
    }

    @GetMapping("/profile")
    public StudentResponse getProfile(){
        return studentService.getProfile();
    }

    @PatchMapping("/profile")
    public StudentResponse updateProfile(@Valid @RequestBody UpdateStudentRequest request){
        return studentService.updateProfile(request);
    }

    @PostMapping("/profile/image")
    public StudentResponse uploadProfileImage(@RequestParam("file") MultipartFile file){
        return studentService.uploadProfileImage(file);
    }

    @PostMapping("/profile/resume")
    public StudentResponse uploadResume(@RequestParam("file") MultipartFile file){
        return studentService.uploadResume(file);
    }

    @GetMapping("/results/{rollNumber}")
    public CollegeResultResponse fetchResults(@PathVariable String rollNumber){
        return collegeResultService.fetchResults(rollNumber);
    }
}
