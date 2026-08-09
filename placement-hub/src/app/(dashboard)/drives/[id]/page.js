"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Building2,
  MapPin,
  Wallet,
  CalendarClock,
  ListChecks,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format, isPast } from "date-fns";

import DashboardShell from "@/components/layout/DashboardShell";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import CountdownTimer from "@/features/drives/CountdownTimer";

import { driveService } from "@/services/driveService";
import { formService } from "@/services/formService";

import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export default function DriveDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { user } = useAuth();
  const { profile } = useProfile();

  const [drive, setDrive] = useState(null);
  const [form, setForm] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);

  const [applied, setApplied] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const studentId =
      profile?.id ||
      profile?.studentId ||
      user?.studentId;

  // =========================================================
  // GET STUDENT VALUE FOR AUTO-FILL
  // =========================================================

  const getStudentValue = (label) => {
    if (!profile || !label) {
      return null;
    }

    const key = label
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

    const firstName =
        profile?.user?.firstName ||
        profile?.firstName ||
        "";

    const lastName =
        profile?.user?.lastName ||
        profile?.lastName ||
        "";

    const fullName =
        `${firstName} ${lastName}`.trim();

    const email =
        profile?.user?.email ||
        profile?.email ||
        "";

    const values = {
      name: fullName,

      "full name": fullName,

      email: email,

      "email id": email,

      "email address": email,

      "roll number":
          profile?.rollNumber || "",

      rollnumber:
          profile?.rollNumber || "",

      roll:
          profile?.rollNumber || "",

      "phone number":
          profile?.phoneNumber || "",

      phone:
          profile?.phoneNumber || "",

      mobile:
          profile?.phoneNumber || "",

      "mobile number":
          profile?.phoneNumber || "",

      branch:
          profile?.branch || "",

      cgpa:
          profile?.cgpa ?? "",

      backlogs:
          profile?.backlogs ?? "",

      "graduation year":
          profile?.graduationYear ?? "",

      graduationyear:
          profile?.graduationYear ?? "",

      linkedin:
          profile?.linkedinUrl || "",

      "linkedin url":
          profile?.linkedinUrl || "",

      github:
          profile?.githubUrl || "",

      "github url":
          profile?.githubUrl || "",

      portfolio:
          profile?.portfolioUrl || "",

      "portfolio url":
          profile?.portfolioUrl || "",

      resume:
          profile?.resumeUrl || "",

      "resume url":
          profile?.resumeUrl || "",
    };

    if (
        Object.prototype.hasOwnProperty.call(values, key)
    ) {
      return values[key];
    }

    return null;
  };

  // =========================================================
  // LOAD DRIVE
  // =========================================================

  const load = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await driveService.getById(id);
      setDrive(data);
    } catch (err) {
      setError(
          err.message || "Could not load this drive"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // =========================================================
  // CHECK EXISTING APPLICATION
  // =========================================================

  useEffect(() => {
    const checkApplied = async () => {
      if (!studentId || !id) return;

      /*
       * Dynamic form submission is the application flow.
       */
    };

    checkApplied();
  }, [studentId, id]);

  // =========================================================
  // LOAD DYNAMIC FORM
  // =========================================================

  const handleApply = async () => {
    if (!studentId) {
      toast.error("Student profile not found");
      return;
    }

    setFormLoading(true);

    try {
      const { data } = await formService.getByDrive(id);

      const forms = Array.isArray(data)
          ? data
          : [];

      const publishedForm = forms.find(
          (item) => item.status === "PUBLISHED"
      );

      if (!publishedForm) {
        toast.error(
            "Application form is not available for this drive yet."
        );
        return;
      }

      setForm(publishedForm);

      // =====================================================
      // INITIALIZE ANSWERS
      // AUTO-FILL FROM STUDENT PROFILE
      // =====================================================

      const initialAnswers = {};

      (publishedForm.fields || []).forEach((field) => {
        const studentValue =
            getStudentValue(field.label);

        if (
            studentValue !== null &&
            studentValue !== ""
        ) {
          initialAnswers[field.id] =
              String(studentValue);
        } else {
          initialAnswers[field.id] =
              field.defaultValue || "";
        }
      });

      setAnswers(initialAnswers);
      setShowForm(true);

    } catch (err) {
      toast.error(
          err?.response?.data?.message ||
          err?.message ||
          "Could not load application form"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================================================
  // ANSWER CHANGE
  // =========================================================

  const handleAnswerChange = (
      fieldId,
      value
  ) => {
    setAnswers((current) => ({
      ...current,
      [fieldId]: value,
    }));
  };

  // =========================================================
  // SUBMIT FORM
  // =========================================================

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    if (!form) return;

    // Required field validation
    for (const field of form.fields || []) {
      if (
          field.required &&
          (
              !answers[field.id] ||
              String(answers[field.id]).trim() === ""
          )
      ) {
        toast.error(
            `${field.label} is required`
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      await formService.submit(form.id, {
        studentId: Number(studentId),
        answers,
      });

      toast.success(
          "Application submitted successfully!"
      );

      setApplied(true);
      setShowForm(false);

    } catch (err) {
      toast.error(
          err?.response?.data?.message ||
          err?.message ||
          "Could not submit application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
        <DashboardShell title="Drive details">
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </DashboardShell>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !drive) {
    return (
        <DashboardShell title="Drive details">
          <ErrorState onRetry={load} />
        </DashboardShell>
    );
  }

  const deadline = drive.deadline
      ? new Date(drive.deadline)
      : null;

  const expired =
      deadline && isPast(deadline);

  // =========================================================
  // RENDER FIELD
  // =========================================================

  const renderField = (field) => {
    const value =
        answers[field.id] || "";

    const autoFilledValue =
        getStudentValue(field.label);

    const isAutoFilled =
        autoFilledValue !== null &&
        autoFilledValue !== "";

    const commonClass =
        "w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500";

    const autoFilledClass =
        isAutoFilled
            ? " bg-slate-100/10 cursor-not-allowed opacity-80"
            : "";

    // =======================================================
    // TEXTAREA
    // =======================================================

    if (field.fieldType === "TEXTAREA") {
      return (
          <textarea
              value={value}
              onChange={(e) =>
                  handleAnswerChange(
                      field.id,
                      e.target.value
                  )
              }
              placeholder={
                  field.placeholder || ""
              }
              rows={4}
              readOnly={isAutoFilled}
              className={
                  commonClass + autoFilledClass
              }
          />
      );
    }

    // =======================================================
    // NUMBER
    // =======================================================

    if (field.fieldType === "NUMBER") {
      return (
          <input
              type="number"
              value={value}
              onChange={(e) =>
                  handleAnswerChange(
                      field.id,
                      e.target.value
                  )
              }
              placeholder={
                  field.placeholder || ""
              }
              readOnly={isAutoFilled}
              className={
                  commonClass + autoFilledClass
              }
          />
      );
    }

    // =======================================================
    // EMAIL
    // =======================================================

    if (field.fieldType === "EMAIL") {
      return (
          <input
              type="email"
              value={value}
              onChange={(e) =>
                  handleAnswerChange(
                      field.id,
                      e.target.value
                  )
              }
              placeholder={
                  field.placeholder || ""
              }
              readOnly={isAutoFilled}
              className={
                  commonClass + autoFilledClass
              }
          />
      );
    }

    // =======================================================
    // DATE
    // =======================================================

    if (field.fieldType === "DATE") {
      return (
          <input
              type="date"
              value={value}
              onChange={(e) =>
                  handleAnswerChange(
                      field.id,
                      e.target.value
                  )
              }
              readOnly={isAutoFilled}
              className={
                  commonClass + autoFilledClass
              }
          />
      );
    }

    // =======================================================
    // DROPDOWN
    // =======================================================

    if (field.fieldType === "DROPDOWN") {
      const options =
          (field.options || "")
              .split(",")
              .map((option) =>
                  option.trim()
              )
              .filter(Boolean);

      return (
          <select
              value={value}
              onChange={(e) =>
                  handleAnswerChange(
                      field.id,
                      e.target.value
                  )
              }
              disabled={isAutoFilled}
              className={
                  commonClass + autoFilledClass
              }
          >
            <option value="">
              Select an option
            </option>

            {options.map((option) => (
                <option
                    key={option}
                    value={option}
                >
                  {option}
                </option>
            ))}
          </select>
      );
    }

    // =======================================================
    // RADIO
    // =======================================================

    if (field.fieldType === "RADIO") {
      const options =
          (field.options || "")
              .split(",")
              .map((option) =>
                  option.trim()
              )
              .filter(Boolean);

      return (
          <div className="space-y-2">
            {options.map((option) => (
                <label
                    key={option}
                    className="flex items-center gap-2 text-sm"
                >
                  <input
                      type="radio"
                      name={`field-${field.id}`}
                      value={option}
                      checked={
                          value === option
                      }
                      disabled={isAutoFilled}
                      onChange={(e) =>
                          handleAnswerChange(
                              field.id,
                              e.target.value
                          )
                      }
                  />

                  {option}
                </label>
            ))}
          </div>
      );
    }

    // =======================================================
    // CHECKBOX
    // =======================================================

    if (field.fieldType === "CHECKBOX") {
      const options =
          (field.options || "")
              .split(",")
              .map((option) =>
                  option.trim()
              )
              .filter(Boolean);

      const selected = value
          ? value
              .split(",")
              .map((item) =>
                  item.trim()
              )
          : [];

      return (
          <div className="space-y-2">
            {options.map((option) => {
              const checked =
                  selected.includes(option);

              return (
                  <label
                      key={option}
                      className="flex items-center gap-2 text-sm"
                  >
                    <input
                        type="checkbox"
                        checked={checked}
                        disabled={isAutoFilled}
                        onChange={(e) => {
                          let updated;

                          if (e.target.checked) {
                            updated = [
                              ...selected,
                              option,
                            ];
                          } else {
                            updated =
                                selected.filter(
                                    (item) =>
                                        item !== option
                                );
                          }

                          handleAnswerChange(
                              field.id,
                              updated.join(", ")
                          );
                        }}
                    />

                    {option}
                  </label>
              );
            })}
          </div>
      );
    }

    // =======================================================
    // FILE
    // =======================================================

    if (field.fieldType === "FILE") {
      return (
          <input
              type="text"
              value={value}
              onChange={(e) =>
                  handleAnswerChange(
                      field.id,
                      e.target.value
                  )
              }
              placeholder="Enter file URL"
              readOnly={isAutoFilled}
              className={
                  commonClass + autoFilledClass
              }
          />
      );
    }

    // =======================================================
    // TEXT
    // =======================================================

    return (
        <input
            type="text"
            value={value}
            onChange={(e) =>
                handleAnswerChange(
                    field.id,
                    e.target.value
                )
            }
            placeholder={
                field.placeholder || ""
            }
            readOnly={isAutoFilled}
            className={
                commonClass + autoFilledClass
            }
        />
    );
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
      <DashboardShell title="Drive details">

        <button
            onClick={() =>
                router.push("/drives")
            }
            className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to drives
        </button>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ===================================================
            LEFT
        =================================================== */}

          <div className="space-y-6 lg:col-span-2">

            <Card>
              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 text-[var(--primary)] dark:from-blue-500/10 dark:to-purple-500/10">
                  <Building2 className="h-7 w-7" />
                </div>

                <div>
                  <h1
                      className="text-xl font-semibold text-[var(--foreground)]"
                      style={{
                        fontFamily:
                            "var(--font-lexend)",
                      }}
                  >
                    {drive.companyName ||
                        drive.company}
                  </h1>

                  <p className="mt-0.5 text-[var(--muted)]">
                    {drive.role}
                  </p>
                </div>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">

                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Wallet className="h-4 w-4" />
                  {drive.jobPackage || "—"}
                </div>

                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <MapPin className="h-4 w-4" />
                  {drive.jobLocation || "—"}
                </div>

                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <CalendarClock className="h-4 w-4" />
                  {deadline
                      ? format(
                          deadline,
                          "MMM d, yyyy"
                      )
                      : "—"}
                </div>

              </div>
            </Card>

            {drive.driveDescription && (
                <Card>
                  <h3 className="mb-2 font-semibold">
                    About the drive
                  </h3>

                  <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
                    {drive.driveDescription}
                  </p>
                </Card>
            )}

            {drive.jobDescription && (
                <Card>
                  <h3 className="mb-2 font-semibold">
                    About the role
                  </h3>

                  <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
                    {drive.jobDescription}
                  </p>
                </Card>
            )}

            {drive.recruitmentProcess && (
                <Card>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <ListChecks className="h-4 w-4" />
                    Recruitment process
                  </h3>

                  <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
                    {drive.recruitmentProcess}
                  </p>
                </Card>
            )}

            {(
                drive.minCgpa ||
                drive.backlogRestrictions != null ||
                drive.graduationYear ||
                drive.eligibleBranches?.length > 0
            ) && (
                <Card>

                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-4 w-4" />
                    Eligibility
                  </h3>

                  <dl className="space-y-2 text-sm text-[var(--muted)]">

                    {drive.minCgpa && (
                        <div>
                          Min CGPA:{" "}
                          <span className="font-medium text-[var(--foreground)]">
                      {drive.minCgpa}
                    </span>
                        </div>
                    )}

                    {drive.backlogRestrictions != null && (
                        <div>
                          Max backlogs:{" "}
                          <span className="font-medium text-[var(--foreground)]">
                      {drive.backlogRestrictions}
                    </span>
                        </div>
                    )}

                    {drive.graduationYear && (
                        <div>
                          Graduation year:{" "}
                          <span className="font-medium text-[var(--foreground)]">
                      {drive.graduationYear}
                    </span>
                        </div>
                    )}

                    {drive.eligibleBranches?.length > 0 && (
                        <div>
                          Eligible branches:{" "}
                          <span className="font-medium text-[var(--foreground)]">
                      {drive.eligibleBranches.join(
                          ", "
                      )}
                    </span>
                        </div>
                    )}

                  </dl>

                </Card>
            )}

            {drive.requiredSkills && (
                <Card>

                  <h3 className="mb-3 font-semibold">
                    Skills required
                  </h3>

                  <div className="flex flex-wrap gap-2">

                    {drive.requiredSkills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((s) => (
                            <Badge
                                key={s}
                                tone="primary"
                            >
                              {s}
                            </Badge>
                        ))}

                  </div>

                </Card>
            )}

          </div>

          {/* ===================================================
            RIGHT
        =================================================== */}

          <div className="lg:sticky lg:top-24 lg:h-fit">

            <Card>

              <CountdownTimer
                  deadline={drive.deadline}
              />

              <Button
                  className="mt-4 w-full"
                  size="lg"
                  disabled={
                      applied ||
                      expired ||
                      formLoading
                  }
                  onClick={handleApply}
                  icon={
                    applied
                        ? CheckCircle2
                        : undefined
                  }
              >
                {applied
                    ? "Already applied"
                    : expired
                        ? "Applications closed"
                        : formLoading
                            ? "Loading form..."
                            : "Apply now"}
              </Button>

              {applied && (
                  <p className="mt-3 text-center text-xs text-[var(--muted)]">
                    Application submitted successfully.
                  </p>
              )}

            </Card>

          </div>

        </div>

        {/* =====================================================
          DYNAMIC APPLICATION FORM
      ===================================================== */}

        {showForm && form && (

            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">

              <div className="mx-auto my-8 max-w-3xl">

                <Card>

                  <div className="mb-6">

                    <h2 className="text-2xl font-semibold">
                      {form.title}
                    </h2>

                    {form.description && (
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          {form.description}
                        </p>
                    )}

                  </div>

                  <form
                      onSubmit={handleSubmitForm}
                      className="space-y-5"
                  >

                    {(form.fields || [])
                        .slice()
                        .sort(
                            (a, b) =>
                                (a.displayOrder || 0) -
                                (b.displayOrder || 0)
                        )
                        .map((field) => {

                          const autoFilledValue =
                              getStudentValue(
                                  field.label
                              );

                          const isAutoFilled =
                              autoFilledValue !== null &&
                              autoFilledValue !== "";

                          return (
                              <div key={field.id}>

                                <label className="mb-2 block text-sm font-medium">

                                  {field.label}

                                  {field.required && (
                                      <span className="ml-1 text-red-500">
                              *
                            </span>
                                  )}

                                  {isAutoFilled && (
                                      <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                              (from profile)
                            </span>
                                  )}

                                </label>

                                {renderField(field)}

                              </div>
                          );
                        })}

                    {(
                        !form.fields ||
                        form.fields.length === 0
                    ) && (
                        <p className="text-sm text-[var(--muted)]">
                          This form has no fields configured.
                        </p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-5">

                      <Button
                          type="button"
                          onClick={() =>
                              setShowForm(false)
                          }
                          disabled={submitting}
                      >
                        Cancel
                      </Button>

                      <Button
                          type="submit"
                          disabled={submitting}
                      >
                        {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                        ) : (
                            "Submit Application"
                        )}
                      </Button>

                    </div>

                  </form>

                </Card>

              </div>

            </div>
        )}

      </DashboardShell>
  );
}