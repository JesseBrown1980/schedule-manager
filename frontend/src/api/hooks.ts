import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRooms,
  getInstructors,
  getStudents,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} from "./client";
import type { ClassFormData } from "@/types";

export const queryKeys = {
  rooms: ["rooms"] as const,
  instructors: ["instructors"] as const,
  students: ["students"] as const,
  classes: (date: string) => ["classes", date] as const,
};

export function useRooms() {
  return useQuery({
    queryKey: queryKeys.rooms,
    queryFn: getRooms,
    staleTime: 1000 * 60 * 5,
  });
}

export function useInstructors() {
  return useQuery({
    queryKey: queryKeys.instructors,
    queryFn: getInstructors,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudents() {
  return useQuery({
    queryKey: queryKeys.students,
    queryFn: getStudents,
    staleTime: 1000 * 60 * 5,
  });
}

export function useClasses(date: string) {
  return useQuery({
    queryKey: queryKeys.classes(date),
    queryFn: () => getClasses(date),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClassFormData) => createClass(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.classes(variables.date),
      });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClassFormData }) =>
      updateClass(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.classes(variables.data.date),
      });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "classes",
      });
    },
  });
}
