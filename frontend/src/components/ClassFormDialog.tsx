import { useEffect, useState, memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { cn } from "@/lib/cn";
import { formatDateForApi } from "@/utils/dates";
import { useRooms, useInstructors, useStudents } from "@/api/hooks";
import type { Class } from "@/types";
import {
  Button,
  SpinnerIcon,
  XIcon,
  ChevronDownIcon,
  CheckIcon,
  TrashIcon,
} from "@/components/ui";

const formSchema = z
  .object({
    course_name: z.string().min(1, "Course name is required"),
    chapter_topic: z.string().min(1, "Chapter/topic is required"),
    date: z.string().min(1, "Date is required"),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    room_id: z
      .number({ required_error: "Room is required" })
      .positive("Room is required"),
    instructor_id: z
      .number({ required_error: "Instructor is required" })
      .positive("Instructor is required"),
    student_ids: z.array(z.number()),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

type FormData = z.infer<typeof formSchema>;

interface ClassFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  editingClass?: Class | null;
  selectedDate: Date;
  isLoading?: boolean;
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-content mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
}

export const ClassFormDialog = memo(function ClassFormDialog({
  open,
  onClose,
  onSubmit,
  onDelete,
  editingClass,
  selectedDate,
  isLoading = false,
}: ClassFormDialogProps) {
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: instructors = [], isLoading: instructorsLoading } =
    useInstructors();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_name: "",
      chapter_topic: "",
      date: formatDateForApi(selectedDate),
      start_time: "09:00",
      end_time: "10:30",
      room_id: 0,
      instructor_id: 0,
      student_ids: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (editingClass) {
        reset({
          course_name: editingClass.course_name,
          chapter_topic: editingClass.chapter_topic,
          date: editingClass.date,
          start_time: editingClass.start_time.slice(0, 5),
          end_time: editingClass.end_time.slice(0, 5),
          room_id: editingClass.room_id,
          instructor_id: editingClass.instructor_id,
          student_ids: editingClass.students.map((s) => s.id),
        });
        setSelectedStudents(editingClass.students.map((s) => s.id));
      } else {
        reset({
          course_name: "",
          chapter_topic: "",
          date: formatDateForApi(selectedDate),
          start_time: "09:00",
          end_time: "10:30",
          room_id: 0,
          instructor_id: 0,
          student_ids: [],
        });
        setSelectedStudents([]);
      }
    }
  }, [open, editingClass, selectedDate, reset]);

  useEffect(() => {
    setValue("student_ids", selectedStudents);
  }, [selectedStudents, setValue]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
  };

  const toggleStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const isEditing = !!editingClass;
  const isDataLoading = roomsLoading || instructorsLoading || studentsLoading;

  const inputStyles = cn(
    "w-full px-4 py-2.5 rounded-xl border",
    "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
    "transition-all duration-200"
  );

  const inputErrorStyles = "border-error-500 bg-error-50";
  const inputNormalStyles = "border-slate-200 bg-white";

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in z-50" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[calc(100%-2rem)] max-w-lg",
            "bg-white rounded-2xl shadow-dialog",
            "animate-slide-up z-50",
            "max-h-[90vh] overflow-hidden flex flex-col"
          )}
        >
          <div className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] px-6 py-5 text-white relative">
            <Dialog.Title className="text-xl font-semibold">
              {isEditing ? "Edit Class" : "Create New Class"}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-white/90 mt-1">
              {isEditing
                ? "Update class information"
                : "Fill in the details below"}
            </Dialog.Description>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <XIcon size={20} />
            </button>
          </div>

          {isDataLoading && (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <SpinnerIcon size={32} className="text-primary-500" />
                <span className="text-content-secondary">
                  Loading form data...
                </span>
              </div>
            </div>
          )}

          {!isDataLoading && (
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex-1 overflow-y-auto"
            >
              <div className="p-6 space-y-5">
                <FormField
                  label="Course Name"
                  required
                  error={errors.course_name?.message}
                >
                  <input
                    {...register("course_name")}
                    className={cn(
                      inputStyles,
                      errors.course_name ? inputErrorStyles : inputNormalStyles
                    )}
                    placeholder="e.g., Mathematics"
                  />
                </FormField>

                <FormField
                  label="Chapter/Topic"
                  required
                  error={errors.chapter_topic?.message}
                >
                  <input
                    {...register("chapter_topic")}
                    className={cn(
                      inputStyles,
                      errors.chapter_topic
                        ? inputErrorStyles
                        : inputNormalStyles
                    )}
                    placeholder="e.g., Chapter 5: Calculus Fundamentals"
                  />
                </FormField>

                <FormField label="Date" required error={errors.date?.message}>
                  <input
                    type="date"
                    {...register("date")}
                    className={cn(
                      inputStyles,
                      errors.date ? inputErrorStyles : inputNormalStyles
                    )}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Start Time"
                    required
                    error={errors.start_time?.message}
                  >
                    <input
                      type="time"
                      {...register("start_time")}
                      className={cn(
                        inputStyles,
                        errors.start_time ? inputErrorStyles : inputNormalStyles
                      )}
                    />
                  </FormField>
                  <FormField
                    label="End Time"
                    required
                    error={errors.end_time?.message}
                  >
                    <input
                      type="time"
                      {...register("end_time")}
                      className={cn(
                        inputStyles,
                        errors.end_time ? inputErrorStyles : inputNormalStyles
                      )}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Room"
                  required
                  error={errors.room_id?.message}
                >
                  <Controller
                    name="room_id"
                    control={control}
                    render={({ field }) => (
                      <Select.Root
                        value={field.value?.toString() || ""}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value, 10))
                        }
                      >
                        <Select.Trigger
                          className={cn(
                            inputStyles,
                            "flex items-center justify-between",
                            errors.room_id
                              ? inputErrorStyles
                              : inputNormalStyles
                          )}
                        >
                          <Select.Value placeholder="Select a room" />
                          <Select.Icon>
                            <ChevronDownIcon
                              size={16}
                              className="text-slate-400"
                            />
                          </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content
                            className="bg-white rounded-xl shadow-dialog border border-slate-200 overflow-hidden z-50"
                            position="popper"
                            sideOffset={5}
                          >
                            <Select.Viewport className="p-1">
                              {rooms.map((room) => (
                                <Select.Item
                                  key={room.id}
                                  value={room.id.toString()}
                                  className={cn(
                                    "px-4 py-2.5 rounded-lg cursor-pointer",
                                    "hover:bg-primary-50 focus:bg-primary-50 outline-none",
                                    "flex items-center justify-between"
                                  )}
                                >
                                  <Select.ItemText>{room.name}</Select.ItemText>
                                  <span className="text-xs text-slate-400">
                                    Capacity: {room.capacity}
                                  </span>
                                </Select.Item>
                              ))}
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    )}
                  />
                </FormField>

                <FormField
                  label="Instructor"
                  required
                  error={errors.instructor_id?.message}
                >
                  <Controller
                    name="instructor_id"
                    control={control}
                    render={({ field }) => (
                      <Select.Root
                        value={field.value?.toString() || ""}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value, 10))
                        }
                      >
                        <Select.Trigger
                          className={cn(
                            inputStyles,
                            "flex items-center justify-between",
                            errors.instructor_id
                              ? inputErrorStyles
                              : inputNormalStyles
                          )}
                        >
                          <Select.Value placeholder="Select an instructor" />
                          <Select.Icon>
                            <ChevronDownIcon
                              size={16}
                              className="text-slate-400"
                            />
                          </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content
                            className="bg-white rounded-xl shadow-dialog border border-slate-200 overflow-hidden z-50"
                            position="popper"
                            sideOffset={5}
                          >
                            <Select.Viewport className="p-1">
                              {instructors.map((instructor) => (
                                <Select.Item
                                  key={instructor.id}
                                  value={instructor.id.toString()}
                                  className={cn(
                                    "px-4 py-2.5 rounded-lg cursor-pointer",
                                    "hover:bg-primary-50 focus:bg-primary-50 outline-none"
                                  )}
                                >
                                  <Select.ItemText>
                                    {instructor.name}
                                  </Select.ItemText>
                                </Select.Item>
                              ))}
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    )}
                  />
                </FormField>

                <FormField label="Students">
                  <Controller
                    name="student_ids"
                    control={control}
                    render={() => (
                      <Select.Root
                        value=""
                        onValueChange={(value) => {
                          const studentId = parseInt(value, 10);
                          toggleStudent(studentId);
                        }}
                      >
                        <Select.Trigger
                          className={cn(
                            inputStyles,
                            "flex items-center justify-between",
                            "border-slate-200 bg-white text-slate-500"
                          )}
                        >
                          <Select.Value placeholder="Add a student" />
                          <Select.Icon>
                            <ChevronDownIcon
                              size={16}
                              className="text-slate-400"
                            />
                          </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content
                            className="bg-white rounded-xl shadow-dialog border border-slate-200 overflow-hidden z-50"
                            position="popper"
                            sideOffset={5}
                          >
                            <Select.Viewport className="p-1 max-h-60 overflow-y-auto">
                              {students.map((student) => {
                                const isSelected = selectedStudents.includes(
                                  student.id
                                );
                                return (
                                  <Select.Item
                                    key={student.id}
                                    value={student.id.toString()}
                                    className={cn(
                                      "px-4 py-2.5 rounded-lg cursor-pointer",
                                      "hover:bg-primary-50 focus:bg-primary-50 outline-none",
                                      "flex items-center justify-between"
                                    )}
                                  >
                                    <Select.ItemText>
                                      {student.name}
                                    </Select.ItemText>
                                    {isSelected && (
                                      <CheckIcon
                                        size={16}
                                        className="text-primary-600"
                                        strokeWidth={2.5}
                                      />
                                    )}
                                  </Select.Item>
                                );
                              })}
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    )}
                  />

                  {selectedStudents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedStudents.map((studentId) => {
                        const student = students.find(
                          (s) => s.id === studentId
                        );
                        if (!student) return null;
                        return (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => toggleStudent(student.id)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm font-medium",
                              "bg-slate-100 text-slate-700",
                              "flex items-center gap-1.5",
                              "hover:bg-slate-200 transition-colors"
                            )}
                          >
                            {student.name}
                            <XIcon size={14} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-slate-500">
                    {selectedStudents.length} student
                    {selectedStudents.length !== 1 ? "s" : ""} enrolled
                  </p>
                </FormField>
              </div>

              <div
                className={cn(
                  "border-t border-slate-200 p-4 bg-slate-50 flex gap-3",
                  isEditing ? "justify-between" : "justify-end"
                )}
              >
                {isEditing && onDelete && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={onDelete}
                    disabled={isLoading}
                    leftIcon={<TrashIcon size={16} />}
                  >
                    Delete Class
                  </Button>
                )}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isLoading}>
                    {isEditing ? "Save Changes" : "Create Class"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
