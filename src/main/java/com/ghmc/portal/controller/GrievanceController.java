package com.ghmc.portal.controller;

import com.ghmc.portal.dto.CreateGrievanceRequest;
import com.ghmc.portal.dto.UpdateGrievanceStatusRequest;
import com.ghmc.portal.model.Grievance;
import com.ghmc.portal.service.GrievanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/grievances")
public class GrievanceController {

    private final GrievanceService grievanceService;

    public GrievanceController(GrievanceService grievanceService) {
        this.grievanceService = grievanceService;
    }

    /**
     * Submit a Grievance (Citizen action - protected by ROLE_CITIZEN)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CITIZEN')")
    public ResponseEntity<Grievance> createGrievance(
            @RequestBody CreateGrievanceRequest request,
            Authentication authentication) {
        String citizenEmail = authentication.getName();
        return ResponseEntity.ok(grievanceService.createGrievance(request, citizenEmail));
    }

    /**
     * Get Grievances Scoped to Active Zone (Multi-Tenant scoping via X-Zone-Id header)
     */
    @GetMapping
    public ResponseEntity<List<Grievance>> getZoneGrievances() {
        return ResponseEntity.ok(grievanceService.getGrievancesByActiveZone());
    }

    /**
     * Get Citizen's Own Submitted Grievances
     */
    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_CITIZEN')")
    public ResponseEntity<List<Grievance>> getMyGrievances(Authentication authentication) {
        return ResponseEntity.ok(grievanceService.getCitizenGrievances(authentication.getName()));
    }

    /**
     * Update Grievance Status - PROTECTED BY RBAC!
     * Strictly restricted to Ward Inspectors (ROLE_WARD_INSPECTOR).
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_WARD_INSPECTOR')")
    public ResponseEntity<Grievance> updateStatus(
            @PathVariable String id,
            @RequestBody UpdateGrievanceStatusRequest request) {
        return ResponseEntity.ok(grievanceService.updateGrievanceStatus(id, request.getStatus()));
    }
}
