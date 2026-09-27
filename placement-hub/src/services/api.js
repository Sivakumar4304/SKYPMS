import axios from "axios";
import { API_BASE_URL } from "@/constants";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("ph_token");
        const isAuthEndpoint = config.url?.startsWith("/api/auth/");

        if (token && !isAuthEndpoint) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    (error) => {
        const status = error?.response?.status;

        if (typeof window !== "undefined") {
            if (status === 401) {
                localStorage.removeItem("ph_token");
                localStorage.removeItem("ph_user");

                if (!window.location.pathname.startsWith("/login")) {
                    window.location.href = "/login";
                }
            }
        }

        let message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            (typeof error?.response?.data === "string"
                ? error.response.data
                : null);

        if (!message) {
            if (status === 403) {
                message = "You don't have permission to do that.";
            } else if (status === 400) {
                message = "Invalid request.";
            } else if (status === 404) {
                message = "Requested resource was not found.";
            } else if (status === 500) {
                message =
                    "Something went wrong on our end. Please try again.";
            } else {
                message = "Something went wrong. Please try again.";
            }
        }

        return Promise.reject({
            ...error,
            message,
            status,
        });
    }
);

export default api;