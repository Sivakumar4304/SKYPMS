"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { batchService } from "@/services/batchService";

export default function AdminBatchesPage() {
    const [batches, setBatches] = useState([]);
    const [graduationYear, setGraduationYear] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [branchFilter, setBranchFilter] = useState("ALL");


    // Load available batches
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const { data } = await batchService.getBatches();

                setBatches(data || []);

                if (data && data.length > 0) {
                    setGraduationYear(String(data[0]));
                }
            } catch (error) {
                console.error("Failed to fetch batches:", error);
            }
        };

        fetchBatches();
    }, []);

    const fetchStudents = async () => {
        if (!graduationYear) return;

        setLoading(true);

        try {
            const { data } = await batchService.getStudents(graduationYear);
            setStudents(data || []);
            setSearched(true);
        } catch (error) {
            console.error("Failed to fetch batch students:", error);
            setStudents([]);
            setSearched(true);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents =
        branchFilter === "ALL"
            ? students
            : students.filter((student) => student.branch === branchFilter);

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <DashboardShell title="Batch Management">

                <div className="mb-6 flex items-center gap-3">

                    <select
                        value={graduationYear}
                        onChange={(e) => {
                            setGraduationYear(e.target.value);
                            setStudents([]);
                            setSearched(false);
                        }}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2"
                    >
                        {batches.length === 0 && (
                            <option value="">No batches available</option>
                        )}

                        {batches.map((year) => (
                            <option key={year} value={year}>
                                {year} Batch
                            </option>
                        ))}
                    </select>

                    <select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2"
                    >
                        <option value="ALL">All Branches</option>
                        <option value="CSE">CSE</option>
                        <option value="AIML">AIML</option>
                        <option value="AIDS">AIDS</option>
                        <option value="CSBS">CSBS</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="CIVIL">CIVIL</option>
                        <option value="MECH">MECH</option>
                    </select>

                    <Button
                        onClick={fetchStudents}
                        isLoading={loading}
                        disabled={!graduationYear}
                    >
                        View Batch
                    </Button>
                </div>

                {searched && (
                    <p className="mb-4 text-sm text-[var(--muted)]">
                        {graduationYear} Batch — {filteredStudents.length} student
                        {students.length !== 1 ? "s" : ""}
                    </p>
                )}

                {searched && filteredStudents.length === 0 && (
                    <EmptyState
                        icon={Users}
                        title="No students found"
                        description={
                            branchFilter === "ALL"
                                ? `No students found in the ${graduationYear} batch.`
                                : `No ${branchFilter} students found in the ${graduationYear} batch.`
                        }
                    />
                )}

                {filteredStudents.length > 0 && (
                    <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">

                        <table className="w-full text-left text-sm">

                            <thead className="bg-slate-50 dark:bg-white/[0.03]">
                            <tr>
                                <th className="px-4 py-3">Roll Number</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Branch</th>
                                <th className="px-4 py-3">CGPA</th>
                                <th className="px-4 py-3">Backlogs</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-[var(--border)]">

                            {filteredStudents.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-4 py-3">
                                        {student.rollNumber}
                                    </td>

                                    <td className="px-4 py-3">
                                        {student.name}
                                    </td>

                                    <td className="px-4 py-3">
                                        {student.branch}
                                    </td>

                                    <td className="px-4 py-3">
                                        {student.cgpa}
                                    </td>

                                    <td className="px-4 py-3">
                                        {student.backlogs ?? 0}
                                    </td>
                                </tr>
                            ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </DashboardShell>
        </ProtectedRoute>
    );
}