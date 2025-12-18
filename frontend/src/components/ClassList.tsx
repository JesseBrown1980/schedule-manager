import { ClassCard } from "@/components/ClassCard";
import { formatTimeForDisplay24h } from "@/utils/dates";
import { cn } from "@/lib/cn";
import type { Class } from "@/types";
import { SortIcon } from "@/components/ui";

interface ClassListProps {
  classes: Class[];
  onEdit: (classData: Class) => void;
  onDelete: (classData: Class) => void;
}

export function ClassList({ classes, onEdit, onDelete }: ClassListProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          "grid items-center mb-4",
          "grid-cols-[64px_24px_1fr] bp-717:grid-cols-[88px_28px_1fr]",
          "text-[11px] font-semibold tracking-wider uppercase text-content-tertiary"
        )}
      >
        <div className="text-left pl-1">TIME</div>
        <div className="text-left">COURSE</div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="p-1 rounded-lg text-content-tertiary hover:text-content hover:bg-white/60 transition-colors"
            aria-label="Sort options"
          >
            <SortIcon size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-6 bp-717:space-y-7">
        {classes.map((classData, index) => {
          const startTime = classData.start_time.slice(0, 5);
          const endTime = classData.end_time.slice(0, 5);

          return (
            <div
              key={classData.id}
              className={cn(
                "grid items-start",
                "grid-cols-[64px_24px_1fr] bp-717:grid-cols-[88px_28px_1fr]"
              )}
            >
              <div className="text-right pr-3 bp-717:pr-4">
                <div className="text-base bp-717:text-lg font-bold text-content leading-tight">
                  {formatTimeForDisplay24h(startTime)}
                </div>
                <div className="text-xs bp-717:text-sm font-medium text-content-tertiary leading-tight mt-0.5">
                  {formatTimeForDisplay24h(endTime)}
                </div>
              </div>

              <div className="relative flex justify-center pt-2 self-stretch min-h-[184px]">
                <div
                  className="timeline-ruler absolute left-1/2 -translate-x-1/2 top-5 bottom-0"
                  aria-hidden="true"
                />
                <div className="timeline-dot relative z-10" />
              </div>

              <div>
                <ClassCard
                  classData={classData}
                  index={index}
                  onEdit={() => onEdit(classData)}
                  onDelete={() => onDelete(classData)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
