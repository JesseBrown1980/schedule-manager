import { cn } from "@/lib/cn";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

function createIcon(
  paths: React.ReactNode,
  displayName: string,
  defaultStrokeWidth = 2
) {
  const Icon = ({
    size = 24,
    className,
    strokeWidth = defaultStrokeWidth,
    ...props
  }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      {paths}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

export const PlusIcon = createIcon(
  <path d="M12 4v16m8-8H4" />,
  "PlusIcon"
);

export const ChevronLeftIcon = createIcon(
  <path d="M15 18l-6-6 6-6" />,
  "ChevronLeftIcon"
);

export const ChevronRightIcon = createIcon(
  <path d="M9 18l6-6-6-6" />,
  "ChevronRightIcon"
);

export const ChevronDownIcon = createIcon(
  <path d="M19 9l-7 7-7-7" />,
  "ChevronDownIcon"
);

export const XIcon = createIcon(
  <path d="M6 18L18 6M6 6l12 12" />,
  "XIcon"
);

export const CheckIcon = createIcon(
  <path d="M5 13l4 4L19 7" />,
  "CheckIcon"
);

export const MoreVerticalIcon = createIcon(
  <>
    <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </>,
  "MoreVerticalIcon"
);

export const SortIcon = createIcon(
  <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />,
  "SortIcon",
  2.5
);

export const CalendarIcon = createIcon(
  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  "CalendarIcon"
);

export const ClockIcon = createIcon(
  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
  "ClockIcon"
);

export const LocationIcon = createIcon(
  <>
    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </>,
  "LocationIcon"
);

export const RoomIcon = createIcon(
  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
  "RoomIcon"
);

export const UserIcon = createIcon(
  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  "UserIcon"
);

export const UsersIcon = createIcon(
  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
  "UsersIcon"
);

export const EditIcon = createIcon(
  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
  "EditIcon"
);

export const TrashIcon = createIcon(
  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  "TrashIcon"
);

export const AlertCircleIcon = createIcon(
  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  "AlertCircleIcon"
);

export const AlertTriangleIcon = createIcon(
  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />,
  "AlertTriangleIcon"
);

export const CheckCircleIcon = createIcon(
  <>
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="12" r="9" />
  </>,
  "CheckCircleIcon"
);

export const InfoIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4m0-4h.01" />
  </>,
  "InfoIcon"
);

export function SpinnerIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin shrink-0", className)}
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
