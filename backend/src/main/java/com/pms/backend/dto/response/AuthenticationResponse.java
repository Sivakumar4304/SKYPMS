package com.pms.backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthenticationResponse {
    private String message;
    private String token;
    private String role;
    private String firstName;
    private String lastName;
    private String email;
    private Long userId;
}