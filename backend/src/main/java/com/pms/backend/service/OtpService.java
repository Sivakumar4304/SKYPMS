package com.pms.backend.service;

public interface OtpService {

    void generateOtp(String email);

    boolean verifyOtp(String email, String otp);

}