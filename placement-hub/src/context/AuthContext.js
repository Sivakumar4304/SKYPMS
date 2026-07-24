"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authService } from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("ph_user");
      const token = localStorage.getItem("ph_token");
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore corrupt storage
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistSession = useCallback((token, userPayload) => {
    localStorage.setItem("ph_token", token);
    localStorage.setItem("ph_user", JSON.stringify(userPayload));
    setUser(userPayload);
  }, []);

    const login = useCallback(
        async ({ email, password }) => {
            try {
                const { data } = await authService.login({ email, password });

                const token = data.token || data.accessToken || data.jwt;

                const userPayload = data.user || {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                    studentId: data.studentId,
                    hasProfile: data.hasProfile,
                };

                persistSession(token, userPayload);
                toast.success(`Welcome back, ${userPayload.firstName || "there"}!`);
                router.push("/dashboard");
                return userPayload;

            } catch (error) {
                throw new Error(
                    error.response?.data || "Invalid email or password"
                );
            }
        },
        [persistSession, router]
    );

  const register = useCallback(
    async (payload) => {
      const { data } = await authService.register(payload);
      const token = data.token || data.accessToken || data.jwt;
      const userPayload = data.user || {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        role: data.role || "STUDENT",
      };
      if (token) {
        persistSession(token, userPayload);
      }
      toast.success("Account created. Let's set up your profile.");
      router.push("/profile/create");
      return userPayload;
    },
    [persistSession, router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("ph_token");
    localStorage.removeItem("ph_user");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
