
from datetime import date, time
from typing import Optional, NamedTuple

from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session, joinedload

from ..models import Class, ClassEnrollment, Instructor, Room, Student
from ..schemas import ConflictDetail, ConflictResource, ExistingClassInfo


class TimeOverlapFilter(NamedTuple):
    conditions: list
    
    @classmethod
    def create(
        cls,
        class_date: date,
        start_time: time,
        end_time: time,
        exclude_class_id: Optional[int] = None,
    ) -> "TimeOverlapFilter":
        conditions = [
            Class.date == class_date,
            Class.start_time < end_time,
            Class.end_time > start_time,
        ]
        if exclude_class_id:
            conditions.append(Class.id != exclude_class_id)
        return cls(conditions=conditions)


class ConflictSuggestion:
    @staticmethod
    def for_room_conflict(
        room_name: str,
        available_rooms: Optional[list[Room]] = None,
    ) -> str:
        if not available_rooms:
            return f"Select a different time slot or choose another room"
        
        room_options = ", ".join(r.name for r in available_rooms[:3])
        suffix = "..." if len(available_rooms) > 3 else ""
        return f"Available rooms at this time: {room_options}{suffix}"
    
    @staticmethod
    def for_instructor_conflict(
        instructor_name: str,
        available_instructors: Optional[list[Instructor]] = None,
    ) -> str:
        if not available_instructors:
            return f"Select a different time slot or choose another instructor"
        
        instructor_options = ", ".join(i.name for i in available_instructors[:3])
        suffix = "..." if len(available_instructors) > 3 else ""
        return f"Available instructors at this time: {instructor_options}{suffix}"
    
    @staticmethod
    def for_student_conflict(student_name: str, conflicting_course: str) -> str:
        return f"Remove {student_name} from this class or reschedule to avoid overlap with {conflicting_course}"
    
    @staticmethod
    def for_capacity_conflict(
        room_name: str,
        capacity: int,
        student_count: int,
        larger_rooms: Optional[list[Room]] = None,
    ) -> str:
        over_by = student_count - capacity
        
        if larger_rooms:
            room_options = ", ".join(
                f"{r.name} (capacity: {r.capacity})" for r in larger_rooms[:3]
            )
            return f"Choose a larger room: {room_options}"
        
        return f"Remove at least {over_by} student(s) or select a larger room"


def find_available_rooms(
    db: Session,
    class_date: date,
    start_time: time,
    end_time: time,
    exclude_room_id: int,
    min_capacity: int = 0,
    exclude_class_id: Optional[int] = None,
) -> list[Room]:
    overlap = TimeOverlapFilter.create(class_date, start_time, end_time, exclude_class_id)
    
    booked_room_ids = (
        db.query(Class.room_id)
        .filter(and_(*overlap.conditions))
        .subquery()
    )
    
    available = (
        db.query(Room)
        .filter(
            Room.id != exclude_room_id,
            Room.id.notin_(booked_room_ids),
            Room.capacity >= min_capacity,
        )
        .order_by(Room.capacity, Room.name)
        .limit(5)
        .all()
    )
    
    return available


def find_available_instructors(
    db: Session,
    class_date: date,
    start_time: time,
    end_time: time,
    exclude_instructor_id: int,
    exclude_class_id: Optional[int] = None,
) -> list[Instructor]:
    overlap = TimeOverlapFilter.create(class_date, start_time, end_time, exclude_class_id)
    
    busy_instructor_ids = (
        db.query(Class.instructor_id)
        .filter(and_(*overlap.conditions))
        .subquery()
    )
    
    available = (
        db.query(Instructor)
        .filter(
            Instructor.id != exclude_instructor_id,
            Instructor.id.notin_(busy_instructor_ids),
        )
        .order_by(Instructor.name)
        .limit(5)
        .all()
    )
    
    return available


def find_larger_rooms(
    db: Session,
    class_date: date,
    start_time: time,
    end_time: time,
    min_capacity: int,
    exclude_class_id: Optional[int] = None,
) -> list[Room]:
    overlap = TimeOverlapFilter.create(class_date, start_time, end_time, exclude_class_id)
    
    booked_room_ids = (
        db.query(Class.room_id)
        .filter(and_(*overlap.conditions))
        .subquery()
    )
    
    available = (
        db.query(Room)
        .filter(
            Room.capacity >= min_capacity,
            Room.id.notin_(booked_room_ids),
        )
        .order_by(Room.capacity, Room.name)
        .limit(5)
        .all()
    )
    
    return available


def detect_room_conflicts(
    db: Session,
    room_id: int,
    class_date: date,
    start_time: time,
    end_time: time,
    exclude_class_id: Optional[int] = None,
    include_suggestions: bool = True,
) -> list[ConflictDetail]:
    overlap = TimeOverlapFilter.create(class_date, start_time, end_time, exclude_class_id)
    
    conflicting_classes = (
        db.query(Class)
        .options(joinedload(Class.room))
        .filter(
            and_(
                *overlap.conditions,
                Class.room_id == room_id,
            )
        )
        .all()
    )
    
    if not conflicting_classes:
        return []
    
    available_rooms = None
    if include_suggestions:
        available_rooms = find_available_rooms(
            db, class_date, start_time, end_time, room_id, 
            exclude_class_id=exclude_class_id
        )
    
    conflicts = []
    for cls in conflicting_classes:
        room_name = cls.room.name if cls.room else f"Room #{cls.room_id}"
        suggestion = ConflictSuggestion.for_room_conflict(room_name, available_rooms)
        
        conflicts.append(
            ConflictDetail(
                type="room",
                message=f"Room {room_name} is already booked for {cls.course_name}",
                suggestion=suggestion,
                resource=ConflictResource(id=cls.room_id, name=room_name),
                existing_class=ExistingClassInfo(
                    id=cls.id,
                    course_name=cls.course_name,
                    date=cls.date,
                    start_time=cls.start_time,
                    end_time=cls.end_time,
                ),
            )
        )
    return conflicts


def detect_instructor_conflicts(
    db: Session,
    instructor_id: int,
    class_date: date,
    start_time: time,
    end_time: time,
    exclude_class_id: Optional[int] = None,
    include_suggestions: bool = True,
) -> list[ConflictDetail]:
    overlap = TimeOverlapFilter.create(class_date, start_time, end_time, exclude_class_id)
    
    conflicting_classes = (
        db.query(Class)
        .options(joinedload(Class.instructor))
        .filter(
            and_(
                *overlap.conditions,
                Class.instructor_id == instructor_id,
            )
        )
        .all()
    )
    
    if not conflicting_classes:
        return []
    
    available_instructors = None
    if include_suggestions:
        available_instructors = find_available_instructors(
            db, class_date, start_time, end_time, instructor_id,
            exclude_class_id=exclude_class_id
        )
    
    conflicts = []
    for cls in conflicting_classes:
        instructor_name = cls.instructor.name if cls.instructor else f"Instructor #{cls.instructor_id}"
        suggestion = ConflictSuggestion.for_instructor_conflict(instructor_name, available_instructors)
        
        conflicts.append(
            ConflictDetail(
                type="instructor",
                message=f"Instructor {instructor_name} is already teaching {cls.course_name}",
                suggestion=suggestion,
                resource=ConflictResource(id=cls.instructor_id, name=instructor_name),
                existing_class=ExistingClassInfo(
                    id=cls.id,
                    course_name=cls.course_name,
                    date=cls.date,
                    start_time=cls.start_time,
                    end_time=cls.end_time,
                ),
            )
        )
    return conflicts


def detect_room_and_instructor_conflicts(
    db: Session,
    room_id: int,
    instructor_id: int,
    class_date: date,
    start_time: time,
    end_time: time,
    exclude_class_id: Optional[int] = None,
    include_suggestions: bool = True,
) -> list[ConflictDetail]:
    conflicts = []
    overlap = TimeOverlapFilter.create(class_date, start_time, end_time, exclude_class_id)
    
    conflicting_classes = (
        db.query(Class)
        .options(joinedload(Class.room), joinedload(Class.instructor))
        .filter(
            and_(
                *overlap.conditions,
                or_(
                    Class.room_id == room_id,
                    Class.instructor_id == instructor_id,
                ),
            )
        )
        .all()
    )
    
    if not conflicting_classes:
        return []
    
    available_rooms = None
    available_instructors = None
    
    has_room_conflict = any(c.room_id == room_id for c in conflicting_classes)
    has_instructor_conflict = any(c.instructor_id == instructor_id for c in conflicting_classes)
    
    if include_suggestions:
        if has_room_conflict:
            available_rooms = find_available_rooms(
                db, class_date, start_time, end_time, room_id,
                exclude_class_id=exclude_class_id
            )
        if has_instructor_conflict:
            available_instructors = find_available_instructors(
                db, class_date, start_time, end_time, instructor_id,
                exclude_class_id=exclude_class_id
            )
    
    for cls in conflicting_classes:
        if cls.room_id == room_id:
            room_name = cls.room.name if cls.room else f"Room #{cls.room_id}"
            suggestion = ConflictSuggestion.for_room_conflict(room_name, available_rooms)
            
            conflicts.append(
                ConflictDetail(
                    type="room",
                    message=f"Room {room_name} is already booked for {cls.course_name}",
                    suggestion=suggestion,
                    resource=ConflictResource(id=cls.room_id, name=room_name),
                    existing_class=ExistingClassInfo(
                        id=cls.id,
                        course_name=cls.course_name,
                        date=cls.date,
                        start_time=cls.start_time,
                        end_time=cls.end_time,
                    ),
                )
            )
        
        if cls.instructor_id == instructor_id:
            instructor_name = cls.instructor.name if cls.instructor else f"Instructor #{cls.instructor_id}"
            suggestion = ConflictSuggestion.for_instructor_conflict(instructor_name, available_instructors)
            
            conflicts.append(
                ConflictDetail(
                    type="instructor",
                    message=f"Instructor {instructor_name} is already teaching {cls.course_name}",
                    suggestion=suggestion,
                    resource=ConflictResource(id=cls.instructor_id, name=instructor_name),
                    existing_class=ExistingClassInfo(
                        id=cls.id,
                        course_name=cls.course_name,
                        date=cls.date,
                        start_time=cls.start_time,
                        end_time=cls.end_time,
                    ),
                )
            )
    
    return conflicts


def detect_student_conflicts(
    db: Session,
    student_ids: list[int],
    class_date: date,
    start_time: time,
    end_time: time,
    exclude_class_id: Optional[int] = None,
) -> list[ConflictDetail]:
    if not student_ids:
        return []
    
    conflicts = []
    overlap = TimeOverlapFilter.create(class_date, start_time, end_time, exclude_class_id)
    
    query = (
        db.query(ClassEnrollment, Class, Student)
        .join(Class, ClassEnrollment.class_id == Class.id)
        .join(Student, ClassEnrollment.student_id == Student.id)
        .filter(
            and_(
                ClassEnrollment.student_id.in_(student_ids),
                *overlap.conditions,
            )
        )
        .order_by(Student.id, Class.start_time)
    )
    
    conflicting_enrollments = query.all()
    
    for enrollment, cls, student in conflicting_enrollments:
        suggestion = ConflictSuggestion.for_student_conflict(student.name, cls.course_name)
        
        conflicts.append(
            ConflictDetail(
                type="student",
                message=f"Student {student.name} is already enrolled in {cls.course_name}",
                suggestion=suggestion,
                resource=ConflictResource(id=student.id, name=student.name),
                existing_class=ExistingClassInfo(
                    id=cls.id,
                    course_name=cls.course_name,
                    date=cls.date,
                    start_time=cls.start_time,
                    end_time=cls.end_time,
                ),
            )
        )
    
    return conflicts


def detect_capacity_conflict(
    db: Session,
    room_id: int,
    student_count: int,
    class_date: date,
    start_time: time,
    end_time: time,
    room: Optional[Room] = None,
    exclude_class_id: Optional[int] = None,
    include_suggestions: bool = True,
) -> list[ConflictDetail]:
    if room is None:
        room = db.query(Room).filter(Room.id == room_id).first()
    
    if not room:
        return []
    
    if student_count <= room.capacity:
        return []
    
    larger_rooms = None
    if include_suggestions:
        larger_rooms = find_larger_rooms(
            db, class_date, start_time, end_time, student_count,
            exclude_class_id=exclude_class_id
        )
    
    suggestion = ConflictSuggestion.for_capacity_conflict(
        room.name, room.capacity, student_count, larger_rooms
    )
    
    return [
        ConflictDetail(
            type="capacity",
            message=f"Room {room.name} has capacity {room.capacity}, but {student_count} students enrolled",
            suggestion=suggestion,
            resource=ConflictResource(id=room.id, name=room.name),
            existing_class=None,
        )
    ]


def detect_conflicts(
    db: Session,
    room_id: int,
    instructor_id: int,
    student_ids: list[int],
    class_date: date,
    start_time: time,
    end_time: time,
    exclude_class_id: Optional[int] = None,
    room: Optional[Room] = None,
    include_suggestions: bool = True,
) -> list[ConflictDetail]:
    all_conflicts: list[ConflictDetail] = []
    
    all_conflicts.extend(
        detect_room_and_instructor_conflicts(
            db, room_id, instructor_id, class_date, start_time, end_time, 
            exclude_class_id, include_suggestions
        )
    )
    
    all_conflicts.extend(
        detect_student_conflicts(
            db, student_ids, class_date, start_time, end_time, exclude_class_id
        )
    )
    
    all_conflicts.extend(
        detect_capacity_conflict(
            db, room_id, len(student_ids), class_date, start_time, end_time,
            room, exclude_class_id, include_suggestions
        )
    )
    
    return all_conflicts


def get_daily_class_count(db: Session, class_date: date) -> int:
    return db.query(func.count(Class.id)).filter(Class.date == class_date).scalar() or 0


def get_room_utilization(db: Session, class_date: date) -> list[dict]:
    results = (
        db.query(
            Room.id,
            Room.name,
            Room.capacity,
            func.count(Class.id).label("class_count"),
        )
        .outerjoin(Class, and_(Class.room_id == Room.id, Class.date == class_date))
        .group_by(Room.id, Room.name, Room.capacity)
        .order_by(Room.name)
        .all()
    )
    
    return [
        {
            "room_id": r.id,
            "room_name": r.name,
            "capacity": r.capacity,
            "class_count": r.class_count,
        }
        for r in results
    ]


def get_instructor_workload(db: Session, class_date: date) -> list[dict]:
    results = (
        db.query(
            Instructor.id,
            Instructor.name,
            func.count(Class.id).label("class_count"),
        )
        .outerjoin(Class, and_(Class.instructor_id == Instructor.id, Class.date == class_date))
        .group_by(Instructor.id, Instructor.name)
        .having(func.count(Class.id) > 0)
        .order_by(func.count(Class.id).desc())
        .all()
    )
    
    return [
        {
            "instructor_id": r.id,
            "instructor_name": r.name,
            "class_count": r.class_count,
        }
        for r in results
    ]


def get_enrollment_statistics(db: Session, class_id: int) -> dict:
    result = (
        db.query(
            Class.id,
            Class.course_name,
            Room.capacity.label("room_capacity"),
            func.count(ClassEnrollment.id).label("enrolled_count"),
        )
        .join(Room, Class.room_id == Room.id)
        .outerjoin(ClassEnrollment, ClassEnrollment.class_id == Class.id)
        .filter(Class.id == class_id)
        .group_by(Class.id, Class.course_name, Room.capacity)
        .first()
    )
    
    if not result:
        return {}
    
    return {
        "class_id": result.id,
        "course_name": result.course_name,
        "room_capacity": result.room_capacity,
        "enrolled_count": result.enrolled_count,
        "available_spots": result.room_capacity - result.enrolled_count,
        "utilization_percent": round(result.enrolled_count / result.room_capacity * 100, 1) if result.room_capacity > 0 else 0,
    }
