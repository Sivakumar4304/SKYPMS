package com.pms.backend.service;

public interface EmailService {

    void sendOtp(String email, String otp);

}