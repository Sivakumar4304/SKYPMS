package com.pms.backend.service;

import com.pms.backend.dto.CollegeResultResponse;
import org.springframework.stereotype.Service;

@Service
public interface CollegeResultService {
    CollegeResultResponse fetchResults(String rollNumber);
}
