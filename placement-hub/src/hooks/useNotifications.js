"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationService } from "@/services/notificationService";

export function useNotifications(userId) {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;

        try {
            setIsLoading(true);

            const data =
                await notificationService.getUserNotifications(userId);

            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const markAsRead = async (notificationId) => {
        try {
            const updated =
                await notificationService.markAsRead(notificationId);

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === notificationId
                        ? updated
                        : notification
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);

            setNotifications((current) =>
                current.filter(
                    (notification) =>
                        notification.id !== notificationId
                )
            );
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    return {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        deleteNotification,
    };
}