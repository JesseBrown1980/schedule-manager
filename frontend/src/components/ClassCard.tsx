import { memo } from "react";
import { cn } from "@/lib/cn";
import type { Class } from "@/types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  LocationIcon,
  UserIcon,
} from "@/components/ui";

interface ClassCardProps {
  classData: Class;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const gradients = [
  "bg-gradient-to-b from-[#667EEA] to-[#764BA2]",
  "bg-gradient-to-b from-[#F857A6] to-[#FF5858]",
  "bg-gradient-to-b from-[#00DBDE] to-[#3A7BD5]",
  "bg-gradient-to-b from-[#43E97B] to-[#38F9D7]",
  "bg-gradient-to-b from-[#FA709A] to-[#FEE140]",
];

export const ClassCard = memo(function ClassCard({
  classData,
  index,
  onEdit,
  onDelete,
}: ClassCardProps) {
  const gradient = gradients[index % gradients.length];

  return (
    <div
      className={cn(
        "relative rounded-2xl p-5 bp-717:p-6 text-white",
        "shadow-card hover:shadow-card-hover transition-all duration-300",
        "animate-slide-up",
        gradient
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "backwards",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg bp-717:text-xl font-semibold pr-8">
          {classData.course_name}
        </h3>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                "absolute top-4 right-4 p-1.5 rounded-lg",
                "hover:bg-white/20 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-white/50"
              )}
              aria-label="Class options"
            >
              <MoreVerticalIcon size={20} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={cn(
                "min-w-[160px] bg-white rounded-xl shadow-dialog p-1.5",
                "animate-fade-in z-50"
              )}
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                  "text-content cursor-pointer",
                  "hover:bg-slate-100 focus:bg-slate-100 outline-none"
                )}
                onSelect={onEdit}
              >
                <EditIcon size={16} />
                Edit Class
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                  "text-error-600 cursor-pointer",
                  "hover:bg-error-50 focus:bg-error-50 outline-none"
                )}
                onSelect={onDelete}
              >
                <TrashIcon size={16} />
                Delete Class
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <p className="text-xs bp-717:text-sm text-white/80 mb-4">
        {classData.chapter_topic}
      </p>

      <div className="flex flex-col gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-xl w-fit",
            "bg-white/20 text-white text-xs bp-717:text-sm font-medium",
            "backdrop-blur-sm"
          )}
        >
          <LocationIcon size={14} />
          {classData.room.name}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-xl w-fit",
            "bg-white/20 text-white text-xs bp-717:text-sm font-medium",
            "backdrop-blur-sm"
          )}
        >
          <UserIcon size={14} />
          {classData.instructor.name}
        </span>
      </div>
    </div>
  );
});
