package com.pms.backend.service;

import com.pms.backend.dto.request.NotificationRequest;
import com.pms.backend.dto.response.NotificationResponse;
import com.pms.backend.entity.Notification;
import com.pms.backend.entity.User;
import com.pms.backend.repository.NotificationRepository;
import com.pms.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Create notification
    public NotificationResponse createNotification(NotificationRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .title(request.getTitle())
                .message(request.getMessage())
                .isRead(false)
                .build();

        Notification savedNotification =
                notificationRepository.save(notification);

        return mapToResponse(savedNotification);
    }

    // Get all notifications of a user
    public List<NotificationResponse> getUserNotifications(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Mark notification as read
    public NotificationResponse markAsRead(Long notificationId) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));

        notification.setIsRead(true);

        Notification updatedNotification =
                notificationRepository.save(notification);

        return mapToResponse(updatedNotification);
    }

    // Delete notification
    public void deleteNotification(Long notificationId) {

        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found");
        }

        notificationRepository.deleteById(notificationId);
    }

    // Convert Entity to Response DTO
    private NotificationResponse mapToResponse(Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}