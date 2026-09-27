package com.pms.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider(userDetailsService);

        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                List.of(
                        "http://localhost:3000",
                        "http://localhost:3001"
                )
        );

        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PATCH",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        return http
                .cors(cors ->
                        cors.configurationSource(corsConfigurationSource())
                )

                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // Authentication
                        // =========================
                        .requestMatchers("/api/auth/**")
                        .permitAll()

                        .requestMatchers("/hello")
                        .permitAll()

                        // =========================
                        // Student Dashboard
                        // =========================
                        .requestMatchers("/dashboard/student/**")
                        .hasAnyRole("STUDENT", "ADMIN")

                        // =========================
                        // Admin Dashboard
                        // =========================
                        .requestMatchers("/dashboard/admin/**")
                        .hasRole("ADMIN")

                        // =========================
                        // Admin APIs
                        // =========================
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // =========================
                        // Companies
                        // =========================

                        // Anyone authenticated can view companies
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/companies",
                                "/api/companies/**"
                        )
                        .authenticated()

                        // Only ADMIN can create/update/delete companies
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/companies",
                                "/api/companies/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/companies",
                                "/api/companies/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/companies",
                                "/api/companies/**"
                        )
                        .hasRole("ADMIN")

                        // =========================
                        // Placement Drives
                        // =========================

                        // Authenticated users can view drives
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/drives",
                                "/api/drives/**"
                        )
                        .authenticated()

                        // Only ADMIN can modify drives
                        .requestMatchers("/api/drives/**")
                        .hasRole("ADMIN")

                        // =========================
                        // Everything else
                        // =========================
                        .anyRequest()
                        .authenticated()
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authenticationProvider(authenticationProvider())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();
    }
}