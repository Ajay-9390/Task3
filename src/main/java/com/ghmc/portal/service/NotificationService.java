package com.ghmc.portal.service;

import com.ghmc.portal.model.Grievance;
import com.ghmc.portal.model.GrievanceStatus;
import com.ghmc.portal.model.Notification;
import com.ghmc.portal.repository.NotificationRepository;
import com.ghmc.portal.websocket.NotificationHandler;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationHandler notificationHandler;
    private final com.ghmc.portal.repository.UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationHandler notificationHandler,
                               com.ghmc.portal.repository.UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.notificationHandler = notificationHandler;
        this.userRepository = userRepository;
    }

    /**
     * Notify the specific assigned Ward Inspector for selected ward, along with Zonal Commissioner and Super Admin.
     */
    public void notifyGrievanceSubmitted(Grievance g) {
        String zoneCode = g.getZone() != null ? g.getZone().getCode() : "KHAIRATABAD";
        String selectedWard = g.getWardNo();
        String title = "🚨 New Civic Grievance Reported";
        String message = String.format("New complaint '%s' (ID: %s) filed in %s Zone (%s). Category: %s.",
                g.getTitle(), g.getId(), zoneCode, selectedWard, g.getCategory());

        // Find specific Ward Inspector assigned to this ward
        String targetInspectorEmail = null;
        if (selectedWard != null) {
            List<com.ghmc.portal.model.User> inspectors = userRepository.findByRoleAndAssignedWard(
                    com.ghmc.portal.model.Role.ROLE_WARD_INSPECTOR, selectedWard);
            if (!inspectors.isEmpty()) {
                targetInspectorEmail = inspectors.get(0).getEmail();
            }
        }

        Notification notif = new Notification(
                "ntf-" + UUID.randomUUID().toString().substring(0, 8),
                targetInspectorEmail != null ? null : "ROLE_WARD_INSPECTOR",
                targetInspectorEmail,
                zoneCode,
                title,
                message,
                "NEW_GRIEVANCE",
                g.getId()
        );

        notificationRepository.save(notif);
        notificationHandler.broadcastNotification(notif);
    }

    /**
     * Notify Reporting Citizen, Ward Inspector, Zonal Commissioner, and Municipal Commissioner when status changes.
     */
    public void notifyGrievanceStatusUpdated(Grievance g) {
        String zoneCode = g.getZone() != null ? g.getZone().getCode() : "KHAIRATABAD";
        boolean isResolved = g.getStatus() == GrievanceStatus.RESOLVED;

        String title = isResolved ? "✅ Grievance Resolved" : "ℹ️ Complaint Status Updated";
        String citizenEmail = g.getCitizen() != null ? g.getCitizen().getEmail() : null;

        String message = String.format("Complaint '%s' (ID: %s) in %s Zone has been updated to %s.",
                g.getTitle(), g.getId(), zoneCode, g.getStatus().name());

        Notification notif = new Notification(
                "ntf-" + UUID.randomUUID().toString().substring(0, 8),
                isResolved ? "ROLE_CITIZEN" : "ALL_ROLES",
                citizenEmail,
                zoneCode,
                title,
                message,
                isResolved ? "RESOLVED" : "STATUS_UPDATED",
                g.getId()
        );

        notificationRepository.save(notif);
        notificationHandler.broadcastNotification(notif);
    }

    public List<Notification> getUserNotifications(String email, String role) {
        return notificationRepository.findNotificationsForUser(
                email, role, org.springframework.data.domain.PageRequest.of(0, 10)
        );
    }
}
