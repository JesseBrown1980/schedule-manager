import { ClockIcon } from "@/components/ui";

export interface ConflictCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  timeInfo?: string;
  extraInfo?: React.ReactNode;
}

export function ConflictCard({
  icon,
  title,
  description,
  timeInfo,
  extraInfo,
}: ConflictCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error-100 flex items-center justify-center text-error-600">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 mb-1">{title}</h4>
          <p className="text-sm text-slate-600">{description}</p>
          {timeInfo && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <ClockIcon size={14} />
              <span>{timeInfo}</span>
            </div>
          )}
          {extraInfo}
        </div>
      </div>
    </div>
  );
}
