"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    Plus,
    Pencil,
    Trash2,
    Send,
    Lock,
} from "lucide-react";

import DashboardShell from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import FormBuilder from "@/features/admin/FormBuilder";

import { driveService } from "@/services/driveService";
import { formService } from "@/services/formService";

import toast from "react-hot-toast";

export default function AdminFormsPage() {
    const [drives, setDrives] = useState([]);
    const [selectedDrive, setSelectedDrive] = useState("");

    const [forms, setForms] = useState([]);

    const [showBuilder, setShowBuilder] = useState(false);
    const [editingForm, setEditingForm] = useState(null);

    const [loading, setLoading] = useState(true);
    const [formsLoading, setFormsLoading] = useState(false);

    // -----------------------------
    // Load drives
    // -----------------------------

    const loadDrives = async () => {
        try {
            setLoading(true);

            const response = await driveService.list({
                page: 0,
                size: 100,
            });

            const data = response?.data;

            const driveList = Array.isArray(data)
                ? data
                : data?.content || [];

            setDrives(driveList);

            if (driveList.length > 0 && !selectedDrive) {
                setSelectedDrive(String(driveList[0].id));
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Could not load placement drives"
            );
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // Load forms for selected drive
    // -----------------------------

    const loadForms = async (driveId = selectedDrive) => {
        if (!driveId) {
            setForms([]);
            return;
        }

        try {
            setFormsLoading(true);

            const response = await formService.getByDrive(driveId);

            setForms(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Could not load forms"
            );

            setForms([]);
        } finally {
            setFormsLoading(false);
        }
    };

    useEffect(() => {
        loadDrives();
    }, []);

    useEffect(() => {
        if (selectedDrive) {
            loadForms(selectedDrive);
        }
    }, [selectedDrive]);

    // -----------------------------
    // Publish
    // -----------------------------

    const handlePublish = async (formId) => {
        try {
            await formService.publish(formId);

            toast.success("Form published successfully");

            await loadForms();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Could not publish form"
            );
        }
    };

    // -----------------------------
    // Close
    // -----------------------------

    const handleClose = async (formId) => {
        try {
            await formService.close(formId);

            toast.success("Form closed successfully");

            await loadForms();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Could not close form"
            );
        }
    };

    // -----------------------------
    // Delete
    // -----------------------------

    const handleDelete = async (formId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this form?"
        );

        if (!confirmed) return;

        try {
            await formService.remove(formId);

            toast.success("Form deleted successfully");

            await loadForms();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Could not delete form"
            );
        }
    };

    // -----------------------------
    // Builder saved
    // -----------------------------

    const handleBuilderSaved = async () => {
        setShowBuilder(false);
        setEditingForm(null);

        await loadForms();
    };

    // -----------------------------
    // Render
    // -----------------------------

    return (
        <ProtectedRoute>
            <DashboardShell>
                <div className="space-y-6">

                    {/* HEADER */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">
                                Dynamic Forms
                            </h1>

                            <p className="mt-1 text-sm text-[var(--muted)]">
                                Create custom application forms for each placement drive.
                            </p>
                        </div>

                        {!showBuilder && (
                            <Button
                                icon={Plus}
                                disabled={!selectedDrive}
                                onClick={() => {
                                    setEditingForm(null);
                                    setShowBuilder(true);
                                }}
                            >
                                Create Form
                            </Button>
                        )}
                    </div>

                    {/* DRIVE SELECTION */}
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                        <label className="mb-2 block text-sm font-medium">
                            Placement Drive
                        </label>

                        {loading ? (
                            <p className="text-sm text-[var(--muted)]">
                                Loading drives...
                            </p>
                        ) : drives.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No placement drives"
                                description="Create a placement drive before creating a form."
                            />
                        ) : (
                            <select
                                value={selectedDrive}
                                onChange={(e) => {
                                    setSelectedDrive(e.target.value);
                                    setShowBuilder(false);
                                    setEditingForm(null);
                                }}
                                className="w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none"
                            >
                                {drives.map((drive) => (
                                    <option
                                        key={drive.id}
                                        value={drive.id}
                                    >
                                        {drive.companyName || drive.company}{" "}
                                        — {drive.role}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* FORM BUILDER */}
                    {showBuilder && selectedDrive && (
                        <FormBuilder
                            driveId={selectedDrive}
                            form={editingForm}
                            onSaved={handleBuilderSaved}
                            onCancel={() => {
                                setShowBuilder(false);
                                setEditingForm(null);
                            }}
                        />
                    )}

                    {/* EXISTING FORMS */}
                    {!showBuilder && selectedDrive && (
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">

                            <div className="mb-5">
                                <h2 className="text-lg font-semibold">
                                    Application Forms
                                </h2>

                                <p className="mt-1 text-sm text-[var(--muted)]">
                                    Forms configured for the selected placement drive.
                                </p>
                            </div>

                            {formsLoading ? (
                                <p className="text-sm text-[var(--muted)]">
                                    Loading forms...
                                </p>
                            ) : forms.length === 0 ? (
                                <EmptyState
                                    icon={FileText}
                                    title="No form created"
                                    description="Create an application form for this placement drive."
                                />
                            ) : (
                                <div className="space-y-4">

                                    {forms.map((form) => (
                                        <div
                                            key={form.id}
                                            className="rounded-xl border border-[var(--border)] p-5"
                                        >
                                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                                {/* FORM INFO */}
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {form.title}
                                                    </h3>

                                                    {form.description && (
                                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                                            {form.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-3 flex flex-wrap items-center gap-2">

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    form.status === "PUBLISHED"
                                        ? "bg-green-100 text-green-700"
                                        : form.status === "CLOSED"
                                            ? "bg-gray-100 text-gray-600"
                                            : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {form.status}
                            </span>

                                                        <span className="text-xs text-[var(--muted)]">
                              {form.fields?.length || 0} fields
                            </span>

                                                    </div>
                                                </div>

                                                {/* ACTIONS */}
                                                <div className="flex flex-wrap gap-2">

                                                    {/* DRAFT */}
                                                    {form.status === "DRAFT" && (
                                                        <>
                                                            <Button
                                                                icon={Send}
                                                                onClick={() =>
                                                                    handlePublish(form.id)
                                                                }
                                                            >
                                                                Publish
                                                            </Button>

                                                            <Button
                                                                icon={Pencil}
                                                                onClick={() => {
                                                                    setEditingForm(form);
                                                                    setShowBuilder(true);
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                        </>
                                                    )}

                                                    {/* PUBLISHED */}
                                                    {form.status === "PUBLISHED" && (
                                                        <Button
                                                            icon={Lock}
                                                            onClick={() =>
                                                                handleClose(form.id)
                                                            }
                                                        >
                                                            Close
                                                        </Button>
                                                    )}

                                                    {/* DELETE */}
                                                    <Button
                                                        icon={Trash2}
                                                        onClick={() =>
                                                            handleDelete(form.id)
                                                        }
                                                    >
                                                        Delete
                                                    </Button>

                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            )}
                        </div>
                    )}

                </div>
            </DashboardShell>
        </ProtectedRoute>
    );
}