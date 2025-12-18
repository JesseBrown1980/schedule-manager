import { memo } from "react";
import { cn } from "@/lib/cn";
import {
  getDayOfMonth,
  getHeaderDayLabel,
  getHeaderMonthYearLabel,
} from "@/utils/dates";
import { Button, PlusIcon } from "@/components/ui";

interface ScheduleHeaderProps {
  selectedDate: Date;
  onAddClass: () => void;
}

export const ScheduleHeader = memo(function ScheduleHeader({
  selectedDate,
  onAddClass,
}: ScheduleHeaderProps) {
  return (
    <header className="flex items-start justify-between mb-6 md:mb-8">
      <div className="flex items-baseline gap-2">
        <div className="relative">
          <span className="block text-5xl md:text-7xl font-bold text-content tracking-tight leading-none">
            {getDayOfMonth(selectedDate)}
          </span>
          <span className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#667EEA]" />
        </div>
        <div className="flex flex-col justify-end pb-1">
          <span className="text-sm md:text-base font-medium text-content-secondary leading-tight">
            {getHeaderDayLabel(selectedDate)}
          </span>
          <span className="text-sm md:text-base font-medium text-content-secondary leading-tight">
            {getHeaderMonthYearLabel(selectedDate)}
          </span>
        </div>
      </div>

      <Button
        onClick={onAddClass}
        size="lg"
        leftIcon={<PlusIcon size={16} />}
        className={cn("w-auto h-[48px] px-6", "rounded-btn shadow-button-glow")}
      >
        Add Class
      </Button>
    </header>
  );
});
