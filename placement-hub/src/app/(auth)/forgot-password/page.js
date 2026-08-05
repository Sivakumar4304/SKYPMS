"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AuthLayout from "@/components/layout/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import api from "@/services/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const sendOtp = async () => {
        if (!email) {
            toast.error("Enter your email");
            return;
        }

        try {
            setLoading(true);

            await api.post("/api/auth/send-otp", null, {
                params: { email },
            });

            setOtpSent(true);
            toast.success("OTP sent to your email");
        } catch (err) {
            toast.error(err.response?.data || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            await api.post("/api/auth/reset-password", {
                email,
                otp,
                newPassword,
            });

            toast.success("Password reset successfully");
            window.location.href = "/login";
        } catch (err) {
            toast.error(err.response?.data || "Password reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Verify your email and choose a new password."
        >
            <form onSubmit={resetPassword} className="space-y-5">

                <Input
                    label="Email"
                    type="email"
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                />

                {!otpSent ? (
                    <Button
                        type="button"
                        className="w-full"
                        onClick={sendOtp}
                        isLoading={loading}
                    >
                        Send OTP
                    </Button>
                ) : (
                    <>
                        <Input
                            label="OTP"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />

                        <Input
                            label="New password"
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={loading}
                        >
                            Reset password
                        </Button>
                    </>
                )}

                <p className="text-center text-sm">
                    <Link
                        href="/login"
                        className="text-[var(--primary)] hover:underline"
                    >
                        Back to Sign in
                    </Link>
                </p>

            </form>
        </AuthLayout>
    );
}