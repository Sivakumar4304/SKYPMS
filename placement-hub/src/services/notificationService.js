import api from "./api";

export const notificationService = {

    getUserNotifications: async (userId) => {
        const response = await api.get(
            `/api/notifications/user/${userId}`
        );

        return response.data;
    },

    markAsRead: async (notificationId) => {
        const response = await api.patch(
            `/api/notifications/${notificationId}/read`
        );

        return response.data;
    },

    deleteNotification: async (notificationId) => {
        const response = await api.delete(
            `/api/notifications/${notificationId}`
        );

        return response.data;
    },
};