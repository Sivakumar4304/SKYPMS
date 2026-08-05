package com.pms.backend.service;

import com.pms.backend.dto.response.AuthenticationResponse;
import com.pms.backend.dto.request.LoginRequest;
import com.pms.backend.dto.request.RegisterRequest;

public interface AuthenticationService {
    AuthenticationResponse register(RegisterRequest request);
    AuthenticationResponse login(LoginRequest request);
    void resetPassword(String email, String otp, String newPassword);
}
