package com.ghmc.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    private String id;

    private String recipientRole;
    private String recipientEmail;
    private String zoneCode;

    private String title;

    @Column(length = 1000)
    private String message;

    private String type;
    private String grievanceId;

    private LocalDateTime createdAt;
    private boolean readStatus;

    public Notification() {}

    public Notification(String id, String recipientRole, String recipientEmail, String zoneCode,
                        String title, String message, String type, String grievanceId) {
        this.id = id;
        this.recipientRole = recipientRole;
        this.recipientEmail = recipientEmail;
        this.zoneCode = zoneCode;
        this.title = title;
        this.message = message;
        this.type = type;
        this.grievanceId = grievanceId;
        this.createdAt = LocalDateTime.now();
        this.readStatus = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getZoneCode() { return zoneCode; }
    public void setZoneCode(String zoneCode) { this.zoneCode = zoneCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getGrievanceId() { return grievanceId; }
    public void setGrievanceId(String grievanceId) { this.grievanceId = grievanceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isReadStatus() { return readStatus; }
    public void setReadStatus(boolean readStatus) { this.readStatus = readStatus; }
}
