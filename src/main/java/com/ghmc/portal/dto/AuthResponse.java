package com.ghmc.portal.dto;

public class AuthResponse {
    private String token; // Present for JWT citizen login, null for session login
    private String message;
    private String email;
    private String fullName;
    private String role;
    private String zoneCode;

    public AuthResponse() {}

    public AuthResponse(String token, String message, String email, String fullName, String role, String zoneCode) {
        this.token = token;
        this.message = message;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.zoneCode = zoneCode;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getZoneCode() { return zoneCode; }
    public void setZoneCode(String zoneCode) { this.zoneCode = zoneCode; }
}
