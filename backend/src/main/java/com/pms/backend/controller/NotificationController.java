package com.pms.backend.controller;

import com.pms.backend.dto.request.NotificationRequest;
import com.pms.backend.dto.response.NotificationResponse;
import com.pms.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Create notification
    @PostMapping
    public NotificationResponse createNotification(
            @RequestBody NotificationRequest request) {

        return notificationService.createNotification(request);
    }

    // Get notifications for a user
    @GetMapping("/user/{userId}")
    public List<NotificationResponse> getUserNotifications(
            @PathVariable Long userId) {

        return notificationService.getUserNotifications(userId);
    }

    // Mark notification as read
    @PatchMapping("/{notificationId}/read")
    public NotificationResponse markAsRead(
            @PathVariable Long notificationId) {

        return notificationService.markAsRead(notificationId);
    }

    // Delete notification
    @DeleteMapping("/{notificationId}")
    public String deleteNotification(
            @PathVariable Long notificationId) {

        notificationService.deleteNotification(notificationId);

        return "Notification deleted successfully";
    }
}