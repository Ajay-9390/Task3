package com.ghmc.portal.service;

import com.ghmc.portal.config.TenantContext;
import com.ghmc.portal.dto.CreateGrievanceRequest;
import com.ghmc.portal.model.Grievance;
import com.ghmc.portal.model.GrievanceStatus;
import com.ghmc.portal.model.User;
import com.ghmc.portal.model.Zone;
import com.ghmc.portal.repository.GrievanceRepository;
import com.ghmc.portal.repository.UserRepository;
import com.ghmc.portal.repository.ZoneRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class GrievanceService {

    private final GrievanceRepository grievanceRepository;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final NotificationService notificationService;

    public GrievanceService(GrievanceRepository grievanceRepository,
                            UserRepository userRepository,
                            ZoneRepository zoneRepository,
                            NotificationService notificationService) {
        this.grievanceRepository = grievanceRepository;
        this.userRepository = userRepository;
        this.zoneRepository = zoneRepository;
        this.notificationService = notificationService;
    }

    /**
     * Submit a new grievance (Citizen action)
     */
    public Grievance createGrievance(CreateGrievanceRequest request, String citizenEmail) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new IllegalArgumentException("Citizen not found: " + citizenEmail));

        String targetZoneCode = request.getZoneCode() != null ? request.getZoneCode().toUpperCase() : TenantContext.getCurrentTenant();
        Zone zone = zoneRepository.findByCode(targetZoneCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid zone code: " + targetZoneCode));

        Grievance grievance = new Grievance(
                "grv-" + UUID.randomUUID().toString().substring(0, 8),
                request.getTitle(),
                request.getCategory(),
                request.getDescription(),
                GrievanceStatus.SUBMITTED,
                request.getLocation(),
                request.getWardNo(),
                citizen,
                zone
        );

        Grievance saved = grievanceRepository.save(grievance);
        
        // Trigger Real-Time WebSocket Notification to Officials
        try {
            notificationService.notifyGrievanceSubmitted(saved);
        } catch (Exception e) {
            System.err.println("Notification dispatch warning: " + e.getMessage());
        }

        return saved;
    }

    /**
     * Get grievances scoped to the active Multi-Tenant Zone context
     */
    public List<Grievance> getGrievancesByActiveZone() {
        String activeZone = TenantContext.getCurrentTenant();
        if (activeZone == null || activeZone.isBlank()) {
            activeZone = "KHAIRATABAD";
        }
        return grievanceRepository.findByZoneCodeOrderByCreatedAtDesc(activeZone);
    }

    /**
     * Get grievances submitted by a specific citizen
     */
    public List<Grievance> getCitizenGrievances(String citizenEmail) {
        return grievanceRepository.findByCitizenEmailOrderByCreatedAtDesc(citizenEmail);
    }

    /**
     * Get all grievances across all zones (Super Admin action)
     */
    public List<Grievance> getAllGrievances() {
        return grievanceRepository.findAll();
    }

    /**
     * Get grievances by explicit zone code
     */
    public List<Grievance> getGrievancesByZoneCode(String zoneCode) {
        return grievanceRepository.findByZoneCodeOrderByCreatedAtDesc(zoneCode.toUpperCase());
    }

    /**
     * Update Grievance Status (Protected by RBAC: Ward Inspectors)
     */
    public Grievance updateGrievanceStatus(String grievanceId, GrievanceStatus newStatus) {
        Grievance grievance = grievanceRepository.findById(grievanceId)
                .orElseThrow(() -> new IllegalArgumentException("Grievance not found with ID: " + grievanceId));

        grievance.setStatus(newStatus);
        Grievance saved = grievanceRepository.save(grievance);

        // Trigger Real-Time WebSocket Notification to Reporting Citizen and Officials
        try {
            notificationService.notifyGrievanceStatusUpdated(saved);
        } catch (Exception e) {
            System.err.println("Notification status dispatch warning: " + e.getMessage());
        }

        return saved;
    }
}
