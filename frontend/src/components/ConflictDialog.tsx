import { memo } from "react";
import { cn } from "@/lib/cn";
import type { ConflictDetail } from "@/types";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Button,
  AlertCircleIcon,
  XIcon,
  RoomIcon,
  UserIcon,
  AlertTriangleIcon,
} from "@/components/ui";
import { ConflictCard } from "@/components/ConflictCard";
import { StudentConflictsCard } from "@/components/StudentConflictsCard";
import { groupConflicts } from "@/utils/groupConflicts";
import { formatConflictTime, formatConflictDate } from "@/utils/format";

interface ConflictDialogProps {
  open: boolean;
  onClose: () => void;
  conflicts: ConflictDetail[];
}

export const ConflictDialog = memo(function ConflictDialog({
  open,
  onClose,
  conflicts,
}: ConflictDialogProps) {
  const grouped = groupConflicts(conflicts);
  const totalConflicts = conflicts.length;

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in z-50" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100%-2rem)] max-w-md",
            "bg-white rounded-2xl shadow-dialog",
            "animate-slide-up z-50",
            "max-h-[85vh] overflow-hidden flex flex-col"
          )}
        >
          <div className="bg-gradient-to-b from-error-500 to-error-600 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-full">
                <AlertCircleIcon size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold">
                  Cannot Save Class
                </Dialog.Title>
                <Dialog.Description className="text-sm text-white/80">
                  {totalConflicts} conflict{totalConflicts !== 1 ? "s" : ""}{" "}
                  detected
                </Dialog.Description>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <XIcon size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {grouped.room.map((conflict, index) => (
              <ConflictCard
                key={`room-${index}`}
                icon={<RoomIcon size={20} />}
                title="Room Conflict"
                description={`Room ${conflict.resource?.name} is already booked for "${conflict.existing_class?.course_name}"`}
                timeInfo={
                  conflict.existing_class
                    ? `${formatConflictTime(
                        conflict.existing_class.start_time
                      )}-${formatConflictTime(
                        conflict.existing_class.end_time
                      )} on ${formatConflictDate(conflict.existing_class.date)}`
                    : undefined
                }
              />
            ))}

            {grouped.instructor.map((conflict, index) => (
              <ConflictCard
                key={`instructor-${index}`}
                icon={<UserIcon size={20} />}
                title="Instructor Conflict"
                description={`${conflict.resource?.name} is teaching "${conflict.existing_class?.course_name}"`}
                timeInfo={
                  conflict.existing_class
                    ? `${formatConflictTime(
                        conflict.existing_class.start_time
                      )}-${formatConflictTime(
                        conflict.existing_class.end_time
                      )} on ${formatConflictDate(conflict.existing_class.date)}`
                    : undefined
                }
              />
            ))}

            {grouped.students.length > 0 && (
              <StudentConflictsCard conflicts={grouped.students} />
            )}

            {grouped.capacity.map((conflict, index) => {
              const capacityMatch = conflict.message.match(
                /capacity (\d+).*?(\d+) students/
              );
              const roomCapacity = capacityMatch?.[1];
              const enrolledCount = capacityMatch?.[2];

              return (
                <ConflictCard
                  key={`capacity-${index}`}
                  icon={<AlertTriangleIcon size={20} />}
                  title="Room Capacity Conflict"
                  description={`Room ${conflict.resource?.name} has capacity for ${roomCapacity} students`}
                  extraInfo={
                    <p className="text-sm text-error-600 font-medium mt-1">
                      {enrolledCount} students are enrolled in this class
                    </p>
                  }
                />
              );
            })}
          </div>

          <div className="border-t border-slate-100 p-4">
            <Button
              onClick={onClose}
              className={cn(
                "w-full",
                "bg-gradient-to-b from-error-500 to-error-600",
                "hover:from-error-600 hover:to-error-700"
              )}
            >
              Return to Editing
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
