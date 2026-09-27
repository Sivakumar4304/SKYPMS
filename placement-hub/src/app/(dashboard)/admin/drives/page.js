"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Briefcase, Users } from "lucide-react";
import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import DriveFormModal from "@/features/admin/DriveFormModal";
import { useDrives } from "@/hooks/useDrives";
import { driveService } from "@/services/driveService";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

export default function AdminDrivesPage() {
  const { drives, isLoading, error, refetch } = useDrives({ page: 1 });
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await driveService.remove(deleteTarget.id);
      toast.success("Drive deleted");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not delete this drive");
    } finally {
      setDeleting(false);
    }
  };

  return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardShell title="Manage Drives">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">
              {isLoading ? "Loading…" : `${drives.length} drives`}
            </p>

            <Button
                icon={Plus}
                onClick={() => {
                  setEditTarget(null);
                  setFormOpen(true);
                }}
            >
              New drive
            </Button>
          </div>

          {error && <ErrorState onRetry={refetch} />}

          {!error && (
              <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-[var(--muted)] dark:bg-white/[0.03]">
                  <tr>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--border)]">
                  {isLoading &&
                      Array.from({ length: 4 }).map((_, i) => (
                          <TableRowSkeleton key={i} cols={5} />
                      ))}

                  {!isLoading &&
                      drives.map((drive) => (
                          <tr
                              key={drive.id}
                              className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                          >
                            <td className="px-4 py-3.5 font-medium text-[var(--foreground)]">
                              {drive.companyName || drive.company?.name || "—"}
                            </td>

                            <td className="px-4 py-3.5 text-[var(--muted)]">
                              {drive.role}
                            </td>

                            <td className="px-4 py-3.5 text-[var(--muted)]">
                              {drive.jobPackage || "—"}
                            </td>

                            <td className="px-4 py-3.5 text-[var(--muted)]">
                              {drive.deadline?.slice(0, 10) || "—"}
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                    href={`/admin/applications?driveId=${drive.id}`}
                                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-white/5"
                                    title="View applicants"
                                >
                                  <Users className="h-4 w-4" />
                                </Link>

                                <button
                                    onClick={() => {
                                      setEditTarget(drive);
                                      setFormOpen(true);
                                    }}
                                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-white/5"
                                    title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={() => setDeleteTarget(drive)}
                                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-rose-50 hover:text-[var(--danger)] dark:hover:bg-rose-500/10"
                                    title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))}
                  </tbody>
                </table>

                {!isLoading && drives.length === 0 && (
                    <div className="p-6">
                      <EmptyState
                          icon={Briefcase}
                          title="No drives yet"
                          description="Create your first placement drive to get started."
                      />
                    </div>
                )}
              </div>
          )}

          <DriveFormModal
              open={formOpen}
              onOpenChange={setFormOpen}
              drive={editTarget}
              onSaved={refetch}
          />

          <ConfirmModal
              open={!!deleteTarget}
              onOpenChange={(open) => !open && setDeleteTarget(null)}
              title="Delete this drive?"
              description={`This will permanently remove ${
                  deleteTarget?.companyName ||
                  deleteTarget?.company?.name ||
                  "this drive"
              } and its listing.`}
              confirmLabel="Delete"
              tone="danger"
              isLoading={deleting}
              onConfirm={handleDelete}
          />
        </DashboardShell>
      </ProtectedRoute>
  );
}