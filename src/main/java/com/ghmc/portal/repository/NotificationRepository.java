package com.ghmc.portal.repository;

import com.ghmc.portal.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    @Query("SELECT n FROM Notification n WHERE n.recipientEmail = :email OR n.recipientRole = :role OR n.recipientRole = 'ROLE_MUNICIPAL_COMMISSIONER' ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsForUser(@Param("email") String email, @Param("role") String role, Pageable pageable);
}
