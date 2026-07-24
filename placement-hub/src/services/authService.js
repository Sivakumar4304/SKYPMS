
import api from "./api";

export const authService = {
  sendOtp: (email) =>
      api.post("/api/auth/send-otp", null, {
        params: { email },
      }),

  register: (payload) => api.post("/api/auth/register", payload),

  login: (payload) => api.post("/api/auth/login", payload),
};