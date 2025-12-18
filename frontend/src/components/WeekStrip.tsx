import { cn } from "@/lib/cn";
import {
  getWeekDays,
  getWeekdayLetter,
  getDayOfMonth,
  isSameDayAs,
  isToday,
  getPreviousWeek,
  getNextWeek,
} from "@/utils/dates";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui";

interface WeekStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function WeekStrip({ selectedDate, onDateSelect }: WeekStripProps) {
  const weekDays = getWeekDays(selectedDate);

  const handlePreviousWeek = () => {
    onDateSelect(getPreviousWeek(selectedDate));
  };

  const handleNextWeek = () => {
    onDateSelect(getNextWeek(selectedDate));
  };

  const handleTodayClick = () => {
    onDateSelect(new Date());
  };

  const showTodayButton = !isToday(selectedDate);

  return (
    <div className="mb-6 md:mb-8 overflow-hidden">
      <div
        className={cn(
          "bg-white/60 backdrop-blur-md",
          "rounded-3xl border border-white/60 shadow-sm",
          "px-1.5 py-1.5 bp-717:px-3 bp-717:py-3",
          "overflow-hidden"
        )}
      >
        <div className="flex items-center gap-1 bp-717:gap-2">
          <button
            onClick={handlePreviousWeek}
            className={cn(
              "flex-none w-8 h-8 bp-717:w-10 bp-717:h-10",
              "flex items-center justify-center rounded-xl",
              "bg-white/40 hover:bg-white/80",
              "text-content-secondary hover:text-content",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            )}
            aria-label="Previous week"
          >
            <ChevronLeftIcon size={18} />
          </button>

          <div className="flex-1 no-scrollbar flex items-center justify-between gap-0.5 bp-717:gap-1">
            {weekDays.map((date, index) => {
              const isSelected = isSameDayAs(date, selectedDate);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={index}
                  onClick={() => onDateSelect(date)}
                  className={cn(
                    "relative flex flex-col items-center justify-center",
                    "flex-1 min-w-[36px] h-[68px] bp-717:h-[74px] rounded-xl bp-717:rounded-2xl",
                    "transition-all duration-200",
                    isSelected
                      ? "bg-gradient-to-b from-[#667EEA] to-[#764BA2] text-white shadow-button-glow"
                      : "bg-white/40 hover:bg-white/80 text-content-secondary hover:text-content",
                    isTodayDate && !isSelected && "ring-2 ring-[#667EEA]/30"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span
                    className={cn(
                      "text-[10px] bp-717:text-xs font-medium uppercase tracking-wide",
                      isSelected ? "text-white/80" : "text-content-tertiary"
                    )}
                  >
                    {getWeekdayLetter(date)}
                  </span>
                  <span
                    className={cn(
                      "text-sm bp-717:text-lg font-semibold mt-0.5 leading-none",
                      isSelected ? "text-white" : "text-content"
                    )}
                  >
                    {getDayOfMonth(date)}
                  </span>

                  {isTodayDate && (
                    <span
                      className={cn(
                        "absolute bottom-1.5 left-1/2 -translate-x-1/2",
                        "w-1 h-1 rounded-full",
                        isSelected ? "bg-white" : "bg-[#667EEA]"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextWeek}
            className={cn(
              "flex-none w-8 h-8 bp-717:w-10 bp-717:h-10",
              "flex items-center justify-center rounded-xl",
              "bg-white/40 hover:bg-white/80",
              "text-content-secondary hover:text-content",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            )}
            aria-label="Next week"
          >
            <ChevronRightIcon size={18} />
          </button>
        </div>

        {showTodayButton && (
          <div className="flex justify-center mt-2">
            <button
              onClick={handleTodayClick}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full",
                "bg-primary-100 text-primary-700",
                "hover:bg-primary-200 transition-colors"
              )}
            >
              Go to Today
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
