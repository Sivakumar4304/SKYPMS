"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export default function LoginForm() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { remember: true } });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await login(values);
    }catch (err) {
        toast.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Email"
        type="email"
        icon={Mail}
        placeholder="you@college.edu"
        autoFocus
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        icon={Lock}
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-[var(--muted)]">
          <input type="checkbox" className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]" {...register("remember")} />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-medium text-[var(--primary)] hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full" isLoading={loading} icon={ArrowRight} iconPosition="right">
        Sign in
      </Button>
    </form>
  );
}
