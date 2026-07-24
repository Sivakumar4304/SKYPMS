package com.pms.backend.controller;

import com.pms.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/test-email")
    public String testEmail() {

        emailService.sendOtp(
                "sivakumarboda0@gmail.com",
                "123456"
        );

        return "Email Sent Successfully";
    }
}