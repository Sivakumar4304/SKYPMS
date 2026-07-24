"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const Input = forwardRef(
  (
    { label, error, hint, icon: Icon, type = "text", className, required, disabled, ...props },
    ref
  ) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (show ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            {label}
            {required && <span className="text-[var(--danger)]"> *</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          )}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={cn(
              "h-11 w-full rounded-xl border bg-[var(--surface)] px-3.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] transition-all duration-150 focus-ring",
              Icon && "pl-10",
              isPassword && "pr-10",
              disabled && "cursor-not-allowed opacity-60 bg-[var(--border)]",
              error
                ? "border-[var(--danger)] focus:border-[var(--danger)]"
                : "border-[var(--border)] focus:border-[var(--primary)]",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-[var(--muted)]">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;
