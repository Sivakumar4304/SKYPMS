"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Pencil, X, Save, Phone, Calendar, RefreshCw } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import SegmentedControl from "@/components/ui/SegmentedControl";
import SearchableSelect from "@/components/ui/SearchableSelect";
import SkillSelect from "@/components/ui/SkillSelect";
import ImageUpload from "@/components/upload/ImageUpload";
import ResumeUpload from "@/components/upload/ResumeUpload";
import { BRANCHES, GENDERS } from "@/constants";
import { studentService } from "@/services/studentService";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function ProfileView({ profile, onUpdated }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingResults, setFetchingResults] = useState(false);
  const [resultsFetched, setResultsFetched] = useState(false);
  const [fetchedCgpa, setFetchedCgpa] = useState(null);
  const [fetchedBacklogs, setFetchedBacklogs] = useState(null);
  const [skills, setSkills] = useState(profile.skills || []);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [branch, setBranch] = useState(profile.branch || "");
  const [gender, setGender] = useState(profile.gender || "");

  const { register, handleSubmit, reset } = useForm({ defaultValues: profile });

  useEffect(() => {
    reset(profile);
    setSkills(profile.skills || []);
    setBranch(profile.branch || "");
    setGender(profile.gender || "");
    setResultsFetched(false);
  }, [profile, reset]);

  useEffect(() => {
    studentService.fetchSkills()
      .then(({ data }) => {
        console.log("[ProfileView] Fetched skills:", data);
        setAvailableSkills(data || []);
      })
      .catch((err) => {
        console.error("[ProfileView] Failed to fetch skills:", err);
      });
  }, []);

  const handleFetchResults = async () => {
    const roll = profile.rollNumber;
    if (!roll) {
      toast.error("Roll number not found on your profile");
      return;
    }
    setFetchingResults(true);
    try {
      const { data } = await studentService.fetchResults(roll);
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

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const { data } = await studentService.updateProfile({
        ...values,
        branch,
        gender,
        skills,
        backlogs: Number(values.backlogs),
        cgpa: Number(values.cgpa),
      });
      toast.success("Profile updated");
      onUpdated?.(data || { ...profile, ...values, branch, gender, skills });
      setEditing(false);
    } catch (err) {
      toast.error(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <ImageUpload
            imageUrl={profile.profileImageUrl}
            initials={getInitials(user?.firstName, user?.lastName)}
            onUploaded={(profileImageUrl) => onUpdated?.({ ...profile, profileImageUrl })}
            onRemoved={() => onUpdated?.({ ...profile, profileImageUrl: null })}
          />
          {!editing && (
            <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>
              Edit profile
            </Button>
          )}
        </div>
      </Card>

      <Card>
        {!editing ? (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--foreground)]">Academic &amp; personal details</h3>
            </div>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                ["Roll number", profile.rollNumber],
                ["Branch", profile.branch],
                ["Graduation year", profile.graduationYear],
                ["CGPA", profile.cgpa],
                ["Active backlogs", profile.backlogs ?? 0],
                ["Phone number", profile.phoneNumber],
                ["Date of birth", profile.dateOfBirth],
                ["Gender", profile.gender],
                ["GitHub", profile.githubUrl],
                ["LinkedIn", profile.linkedinUrl],
                ["Portfolio", profile.portfolioUrl],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-[var(--foreground)]">{value || "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">
              <dt className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Skills</dt>
              <div className="flex flex-wrap gap-2">
                {(profile.skills || []).map((s) => (
                  <Badge key={s} tone="primary">{s}</Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--foreground)]">Edit details</h3>
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--border)] px-3.5 py-3 opacity-60">
                <p className="text-xs font-medium text-[var(--muted)] mb-1">Roll number</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">{profile.rollNumber}</p>
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
            <SearchableSelect label="Branch" options={BRANCHES} value={branch} onChange={setBranch} />
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-xl border px-3.5 py-3 ${resultsFetched ? "border-[var(--border)] bg-[var(--border)] opacity-60" : "border-[var(--border)] bg-[var(--surface)] opacity-40"}`}>
                <p className="text-xs font-medium text-[var(--muted)] mb-1">CGPA</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {resultsFetched ? fetchedCgpa : profile.cgpa ?? "—"}
                </p>
              </div>
              <div className={`rounded-xl border px-3.5 py-3 ${resultsFetched ? "border-[var(--border)] bg-[var(--border)] opacity-60" : "border-[var(--border)] bg-[var(--surface)] opacity-40"}`}>
                <p className="text-xs font-medium text-[var(--muted)] mb-1">Active backlogs</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {resultsFetched ? fetchedBacklogs : profile.backlogs ?? "—"}
                </p>
              </div>
            </div>
            <Input label="Phone number" icon={Phone} {...register("phoneNumber")} />
            <Input label="Date of birth" type="date" icon={Calendar} {...register("dateOfBirth")} />
            <SegmentedControl label="Gender" options={GENDERS} value={gender} onChange={setGender} />
            <SkillSelect label="Skills" value={skills} onChange={setSkills} availableSkills={availableSkills} />
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
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving} icon={Save}>
                Save changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 font-semibold text-[var(--foreground)]">Resume</h3>
        <ResumeUpload
          resume={profile.resumeUrl ? { name: "Resume.pdf", url: profile.resumeUrl } : null}
          onUploaded={(resume) =>
            onUpdated?.({ ...profile, resumeUrl: resume.url })
          }
          onRemoved={() => onUpdated?.({ ...profile, resumeUrl: null })}
        />
      </Card>
    </div>
  );
}
