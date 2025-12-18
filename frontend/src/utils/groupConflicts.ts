import type { ConflictDetail } from "@/types";

export interface GroupedConflicts {
  room: ConflictDetail[];
  instructor: ConflictDetail[];
  students: ConflictDetail[];
  capacity: ConflictDetail[];
}

/**
 * Group conflicts by type for organized display
 */
export function groupConflicts(conflicts: ConflictDetail[]): GroupedConflicts {
  const grouped: GroupedConflicts = {
    room: [],
    instructor: [],
    students: [],
    capacity: [],
  };

  conflicts.forEach((conflict) => {
    if (conflict.type === "room") {
      grouped.room.push(conflict);
    } else if (conflict.type === "instructor") {
      grouped.instructor.push(conflict);
    } else if (conflict.type === "student") {
      grouped.students.push(conflict);
    } else if (conflict.type === "capacity") {
      grouped.capacity.push(conflict);
    }
  });

  return grouped;
}
