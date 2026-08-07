"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Phone, Calendar, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import SkillSelect from "@/components/ui/SkillSelect";
import { GENDERS } from "@/constants";
import { studentService } from "@/services/studentService";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Select your gender"),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
});

const STEPS = ["Personal details", "Academic details", "Skills & Links"];

export default function ProfileWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const rollNumber = user?.email
    ? user.email.substring(0, user.email.indexOf('@')).substring(0, 10).toUpperCase()
    : "";
  const [step, setStep] = useState(0);
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    studentService.fetchSkills()
      .then(({ data }) => {
        console.log("[ProfileWizard] Fetched skills:", data);
        setAvailableSkills(data || []);
      })
      .catch((err) => {
        console.error("[ProfileWizard] Failed to fetch skills:", err);
      });
  }, []);
  const [fetchingResults, setFetchingResults] = useState(false);
  const [resultsFetched, setResultsFetched] = useState(false);
  const [fetchedCgpa, setFetchedCgpa] = useState(null);
  const [fetchedBacklogs, setFetchedBacklogs] = useState(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), mode: "onBlur" });

  const gender = watch("gender");

  const handleFetchResults = async () => {
    if (!rollNumber) {
      toast.error("Could not determine roll number from your email");
      return;
    }
    setFetchingResults(true);
    try {
      const { data } = await studentService.fetchResults(rollNumber);
      setFetchedCgpa(data.cgpa);
      setFetchedBacklogs(data.totalBacklogs);
      setResultsFetched(true);
      toast.success("Results fetched successfully");
    } catch {
      toast.error("Could not fetch results. Check your roll number and try again.");
    } finally {
      setFetchingResults(false);
    }
  };

  const stepFields = [
    ["phoneNumber", "dateOfBirth", "gender"],
    [],
    [],
  ];

  const goNext = async () => {
    const valid = await trigger(stepFields[step]);
    if (!valid) return;
    if (step === 1 && !resultsFetched) {
      toast.error("Please fetch your results before continuing");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (values) => {
    if (skills.length === 0) {
      toast.error("Add at least one skill");
      return;
    }
    setSubmitting(true);
    try {
      await studentService.createProfile({
        ...values,
        // graduationYear: Number(values.graduationYear),
        backlogs: fetchedBacklogs,
        cgpa: fetchedCgpa,
        skills,
      });
      toast.success("Profile created successfully");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message || "Could not save your profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i < step
                    ? "gradient-brand text-white"
                    : i === step
                    ? "border-2 border-[var(--primary)] text-[var(--primary)]"
                    : "border border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-sm font-medium sm:block ${i === step ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-[var(--border)]" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <Input
                label="Phone number"
                icon={Phone}
                placeholder="9876543210"
                required
                error={errors.phoneNumber?.message}
                {...register("phoneNumber")}
              />
              <Input
                label="Date of birth"
                type="date"
                icon={Calendar}
                required
                error={errors.dateOfBirth?.message}
                {...register("dateOfBirth")}
              />
              <SegmentedControl
                label="Gender"
                options={GENDERS}
                value={gender}
                onChange={(v) => setValue("gender", v, { shouldValidate: true })}
                error={errors.gender?.message}
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--border)] px-3.5 py-3 opacity-60">
                  <p className="text-xs font-medium text-[var(--muted)] mb-1">Roll number</p>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{rollNumber}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--border)] px-3.5 py-3 opacity-60">
                  <p className="text-xs font-medium text-[var(--muted)] mb-1">Email</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                icon={RefreshCw}
                isLoading={fetchingResults}
                onClick={handleFetchResults}
                className="w-full"
              >
                Fetch results
              </Button>
              {resultsFetched ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--border)] px-3.5 py-3 opacity-60">
                    <p className="text-xs font-medium text-[var(--muted)] mb-1">CGPA</p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{fetchedCgpa}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--border)] px-3.5 py-3 opacity-60">
                    <p className="text-xs font-medium text-[var(--muted)] mb-1">Active backlogs</p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{fetchedBacklogs}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--muted)] text-center">
                  CGPA and backlogs will be auto-filled after fetching results.
                </p>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <SkillSelect
                label="Skills"
                value={skills}
                onChange={setSkills}
                availableSkills={availableSkills}
              />
              <Input
                  label="GitHub"
                  placeholder="https://github.com/username"
                  {...register("githubUrl")}
              />

              <Input
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/username"
                  {...register("linkedinUrl")}
              />

              <Input
                  label="Portfolio"
                  placeholder="https://yourportfolio.com"
                  {...register("portfolioUrl")}
              />
              <p className="text-xs text-[var(--muted)]">
                You can upload your photo and resume right after creating your profile.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            icon={ChevronLeft}
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            className={step === 0 ? "invisible" : ""}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" icon={ChevronRight} iconPosition="right" onClick={goNext}>
              Continue
            </Button>
          ) : (
            <Button type="submit" isLoading={submitting} icon={Check} iconPosition="right">
              Create profile
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
