package com.pms.backend.controller;

import com.pms.backend.service.CollegeResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/hello")
@RestController
@RequiredArgsConstructor
public class Test {
    private final CollegeResultService collegeResultService;
//    @GetMapping("/hello")
//    public String hello(){
//        return "Hello";
//    }


    @GetMapping
    public String test() {
        collegeResultService.fetchResults("23PA1A4219");
        return "Done";
    }
}
