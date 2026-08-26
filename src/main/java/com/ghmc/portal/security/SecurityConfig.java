package com.ghmc.portal.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security Configuration.
 * Implements Dual Authentication:
 * 1. Session Auth (HTTP-Only cookies) for Officials under /api/v1/auth/official/**
 * 2. JWT Stateless Auth for Citizens under /api/v1/citizen/** and general APIs.
 * Also enables RBAC via @PreAuthorize method annotations.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            // Configure session creation: IF_REQUIRED allows official sessions to use JSESSIONID cookies
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                // Static resources, images, index page, and dashboard HTML
                .requestMatchers("/", "/index.html", "/dashboard.html", "/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
                // Public auth, zone list, public grievance reading, websockets, notifications, and AI API
                .requestMatchers("/api/v1/auth/**", "/api/v1/zones/**", "/ws/**", "/api/v1/notifications/**", "/api/v1/ai/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/grievances").permitAll()
                // All other APIs require authentication (checked via JWT or Session)
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
