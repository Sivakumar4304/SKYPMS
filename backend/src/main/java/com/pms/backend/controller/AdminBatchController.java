package com.pms.backend.controller;

import com.pms.backend.dto.response.StudentResponse;
import com.pms.backend.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/batches")
@RequiredArgsConstructor
public class AdminBatchController {

    private final StudentService studentService;

    @GetMapping("/{graduationYear}/students")
    public List<StudentResponse> getStudentsByBatch(
            @PathVariable Integer graduationYear) {

        return studentService.getStudentsByGraduationYear(graduationYear);
    }
    @GetMapping
    public List<Integer> getAvailableBatches() {
        return studentService.getAvailableBatches();
    }
}