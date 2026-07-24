package com.pms.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    @NotBlank(message = "First name is required")
    private String firstName;
    private String lastName;
    private String otp;
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid Email format")
    @jakarta.validation.constraints.Pattern(regexp = "^[^@]+@.*\\.edu.*$", message = "Only .edu email addresses are allowed")
    private String email;
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must contain at least 8 characters")
    private String password;
}
