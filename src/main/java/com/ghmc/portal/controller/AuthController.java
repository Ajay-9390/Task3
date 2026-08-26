package com.ghmc.portal.controller;

import com.ghmc.portal.dto.AuthResponse;
import com.ghmc.portal.dto.LoginRequest;
import com.ghmc.portal.dto.RegisterCitizenRequest;
import com.ghmc.portal.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Citizen Register (JWT)
     */
    @PostMapping("/citizen/register")
    public ResponseEntity<AuthResponse> registerCitizen(@RequestBody RegisterCitizenRequest request) {
        return ResponseEntity.ok(authService.registerCitizen(request));
    }

    /**
     * Citizen Login (Returns JWT Bearer Token)
     */
    @PostMapping("/citizen/login")
    public ResponseEntity<AuthResponse> loginCitizen(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.loginCitizen(request));
    }

    /**
     * Official Login (Sets HTTP-Only JSESSIONID Cookie)
     */
    @PostMapping("/official/login")
    public ResponseEntity<AuthResponse> loginOfficial(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.loginOfficial(request, httpRequest));
    }

    /**
     * Official Logout (Destroys Session)
     */
    @PostMapping("/official/logout")
    public ResponseEntity<String> logoutOfficial(HttpServletRequest httpRequest) {
        authService.logoutOfficial(httpRequest);
        return ResponseEntity.ok("Logged out official session successfully");
    }
}
