"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Users,
    Eye,
    Trash2,
    X,
} from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { adminStudentService } from "@/services/adminStudentService";
import toast from "react-hot-toast";

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

export default function AdminStudentsPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [branch, setBranch] = useState("");
    const [minCgpa, setMinCgpa] = useState("");
    const [maxCgpa, setMaxCgpa] = useState("");
    const [skill, setSkill] = useState("");
    const [placed, setPlaced] = useState("");
    const [graduationYear, setGraduationYear] = useState("");

    // Pagination / sorting
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [sortBy, setSortBy] = useState("id");
    const [direction, setDirection] = useState("asc");

    // Details / delete
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                size: pageSize,
                sortBy,
                direction,
            };

            if (search.trim()) params.search = search.trim();
            if (branch) params.branch = branch;
            if (minCgpa !== "") params.minCgpa = Number(minCgpa);
            if (maxCgpa !== "") params.maxCgpa = Number(maxCgpa);
            if (skill.trim()) params.skill = skill.trim();
            if (placed !== "") params.placed = placed === "true";
            if (graduationYear !== "") {
                params.graduationYear = Number(graduationYear);
            }

            const { data } = await adminStudentService.getStudents(params);

            setStudents(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (err) {
            console.error("Failed to fetch students:", err);
            setError(err.message || "Failed to load students.");
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [
        page,
        branch,
        minCgpa,
        maxCgpa,
        skill,
        placed,
        graduationYear,
        sortBy,
        direction,
    ]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        fetchStudents();
    };

    const clearFilters = () => {
        setSearch("");
        setBranch("");
        setMinCgpa("");
        setMaxCgpa("");
        setSkill("");
        setPlaced("");
        setGraduationYear("");
        setPage(0);
    };

    const handleView = async (id) => {
        try {
            const { data } = await adminStudentService.getStudentById(id);
            setSelectedStudent(data);
        } catch (err) {
            toast.error(err.message || "Could not load student details.");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);

        try {
            await adminStudentService.deleteStudent(deleteTarget.id);

            toast.success("Student deleted successfully.");
            setDeleteTarget(null);

            if (students.length === 1 && page > 0) {
                setPage((current) => current - 1);
            } else {
                fetchStudents();
            }
        } catch (err) {
            toast.error(err.message || "Could not delete student.");
        } finally {
            setDeleting(false);
        }
    };

    const toggleSort = (field) => {
        if (sortBy === field) {
            setDirection((current) =>
                current === "asc" ? "desc" : "asc"
            );
        } else {
            setSortBy(field);
            setDirection("asc");
        }
        setPage(0);
    };

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <DashboardShell title="Manage Students">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-[var(--muted)]">
                            {loading
                                ? "Loading students…"
                                : `${totalElements} students`}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">

                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-3"
                    >
                        {/* Search */}
                        <div className="flex flex-col gap-3 lg:flex-row">

                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />

                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search name, email or roll number..."
                                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>

                            <Button type="submit" icon={Search}>
                                Search
                            </Button>

                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

                            <select
                                value={branch}
                                onChange={(e) => {
                                    setBranch(e.target.value);
                                    setPage(0);
                                }}
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
                            >
                                <option value="">All Branches</option>

                                {BRANCHES.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                value={minCgpa}
                                onChange={(e) => {
                                    setMinCgpa(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Min CGPA"
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
                            />

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                value={maxCgpa}
                                onChange={(e) => {
                                    setMaxCgpa(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Max CGPA"
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
                            />

                            <input
                                value={skill}
                                onChange={(e) => {
                                    setSkill(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Skill e.g. Java"
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
                            />

                            <input
                                type="number"
                                value={graduationYear}
                                onChange={(e) => {
                                    setGraduationYear(e.target.value);
                                    setPage(0);
                                }}
                                placeholder="Graduation Year"
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
                            />

                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                            <select
                                value={placed}
                                onChange={(e) => {
                                    setPlaced(e.target.value);
                                    setPage(0);
                                }}
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                            >
                                <option value="">All Students</option>
                                <option value="true">Placed</option>
                                <option value="false">Unplaced</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setPage(0);
                                }}
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                            >
                                <option value="id">Sort: ID</option>
                                <option value="cgpa">Sort: CGPA</option>
                                <option value="graduationYear">
                                    Sort: Graduation Year
                                </option>
                                <option value="rollNumber">
                                    Sort: Roll Number
                                </option>
                            </select>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                <X className="h-4 w-4" />
                                Clear filters
                            </button>

                        </div>
                    </form>
                </div>

                {/* Error */}
                {error && <ErrorState onRetry={fetchStudents} />}

                {/* Table */}
                {!error && (
                    <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">

                        <table className="w-full text-left text-sm">

                            <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-[var(--muted)] dark:bg-white/[0.03]">

                            <tr>
                                <th className="px-4 py-3">
                                    Roll Number
                                </th>

                                <th
                                    className="cursor-pointer px-4 py-3"
                                    onClick={() => toggleSort("id")}
                                >
                                    Student
                                </th>

                                <th className="px-4 py-3">
                                    Branch
                                </th>

                                <th
                                    className="cursor-pointer px-4 py-3"
                                    onClick={() => toggleSort("cgpa")}
                                >
                                    CGPA
                                </th>

                                <th className="px-4 py-3">
                                    Backlogs
                                </th>

                                <th className="px-4 py-3">
                                    Status
                                </th>

                                <th className="px-4 py-3 text-right">
                                    Actions
                                </th>
                            </tr>

                            </thead>

                            <tbody className="divide-y divide-[var(--border)]">

                            {loading &&
                                Array.from({ length: 6 }).map((_, index) => (
                                    <TableRowSkeleton
                                        key={index}
                                        cols={7}
                                    />
                                ))}

                            {!loading &&
                                students.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                                    >

                                        <td className="px-4 py-3.5 font-medium">
                                            {student.rollNumber}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="font-medium">
                                                    {student.name || "—"}
                                                </p>

                                                <p className="text-xs text-[var(--muted)]">
                                                    {student.email || "—"}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-[var(--muted)]">
                                            {student.branch || "—"}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            {student.cgpa ?? "—"}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            {student.backlogs ?? 0}
                                        </td>

                                        <td className="px-4 py-3.5">

                        <span
                            className={
                                student.placed
                                    ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-[var(--muted)]"
                            }
                        >
                          {student.placed
                              ? "Placed"
                              : "Unplaced"}
                        </span>

                                        </td>

                                        <td className="px-4 py-3.5">

                                            <div className="flex justify-end gap-1">

                                                <button
                                                    onClick={() =>
                                                        handleView(student.id)
                                                    }
                                                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-white/5"
                                                    title="View student"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setDeleteTarget(student)
                                                    }
                                                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-rose-50 hover:text-[var(--danger)] dark:hover:bg-rose-500/10"
                                                    title="Delete student"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                        {!loading && students.length === 0 && (
                            <div className="p-6">
                                <EmptyState
                                    icon={Users}
                                    title="No students found"
                                    description="Try changing your search or filters."
                                />
                            </div>
                        )}

                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 0 && (
                    <div className="mt-5 flex items-center justify-between">

                        <p className="text-sm text-[var(--muted)]">
                            Page {page + 1} of {totalPages}
                        </p>

                        <div className="flex gap-2">

                            <Button
                                variant="secondary"
                                disabled={page === 0}
                                onClick={() =>
                                    setPage((current) => current - 1)
                                }
                            >
                                Previous
                            </Button>

                            <Button
                                variant="secondary"
                                disabled={page >= totalPages - 1}
                                onClick={() =>
                                    setPage((current) => current + 1)
                                }
                            >
                                Next
                            </Button>

                        </div>

                    </div>
                )}

                {/* Student Details */}
                {selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">

                            <div className="mb-6 flex items-center justify-between">

                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Student Details
                                    </h2>

                                    <p className="text-sm text-[var(--muted)]">
                                        {selectedStudent.rollNumber}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/5"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <Detail
                                    label="Name"
                                    value={selectedStudent.name}
                                />

                                <Detail
                                    label="Email"
                                    value={selectedStudent.email}
                                />

                                <Detail
                                    label="Roll Number"
                                    value={selectedStudent.rollNumber}
                                />

                                <Detail
                                    label="Branch"
                                    value={selectedStudent.branch}
                                />

                                <Detail
                                    label="CGPA"
                                    value={selectedStudent.cgpa}
                                />

                                <Detail
                                    label="Backlogs"
                                    value={selectedStudent.backlogs ?? 0}
                                />

                                <Detail
                                    label="Graduation Year"
                                    value={selectedStudent.graduationYear}
                                />

                                <Detail
                                    label="Phone"
                                    value={selectedStudent.phoneNumber}
                                />

                                <Detail
                                    label="Status"
                                    value={selectedStudent.placed ? "Placed" : "Unplaced"}
                                />

                                <Detail
                                    label="Skills"
                                    value={
                                        selectedStudent.skills?.length
                                            ? selectedStudent.skills.join(", ")
                                            : "—"
                                    }
                                />

                            </div>

                            <div className="mt-6 space-y-2">

                                {selectedStudent.resumeUrl && (
                                    <a
                                        href={selectedStudent.resumeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-sm text-[var(--primary)] hover:underline"
                                    >
                                        View Resume
                                    </a>
                                )}

                                {selectedStudent.githubUrl && (
                                    <a
                                        href={selectedStudent.githubUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-sm text-[var(--primary)] hover:underline"
                                    >
                                        GitHub
                                    </a>
                                )}

                                {selectedStudent.linkedinUrl && (
                                    <a
                                        href={selectedStudent.linkedinUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-sm text-[var(--primary)] hover:underline"
                                    >
                                        LinkedIn
                                    </a>
                                )}

                                {selectedStudent.portfolioUrl && (
                                    <a
                                        href={selectedStudent.portfolioUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-sm text-[var(--primary)] hover:underline"
                                    >
                                        Portfolio
                                    </a>
                                )}

                            </div>

                        </div>
                    </div>
                )}

                {/* Delete confirmation */}
                <ConfirmModal
                    open={!!deleteTarget}
                    onOpenChange={(open) =>
                        !open && setDeleteTarget(null)
                    }
                    title="Delete this student?"
                    description={`This will permanently remove ${
                        deleteTarget?.name ||
                        deleteTarget?.rollNumber ||
                        "this student"
                    } and their placement data.`}
                    confirmLabel="Delete"
                    tone="danger"
                    isLoading={deleting}
                    onConfirm={handleDelete}
                />

            </DashboardShell>
        </ProtectedRoute>
    );
}

function Detail({ label, value }) {
    return (
        <div className="rounded-xl border border-[var(--border)] p-3">
            <p className="text-xs text-[var(--muted)]">
                {label}
            </p>
            <p className="mt-1 break-words text-sm font-medium">
                {value ?? "—"}
            </p>
        </div>
    );
}