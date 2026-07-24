package com.pms.backend.service.impl;

import com.pms.backend.dto.response.AuthenticationResponse;
import com.pms.backend.dto.request.LoginRequest;
import com.pms.backend.dto.request.RegisterRequest;
import com.pms.backend.entity.User;
import com.pms.backend.enums.Role;
import com.pms.backend.repository.UserRepository;
import com.pms.backend.service.AuthenticationService;
import com.pms.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.pms.backend.service.OtpService;
import com.pms.backend.exception.EmailAlreadyExistsException;
import com.pms.backend.exception.InvalidCredentialsException;
import com.pms.backend.exception.InvalidOtpException;
import org.springframework.security.authentication.BadCredentialsException;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;

    @Override
    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new InvalidOtpException("Invalid or expired OTP");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .message("User registered Successfully")
                .build();
    }

    @Override
    public AuthenticationResponse login(LoginRequest request) {

        try {

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.getEmail(),
                                    request.getPassword()
                            )
                    );

            User user = (User) authentication.getPrincipal();

            String token = jwtService.generateToken(user);

            return AuthenticationResponse.builder()
                    .token(token)
                    .role(user.getRole().name())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .email(user.getEmail())
                    .message("User logged in successfully")
                    .build();

        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }
}
