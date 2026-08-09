"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { formService } from "@/services/formService";
import toast from "react-hot-toast";

const FIELD_TYPES = [
    "TEXT",
    "NUMBER",
    "EMAIL",
    "DATE",
    "TEXTAREA",
    "DROPDOWN",
    "RADIO",
    "CHECKBOX",
    "FILE",
];

const createEmptyField = (order) => ({
    label: "",
    fieldType: "TEXT",
    required: false,
    placeholder: "",
    options: "",
    displayOrder: order,
    defaultValue: "",
    validationRegex: "",
});

export default function FormBuilder({ driveId, onSaved }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fields, setFields] = useState([createEmptyField(1)]);
    const [saving, setSaving] = useState(false);

    const addField = () => {
        setFields((current) => [
            ...current,
            createEmptyField(current.length + 1),
        ]);
    };

    const updateField = (index, key, value) => {
        setFields((current) =>
            current.map((field, i) =>
                i === index ? { ...field, [key]: value } : field
            )
        );
    };

    const removeField = (index) => {
        setFields((current) =>
            current
                .filter((_, i) => i !== index)
                .map((field, i) => ({
                    ...field,
                    displayOrder: i + 1,
                }))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!driveId) {
            toast.error("Please select a placement drive");
            return;
        }

        if (!title.trim()) {
            toast.error("Form title is required");
            return;
        }

        if (fields.some((field) => !field.label.trim())) {
            toast.error("Every field must have a label");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                placementDriveId: Number(driveId),
                fields: fields.map((field, index) => ({
                    ...field,
                    displayOrder: index + 1,
                    required: Boolean(field.required),
                })),
            };

            await formService.create(payload);

            toast.success("Form created successfully");

            setTitle("");
            setDescription("");
            setFields([createEmptyField(1)]);

            if (onSaved) {
                onSaved();
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Could not create form"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Details */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <h2 className="mb-4 text-lg font-semibold">Form Details</h2>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Form Title
                        </label>

                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Example: Infosys Registration Form"
                            className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter instructions for students..."
                            rows={4}
                            className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Dynamic Fields */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Form Fields</h2>
                        <p className="text-sm text-[var(--muted)]">
                            Add the information students need to provide.
                        </p>
                    </div>

                    <Button type="button" icon={Plus} onClick={addField}>
                        Add Field
                    </Button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-[var(--border)] p-5"
                        >
                            <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Field {index + 1}
                </span>

                                {fields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeField(index)}
                                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                        title="Remove field"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Label */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Label
                                    </label>

                                    <input
                                        value={field.label}
                                        onChange={(e) =>
                                            updateField(index, "label", e.target.value)
                                        }
                                        placeholder="Example: Roll Number"
                                        className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Field Type */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Field Type
                                    </label>

                                    <select
                                        value={field.fieldType}
                                        onChange={(e) =>
                                            updateField(index, "fieldType", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 outline-none"
                                    >
                                        {FIELD_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Placeholder */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Placeholder
                                    </label>

                                    <input
                                        value={field.placeholder}
                                        onChange={(e) =>
                                            updateField(index, "placeholder", e.target.value)
                                        }
                                        placeholder="Enter placeholder..."
                                        className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Default Value */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Default Value
                                    </label>

                                    <input
                                        value={field.defaultValue}
                                        onChange={(e) =>
                                            updateField(index, "defaultValue", e.target.value)
                                        }
                                        placeholder="Optional"
                                        className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Options */}
                                {["DROPDOWN", "RADIO", "CHECKBOX"].includes(
                                    field.fieldType
                                ) && (
                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-sm font-medium">
                                            Options
                                        </label>

                                        <input
                                            value={field.options}
                                            onChange={(e) =>
                                                updateField(index, "options", e.target.value)
                                            }
                                            placeholder="Example: CSE, ECE, AIML, EEE"
                                            className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        />

                                        <p className="mt-1 text-xs text-[var(--muted)]">
                                            Separate options using commas.
                                        </p>
                                    </div>
                                )}

                                {/* Validation Regex */}
                                {["TEXT", "NUMBER", "EMAIL"].includes(field.fieldType) && (
                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-sm font-medium">
                                            Validation Regex
                                        </label>

                                        <input
                                            value={field.validationRegex}
                                            onChange={(e) =>
                                                updateField(index, "validationRegex", e.target.value)
                                            }
                                            placeholder="Optional"
                                            className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                )}

                                {/* Required */}
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) =>
                                            updateField(index, "required", e.target.checked)
                                        }
                                        className="h-4 w-4"
                                    />

                                    Required field
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" icon={Save} disabled={saving}>
                        {saving ? "Creating..." : "Create Form"}
                    </Button>
                </div>
            </div>
        </form>
    );
}