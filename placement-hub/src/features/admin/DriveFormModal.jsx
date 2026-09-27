"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Save, Plus } from "lucide-react";

import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import ChipInput from "@/components/ui/ChipInput";

import { driveService } from "@/services/driveService";
import { companyService } from "@/services/companyService";

const BRANCHES = [
  "CSE",
  "AIML",
  "AIDS",
  "CSBS",
  "IT",
  "ECE",
  "EEE",
  "CIVIL",
  "MECH",
];

export default function DriveFormModal({
                                         open,
                                         onOpenChange,
                                         drive,
                                         onSaved,
                                       }) {
  const [skills, setSkills] = useState([]);
  const [eligibleBranches, setEligibleBranches] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [saving, setSaving] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [creatingCompany, setCreatingCompany] = useState(false);

  const [companyModalOpen, setCompanyModalOpen] = useState(false);

  const isEdit = !!drive?.id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      companyId: "",
      role: "",
      jobPackage: "",
      jobLocation: "",
      deadline: "",
      driveDescription: "",
      jobDescription: "",
      recruitmentProcess: "",
      minCgpa: "",
      backlogRestrictions: "",
      graduationYear: "",
    },
  });

  const {
    register: registerCompany,
    handleSubmit: handleCompanySubmit,
    reset: resetCompany,
  } = useForm({
    defaultValues: {
      name: "",
      website: "",
      logo: "",
      description: "",
      location: "",
    },
  });

  // Load companies
  const loadCompanies = async () => {
    setLoadingCompanies(true);

    try {
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (err) {
      toast.error(err.message || "Could not load companies");
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    loadCompanies();
  }, [open]);

  // Load drive data when editing
  useEffect(() => {
    if (open) {
      reset({
        companyId: drive?.company?.id || "",
        role: drive?.role || "",
        jobPackage: drive?.jobPackage || "",
        jobLocation: drive?.jobLocation || "",
        deadline: drive?.deadline
            ? drive.deadline.slice(0, 16)
            : "",
        driveDescription: drive?.driveDescription || "",
        jobDescription: drive?.jobDescription || "",
        recruitmentProcess: drive?.recruitmentProcess || "",
        minCgpa: drive?.minCgpa || "",
        backlogRestrictions: drive?.backlogRestrictions || "",
        graduationYear: drive?.graduationYear || "",
      });

      setSkills(
          Array.isArray(drive?.requiredSkills)
              ? drive.requiredSkills
              : drive?.requiredSkills
              ?.split(",")
              .map((s) => s.trim())
              .filter(Boolean) || []
      );

      setEligibleBranches(
          Array.isArray(drive?.eligibleBranches)
              ? drive.eligibleBranches
              : []
      );
    }
  }, [open, drive, reset]);

  // Create new company
  const handleCreateCompany = async (values) => {
    setCreatingCompany(true);

    try {
      const newCompany = await companyService.create(values);

      setCompanies((prev) => [...prev, newCompany]);

      // Automatically select newly created company
      setValue("companyId", String(newCompany.id), {
        shouldValidate: true,
        shouldDirty: true,
      });

      toast.success("Company created successfully");

      resetCompany();
      setCompanyModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Could not create company");
    } finally {
      setCreatingCompany(false);
    }
  };

  const onSubmit = async (values) => {
    setSaving(true);

    try {
      const payload = {
        ...values,

        companyId: Number(values.companyId),

        deadline: values.deadline
            ? new Date(values.deadline).toISOString()
            : null,

        minCgpa: values.minCgpa
            ? Number(values.minCgpa)
            : null,

        backlogRestrictions: values.backlogRestrictions
            ? Number(values.backlogRestrictions)
            : null,

        graduationYear: values.graduationYear
            ? Number(values.graduationYear)
            : null,

        requiredSkills: skills.join(", "),
        eligibleBranches,
      };

      if (isEdit) {
        await driveService.update(drive.id, payload);
        toast.success("Drive updated");
      } else {
        await driveService.create(payload);
        toast.success("Drive created");
      }

      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || "Could not save the drive");
    } finally {
      setSaving(false);
    }
  };

  return (
      <>
        {/* ================= DRIVE MODAL ================= */}

        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Edit drive" : "Create a new drive"}
            description="This information will be visible to all eligible students."
            size="xl"
        >
          <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
          >
            {/* Company + Role */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Company <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2">
                  <select
                      {...register("companyId", {
                        required: "Company is required",
                      })}
                      disabled={loadingCompanies}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="">
                      {loadingCompanies
                          ? "Loading companies..."
                          : "Select company"}
                    </option>

                    {companies.map((company) => (
                        <option
                            key={company.id}
                            value={company.id}
                        >
                          {company.name}
                        </option>
                    ))}
                  </select>

                  <Button
                      type="button"
                      variant="secondary"
                      icon={Plus}
                      onClick={() => setCompanyModalOpen(true)}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <Input
                  label="Role"
                  required
                  {...register("role")}
              />
            </div>

            {/* Package / Location / Deadline */}
            <div className="grid grid-cols-3 gap-4">
              <Input
                  label="Package"
                  placeholder="e.g. 8 LPA"
                  {...register("jobPackage")}
              />

              <Input
                  label="Location"
                  {...register("jobLocation")}
              />

              <Input
                  label="Deadline"
                  type="datetime-local"
                  {...register("deadline")}
              />
            </div>

            {/* Eligibility */}
            <div className="grid grid-cols-3 gap-4">
              <Input
                  label="Min CGPA"
                  type="number"
                  step="0.1"
                  placeholder="6.0"
                  {...register("minCgpa")}
              />

              <Input
                  label="Max backlogs"
                  type="number"
                  placeholder="0"
                  {...register("backlogRestrictions")}
              />

              <Input
                  label="Graduation year"
                  type="number"
                  placeholder="2026"
                  {...register("graduationYear")}
              />
            </div>

            {/* Branches */}
            <div>
              <p className="mb-2 text-sm font-medium">
                Eligible branches
              </p>

              <div className="flex flex-wrap gap-2">
                {BRANCHES.map((branch) => {
                  const selected =
                      eligibleBranches.includes(branch);

                  return (
                      <button
                          key={branch}
                          type="button"
                          onClick={() =>
                              setEligibleBranches((prev) =>
                                  selected
                                      ? prev.filter(
                                          (b) => b !== branch
                                      )
                                      : [...prev, branch]
                              )
                          }
                          className={`rounded-lg border px-3 py-1.5 text-sm ${
                              selected
                                  ? "border-[var(--primary)] bg-blue-50 text-[var(--primary)]"
                                  : "border-[var(--border)] text-[var(--muted)]"
                          }`}
                      >
                        {branch}
                      </button>
                  );
                })}
              </div>
            </div>

            <ChipInput
                label="Skills required"
                value={skills}
                onChange={setSkills}
            />

            <Textarea
                label="Drive description"
                {...register("driveDescription")}
            />

            <Textarea
                label="Job description"
                {...register("jobDescription")}
            />

            <Textarea
                label="Recruitment process"
                {...register("recruitmentProcess")}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                  type="submit"
                  isLoading={saving}
                  icon={Save}
              >
                {isEdit ? "Save changes" : "Create drive"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* ================= ADD COMPANY MODAL ================= */}

        <Modal
            open={companyModalOpen}
            onOpenChange={setCompanyModalOpen}
            title="Add new company"
            description="Create a company and use it for this placement drive."
            size="md"
        >
          <form
              onSubmit={handleCompanySubmit(handleCreateCompany)}
              className="space-y-4"
          >
            <Input
                label="Company name"
                required
                {...registerCompany("name")}
            />

            <Input
                label="Website"
                placeholder="https://example.com"
                {...registerCompany("website")}
            />

            <Input
                label="Logo URL"
                placeholder="https://example.com/logo.png"
                {...registerCompany("logo")}
            />

            <Input
                label="Location"
                placeholder="Hyderabad"
                {...registerCompany("location")}
            />

            <Textarea
                label="Description"
                {...registerCompany("description")}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCompanyModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                  type="submit"
                  isLoading={creatingCompany}
                  icon={Plus}
              >
                Create company
              </Button>
            </div>
          </form>
        </Modal>
      </>
  );
}