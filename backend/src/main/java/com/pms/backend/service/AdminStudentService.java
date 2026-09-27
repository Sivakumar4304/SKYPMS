package com.pms.backend.service;

import com.pms.backend.dto.response.AdminStudentResponse;
import com.pms.backend.enums.Branch;
import org.springframework.data.domain.Page;

public interface AdminStudentService {

    Page<AdminStudentResponse> getStudents(
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
    );

    AdminStudentResponse getStudentById(Long id);

    void deleteStudent(Long id);
}