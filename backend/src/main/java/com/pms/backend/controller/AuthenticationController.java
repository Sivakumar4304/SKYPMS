package com.pms.backend.controller;

import com.pms.backend.dto.response.AuthenticationResponse;
import com.pms.backend.dto.request.LoginRequest;
import com.pms.backend.dto.request.RegisterRequest;
import com.pms.backend.service.AuthenticationService;
import com.pms.backend.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final OtpService otpService;

    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam String email) {

        otpService.generateOtp(email);

        return "OTP Sent Successfully";
    }

    @PostMapping("/register")
    public AuthenticationResponse register(@Valid @RequestBody RegisterRequest request){
        return authenticationService.register(request);
    }

    @PostMapping("/login")
    public AuthenticationResponse login(@Valid @RequestBody LoginRequest request){
        return authenticationService.login(request);
    }

}