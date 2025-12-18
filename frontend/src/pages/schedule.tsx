import { useState, useCallback } from "react";
import { ScheduleHeader } from "@/components/ScheduleHeader";
import { WeekStrip } from "@/components/WeekStrip";
import { ClassList } from "@/components/ClassList";
import { ClassFormDialog } from "@/components/ClassFormDialog";
import { ConflictDialog } from "@/components/ConflictDialog";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from "@/api/hooks";
import { formatDateForApi } from "@/utils/dates";
import { cn } from "@/lib/cn";
import type { Class, ClassFormData, ConflictDetail } from "@/types";
import { ApiError } from "@/types";
import {
  useToast,
  ConfirmDialog,
  ClassListSkeleton,
  CalendarIcon,
  AlertCircleIcon,
  PlusIcon,
} from "@/components/ui";

interface EmptyStateProps {
  onAddClass: () => void;
}

function EmptyState({ onAddClass }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
          <CalendarIcon size={32} />
        </div>
        <h3 className="text-lg font-medium text-content mb-2">
          No classes scheduled
        </h3>
        <p className="text-content-secondary mb-4">
          There are no classes for this day.
        </p>
        <button
          onClick={onAddClass}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2",
            "bg-primary-100 text-primary-700 font-medium rounded-lg",
            "hover:bg-primary-200 transition-colors"
          )}
        >
          <PlusIcon size={16} />
          Add your first class
        </button>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error-100 text-error-600 mb-4">
          <AlertCircleIcon size={32} />
        </div>
        <h3 className="text-lg font-medium text-content mb-2">
          Failed to load schedule
        </h3>
        <p className="text-content-secondary">
          Please check your connection and try again.
        </p>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([]);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Class | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const toast = useToast();

  const dateStr = formatDateForApi(selectedDate);
  const { data: classes = [], isLoading, error } = useClasses(dateStr);
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();

  const sortedClasses = [...classes].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  const handleAddClass = useCallback(() => {
    setEditingClass(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClass = useCallback((classData: Class) => {
    setEditingClass(classData);
    setIsFormOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((classData: Class) => {
    setDeleteTarget(classData);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(
        "Class deleted",
        `"${deleteTarget.course_name}" has been removed.`
      );
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);

      if (editingClass?.id === deleteTarget.id) {
        setIsFormOpen(false);
        setEditingClass(null);
      }
    } catch (err) {
      console.error("Failed to delete class:", err);
      toast.error("Delete failed", "Failed to delete class. Please try again.");
    }
  }, [deleteTarget, deleteMutation, toast, editingClass]);

  const handleFormSubmit = useCallback(
    async (data: ClassFormData) => {
      try {
        if (editingClass) {
          await updateMutation.mutateAsync({ id: editingClass.id, data });
          toast.success(
            "Class updated",
            `"${data.course_name}" has been updated.`
          );
        } else {
          await createMutation.mutateAsync(data);
          toast.success(
            "Class created",
            `"${data.course_name}" has been scheduled.`
          );
        }
        setIsFormOpen(false);
        setEditingClass(null);
      } catch (err: unknown) {
        if (
          err instanceof ApiError &&
          err.status === 409 &&
          err.conflicts &&
          err.conflicts.length > 0
        ) {
          setConflicts(err.conflicts);
          setIsConflictDialogOpen(true);
          return;
        }

        const anyErr = err as { status?: number; conflicts?: ConflictDetail[] };
        if (
          anyErr.status === 409 &&
          anyErr.conflicts &&
          anyErr.conflicts.length > 0
        ) {
          setConflicts(anyErr.conflicts);
          setIsConflictDialogOpen(true);
          return;
        }

        console.error("Failed to save class:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Failed to save class. Please try again.";
        toast.error("Save failed", message);
      }
    },
    [editingClass, updateMutation, createMutation, toast]
  );

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingClass(null);
  }, []);

  const handleCloseConflictDialog = useCallback(() => {
    setIsConflictDialogOpen(false);
    setConflicts([]);
  }, []);

  const handleFormDelete = useCallback(async () => {
    if (editingClass) {
      setDeleteTarget(editingClass);
      setIsDeleteDialogOpen(true);
    }
  }, [editingClass]);

  return (
    <div className="min-h-screen">
      <div
        className={cn(
          "mx-auto px-4 py-6",
          "max-w-[980px] bp-717:max-w-[1200px]",
          "bp-1616:max-w-[1540px] bp-1954:max-w-[1840px]",
          "bp-717:px-6 bp-1616:px-10 bp-1954:px-12",
          "bp-717:py-10"
        )}
      >
        <ScheduleHeader
          selectedDate={selectedDate}
          onAddClass={handleAddClass}
        />

        <div className="rounded-3xl bg-white/50 backdrop-blur-md border border-white/60 shadow-sm px-4 py-5 bp-717:px-6 bp-717:py-7">
          <WeekStrip
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          <div className="mt-6">
            {isLoading && <ClassListSkeleton count={3} />}

            {error && <ErrorState />}

            {!isLoading && !error && classes.length === 0 && (
              <EmptyState onAddClass={handleAddClass} />
            )}

            {!isLoading && !error && classes.length > 0 && (
              <ClassList
                classes={sortedClasses}
                onEdit={handleEditClass}
                onDelete={handleDeleteRequest}
              />
            )}
          </div>
        </div>
      </div>

      <ClassFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        onDelete={editingClass ? handleFormDelete : undefined}
        editingClass={editingClass}
        selectedDate={selectedDate}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConflictDialog
        open={isConflictDialogOpen}
        onClose={handleCloseConflictDialog}
        conflicts={conflicts}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Class"
        description={`Are you sure you want to delete "${deleteTarget?.course_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
