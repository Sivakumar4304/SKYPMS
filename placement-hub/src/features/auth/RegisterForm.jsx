"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { authService } from "@/services/authService";

const schema = z
    .object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().min(1, "Email is required").email("Enter a valid email").refine((v) => {
            const domain = v.split('@')[1];
            return domain && domain.toLowerCase().includes('.edu');
        }, "Only .edu email addresses are allowed"),
        otp: z.string().length(6, "Enter the 6-digit OTP"),
        password: z.string().min(8, "At least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

function scorePassword(pwd = "") {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
}

const STRENGTH_LABEL = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = [
    "bg-slate-200",
    "bg-rose-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
];

export default function RegisterForm() {
    const { register: registerUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const password = watch("password", "");
    const email = watch("email", "");

    const strength = useMemo(() => scorePassword(password), [password]);

    const sendOtp = async () => {
        if (!email) {
            toast.error("Please enter your email first.");
            return;
        }
        if (!email.split('@')[1]?.toLowerCase().includes('.edu')) {
            toast.error("Only .edu email addresses are allowed.");
            return;
        }

        try {
            setOtpLoading(true);

            await authService.sendOtp(email);

            toast.success("OTP sent successfully!");

            setCountdown(60);

            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            toast.error(err.message || "Failed to send OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const onSubmit = async ({ confirmPassword, ...values }) => {
        setLoading(true);

        try {
            await registerUser(values);
        } catch (err) {
            toast.error(err.message || "Could not create your account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="First name"
                    icon={User}
                    placeholder="Ada"
                    error={errors.firstName?.message}
                    {...register("firstName")}
                />

                <Input
                    label="Last name"
                    icon={User}
                    placeholder="Lovelace"
                    error={errors.lastName?.message}
                    {...register("lastName")}
                />
            </div>

            <div className="flex items-end gap-3">
                <div className="flex-1">
                    <Input
                        label="Email"
                        type="email"
                        icon={Mail}
                        placeholder="you@college.edu"
                        error={errors.email?.message}
                        {...register("email")}
                    />
                </div>

                <Button
                    type="button"
                    onClick={sendOtp}
                    disabled={!email || otpLoading || countdown > 0}
                >

                    {otpLoading
                        ? "Sending..."
                        : countdown > 0
                            ? `Resend (${countdown})`
                            : "Send OTP"}
                </Button>
            </div>

            <Input
                label="OTP"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                error={errors.otp?.message}
                {...register("otp")}
            />

            <div>
                <Input
                    label="Password"
                    type="password"
                    icon={Lock}
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register("password")}
                />

                {password && (
                    <div className="mt-2">
                        <div className="flex h-1.5 gap-1">
                            {[0, 1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex-1 rounded-full transition-colors",
                                        i < strength
                                            ? STRENGTH_COLOR[strength]
                                            : "bg-slate-200 dark:bg-white/10"
                                    )}
                                />
                            ))}
                        </div>

                        <p className="mt-1 text-xs text-[var(--muted)]">
                            {STRENGTH_LABEL[strength]}
                        </p>
                    </div>
                )}
            </div>

            <Input
                label="Confirm password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
            />

            <Button
                type="submit"
                className="w-full"
                isLoading={loading}
                icon={ArrowRight}
                iconPosition="right"
            >
                Create account
            </Button>
        </form>
    );
}