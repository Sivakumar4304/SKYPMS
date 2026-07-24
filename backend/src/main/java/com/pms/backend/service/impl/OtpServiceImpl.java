package com.pms.backend.service.impl;


import org.springframework.transaction.annotation.Transactional;
import com.pms.backend.entity.Otp;
import com.pms.backend.repository.OtpRepository;
import com.pms.backend.service.EmailService;
import com.pms.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpServiceImpl implements OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Override

    public void generateOtp(String email) {

        String domain = email.contains("@") ? email.substring(email.indexOf('@') + 1).toLowerCase() : "";
        if (!domain.contains(".edu")) {
            throw new IllegalArgumentException("Only .edu email addresses are allowed");
        }

        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        Otp otpEntity = otpRepository.findByEmail(email)
                .orElse(new Otp());

        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setVerified(false);
        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));

        otpRepository.save(otpEntity);

        emailService.sendOtp(email, otp);
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String otp) {

        System.out.println("Email from request = " + email);
        System.out.println("OTP from request   = " + otp);

        Otp otpEntity = otpRepository.findByEmail(email).orElse(null);

        System.out.println("OTP from DB = " + (otpEntity != null ? otpEntity.getOtp() : "NULL"));

        if (otpEntity == null) {
            System.out.println("OTP NOT FOUND");
            return false;
        }

        System.out.println("Expiry = " + otpEntity.getExpiryTime());
        System.out.println("Now    = " + LocalDateTime.now());

        if (otpEntity.getExpiryTime().isBefore(LocalDateTime.now())) {
            System.out.println("OTP EXPIRED");
            return false;
        }

        if (!otpEntity.getOtp().equals(otp)) {
            System.out.println("OTP MISMATCH");
            return false;
        }

        System.out.println("OTP VERIFIED");

        otpRepository.deleteByEmail(email);

        return true;
    }

}