import type { ConflictDetail } from "@/types";
import { UsersIcon, ClockIcon } from "@/components/ui";
import { formatConflictTime } from "@/utils/format";

interface StudentConflictsCardProps {
  conflicts: ConflictDetail[];
}

export function StudentConflictsCard({ conflicts }: StudentConflictsCardProps) {
  const studentCount = conflicts.length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error-100 flex items-center justify-center text-error-600">
          <UsersIcon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 mb-1">
            Student Conflicts
          </h4>
          <p className="text-sm text-slate-600 mb-3">
            {studentCount} student{studentCount !== 1 ? "s are" : " is"}{" "}
            enrolled in conflicting classes:
          </p>
          <div className="space-y-2 ml-1 border-l-2 border-slate-200 pl-3">
            {conflicts.map((conflict, index) => (
              <div key={index} className="text-sm">
                <p className="font-medium text-slate-700">
                  {conflict.resource?.name}
                </p>
                <p className="text-slate-500 text-xs">
                  Enrolled in "{conflict.existing_class?.course_name}"
                </p>
                {conflict.existing_class && (
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                    <ClockIcon size={12} />
                    <span>
                      {formatConflictTime(conflict.existing_class.start_time)}-
                      {formatConflictTime(conflict.existing_class.end_time)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
