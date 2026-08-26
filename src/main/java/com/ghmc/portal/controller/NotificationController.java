package com.ghmc.portal.controller;

import com.ghmc.portal.model.Notification;
import com.ghmc.portal.model.User;
import com.ghmc.portal.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        String email = "citizen.ravi@gmail.com";
        String role = "ROLE_CITIZEN";

        if (session != null && session.getAttribute("OFFICIAL_USER") != null) {
            User official = (User) session.getAttribute("OFFICIAL_USER");
            email = official.getEmail();
            role = official.getRole().name();
        }

        List<Notification> notifications = notificationService.getUserNotifications(email, role);
        return ResponseEntity.ok(notifications);
    }
}
