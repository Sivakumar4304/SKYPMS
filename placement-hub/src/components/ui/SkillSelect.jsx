"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SkillSelect({
  label,
  value = [],
  onChange,
  availableSkills = [],
  error,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim() === ""
    ? availableSkills.filter((s) => !value.includes(s))
    : availableSkills.filter(
        (s) =>
          s.toLowerCase().includes(query.toLowerCase()) &&
          !value.includes(s)
      );

  const trimmed = query.trim();
  const canCreate =
    trimmed.length > 0 &&
    !availableSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase()) &&
    !value.some((v) => v.toLowerCase() === trimmed.toLowerCase());

  const addSkill = (skill) => {
    const normalized = skill.trim();
    if (!normalized) return;
    if (value.some((v) => v.toLowerCase() === normalized.toLowerCase())) return;
    onChange([...value, normalized]);
    setQuery("");
    inputRef.current?.focus();
  };

  const removeSkill = (skill) => {
    onChange(value.filter((v) => v !== skill));
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && trimmed) {
      e.preventDefault();
      // pick first filtered match or create new
      if (filtered.length > 0 && !canCreate) {
        addSkill(filtered[0]);
      } else {
        addSkill(trimmed);
      }
    } else if (e.key === "Backspace" && !query && value.length) {
      removeSkill(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  const showDropdown = open && (filtered.length > 0 || canCreate || (query === "" && availableSkills.length === 0));

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border bg-[var(--surface)] px-2.5 py-2 cursor-text focus-within:border-[var(--primary)]",
          error ? "border-[var(--danger)]" : "border-[var(--border)]"
        )}
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        <AnimatePresence initial={false}>
          {value.map((chip) => (
            <motion.span
              key={chip}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
            >
              {chip}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeSkill(chip); }}
                className="rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length ? "" : "Search or add a skill..."}
          className="min-w-[140px] flex-1 border-none bg-transparent px-1 py-1 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
        />
        <ChevronDown className={cn("h-4 w-4 text-[var(--muted)] shrink-0 transition-transform", open && "rotate-180")} />
      </div>

      {error && <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">{error}</p>}

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg"
            style={{ width: containerRef.current?.offsetWidth }}
          >
            {filtered.map((skill) => (
              <li key={skill}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); addSkill(skill); }}
                  className="w-full px-3.5 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                >
                  {skill}
                </button>
              </li>
            ))}
            {filtered.length === 0 && !canCreate && (
              <li className="px-3.5 py-2 text-sm text-[var(--muted)]">
                Type to add a new skill
              </li>
            )}
            {canCreate && (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); addSkill(trimmed); }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-[var(--primary)] hover:bg-[var(--border)] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add &ldquo;{trimmed}&rdquo;
                </button>
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
