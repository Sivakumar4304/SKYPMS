package com.pms.backend.service;

import com.pms.backend.dto.request.CreateStudentRequest;
import com.pms.backend.dto.request.UpdateStudentRequest;
import com.pms.backend.dto.response.StudentResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface StudentService {
    StudentResponse createProfile(CreateStudentRequest request);
    StudentResponse updateProfile(UpdateStudentRequest request);
    StudentResponse getProfile();
    StudentResponse uploadProfileImage(MultipartFile file);
    StudentResponse uploadResume(MultipartFile file);
    List<StudentResponse> getStudentsByGraduationYear(Integer graduationYear);
    List<Integer> getAvailableBatches();
}
