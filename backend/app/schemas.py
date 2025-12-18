
from datetime import date, time
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ============== Room Schemas ==============
class RoomBase(BaseModel):
    name: str
    capacity: int


class RoomResponse(RoomBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ============== Instructor Schemas ==============
class InstructorBase(BaseModel):
    name: str


class InstructorResponse(InstructorBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ============== Student Schemas ==============
class StudentBase(BaseModel):
    name: str


class StudentResponse(StudentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ============== Class Schemas ==============
class ClassBase(BaseModel):
    course_name: str = Field(..., min_length=1, max_length=200)
    chapter_topic: str = Field(..., min_length=1, max_length=200)
    date: date
    start_time: time
    end_time: time
    room_id: int
    instructor_id: int
    student_ids: list[int] = Field(default_factory=list)

    @field_validator("end_time")
    @classmethod
    def end_time_after_start(cls, v: time, info) -> time:
        start = info.data.get("start_time")
        if start and v <= start:
            raise ValueError("end_time must be after start_time")
        return v


class ClassCreate(ClassBase):
    pass


class ClassUpdate(ClassBase):
    pass


class ClassResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    course_name: str
    chapter_topic: str
    date: date
    start_time: time
    end_time: time
    room_id: int
    instructor_id: int
    room: RoomResponse
    instructor: InstructorResponse
    students: list[StudentResponse]


# ============== Conflict Schemas ==============
ConflictType = Literal["room", "instructor", "student", "capacity"]


class ConflictResource(BaseModel):
    id: int
    name: str


class ExistingClassInfo(BaseModel):
    id: int
    course_name: str
    date: date
    start_time: time
    end_time: time


class ConflictDetail(BaseModel):
    type: ConflictType
    message: str
    suggestion: Optional[str] = None
    resource: Optional[ConflictResource] = None
    existing_class: Optional[ExistingClassInfo] = None


class ConflictResponse(BaseModel):
    error: str = "conflict"
    message: str = "Cannot save class due to scheduling conflicts"
    conflicts: list[ConflictDetail]


# ============== Error Response Schemas ==============
class ErrorDetail(BaseModel):
    error: str
    message: str
    details: Optional[dict] = None


class ValidationErrorResponse(BaseModel):
    detail: ErrorDetail


class NotFoundErrorResponse(BaseModel):
    detail: ErrorDetail


class ServerErrorResponse(BaseModel):
    detail: ErrorDetail


# ============== Statistics Schemas ==============
class RoomUtilization(BaseModel):
    room_id: int
    room_name: str
    capacity: int
    class_count: int


class InstructorWorkload(BaseModel):
    instructor_id: int
    instructor_name: str
    class_count: int


class DailyStatistics(BaseModel):
    date: date
    total_classes: int
    room_utilization: list[RoomUtilization]
    instructor_workload: list[InstructorWorkload]


class ClassStatistics(BaseModel):
    class_id: int
    course_name: str
    room_capacity: int
    enrolled_count: int
    available_spots: int
    utilization_percent: float
