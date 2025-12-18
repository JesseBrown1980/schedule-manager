export interface Room {
  id: number
  name: string
  capacity: number
}

export interface Instructor {
  id: number
  name: string
}

export interface Student {
  id: number
  name: string
}

export interface Class {
  id: number
  course_name: string
  chapter_topic: string
  date: string
  start_time: string
  end_time: string
  room_id: number
  instructor_id: number
  room: Room
  instructor: Instructor
  students: Student[]
}

export interface ClassFormData {
  course_name: string
  chapter_topic: string
  date: string
  start_time: string
  end_time: string
  room_id: number
  instructor_id: number
  student_ids: number[]
}

export interface ConflictResource {
  id: number
  name: string
}

export interface ExistingClassInfo {
  id: number
  course_name: string
  date: string
  start_time: string
  end_time: string
}

export interface ConflictDetail {
  type: 'room' | 'instructor' | 'student' | 'capacity'
  message: string
  resource?: ConflictResource
  existing_class?: ExistingClassInfo
}

export interface ConflictResponse {
  error: string
  message: string
  conflicts: ConflictDetail[]
}

export class ApiError extends Error {
  status: number
  conflicts?: ConflictDetail[]

  constructor(message: string, status: number, conflicts?: ConflictDetail[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.conflicts = conflicts
  }
}

