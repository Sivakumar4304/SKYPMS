package com.pms.backend.controller;

import com.pms.backend.dto.response.AdminStudentResponse;
import com.pms.backend.enums.Branch;
import com.pms.backend.service.AdminStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    @GetMapping
    public Page<AdminStudentResponse> getStudents(

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            Branch branch,

            @RequestParam(required = false)
            Double minCgpa,

            @RequestParam(required = false)
            Double maxCgpa,

            @RequestParam(required = false)
            String skill,

            @RequestParam(required = false)
            Boolean placed,

            @RequestParam(required = false)
            Integer graduationYear,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "id")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String direction
    ) {

        return adminStudentService.getStudents(
                search,
                branch,
                minCgpa,
                maxCgpa,
                skill,
                placed,
                graduationYear,
                page,
                size,
                sortBy,
                direction
        );
    }

    @GetMapping("/{id}")
    public AdminStudentResponse getStudentById(
            @PathVariable Long id
    ) {
        return adminStudentService.getStudentById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteStudent(
            @PathVariable Long id
    ) {
        adminStudentService.deleteStudent(id);
    }
}