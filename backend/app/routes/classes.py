from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db import get_db, transaction
from ..exceptions import ConflictError, EntityNotFoundError, NotFoundError
from ..models import Class
from ..repositories import ClassRepository, LookupRepository
from ..schemas import (
    ClassCreate,
    ClassResponse,
    ClassStatistics,
    ClassUpdate,
    ConflictResponse,
    DailyStatistics,
    StudentResponse,
)
from ..services.conflicts import (
    detect_conflicts,
    get_daily_class_count,
    get_enrollment_statistics,
    get_instructor_workload,
    get_room_utilization,
)

router = APIRouter(prefix="/classes", tags=["Classes"])


def _build_class_response(cls: Class) -> ClassResponse:
    return ClassResponse(
        id=cls.id,
        course_name=cls.course_name,
        chapter_topic=cls.chapter_topic,
        date=cls.date,
        start_time=cls.start_time,
        end_time=cls.end_time,
        room_id=cls.room_id,
        instructor_id=cls.instructor_id,
        room=cls.room,
        instructor=cls.instructor,
        students=[
            StudentResponse(id=e.student.id, name=e.student.name) 
            for e in cls.enrollments
        ],
    )


def _validate_entities(
    lookup_repo: LookupRepository,
    room_id: int,
    instructor_id: int,
    student_ids: list[int],
):
    room, instructor, missing_students = lookup_repo.validate_entities(
        room_id, instructor_id, student_ids
    )
    
    if not room:
        raise EntityNotFoundError("Room", entity_id=room_id)
    
    if not instructor:
        raise EntityNotFoundError("Instructor", entity_id=instructor_id)
    
    if missing_students:
        raise EntityNotFoundError("Student", entity_ids=list(missing_students))
    
    return room


def _check_conflicts(
    db: Session,
    room_id: int,
    instructor_id: int,
    student_ids: list[int],
    class_date: date,
    start_time,
    end_time,
    room,
    exclude_class_id: Optional[int] = None,
) -> None:
    conflicts = detect_conflicts(
        db=db,
        room_id=room_id,
        instructor_id=instructor_id,
        student_ids=student_ids,
        class_date=class_date,
        start_time=start_time,
        end_time=end_time,
        exclude_class_id=exclude_class_id,
        room=room,
        include_suggestions=True,
    )
    
    if conflicts:
        conflict_dicts = [c.model_dump(mode="json") for c in conflicts]
        raise ConflictError(conflicts=conflict_dicts)


@router.get(
    "/stats/daily",
    response_model=DailyStatistics,
    tags=["Statistics"],
    summary="Get daily statistics",
)
def get_daily_statistics(
    query_date: date = Query(..., alias="date"),
    db: Session = Depends(get_db),
):
    return DailyStatistics(
        date=query_date,
        total_classes=get_daily_class_count(db, query_date),
        room_utilization=get_room_utilization(db, query_date),
        instructor_workload=get_instructor_workload(db, query_date),
    )


@router.get("", response_model=list[ClassResponse], summary="List classes by date")
def get_classes(
    date: date = Query(..., description="Date to get classes for (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    class_repo = ClassRepository(db)
    classes = class_repo.get_by_date(date)
    return [_build_class_response(cls) for cls in classes]


@router.get(
    "/{class_id}/stats",
    response_model=ClassStatistics,
    tags=["Statistics"],
    summary="Get class statistics",
    responses={404: {"description": "Class not found"}},
)
def get_class_statistics(class_id: int, db: Session = Depends(get_db)):
    stats = get_enrollment_statistics(db, class_id)
    if not stats:
        raise NotFoundError("Class", class_id)
    return ClassStatistics(**stats)


@router.get(
    "/{class_id}",
    response_model=ClassResponse,
    summary="Get a class",
    responses={404: {"description": "Class not found"}},
)
def get_class(class_id: int, db: Session = Depends(get_db)):
    class_repo = ClassRepository(db)
    cls = class_repo.get_with_relations(class_id)
    if not cls:
        raise NotFoundError("Class", class_id)
    return _build_class_response(cls)


@router.post(
    "",
    response_model=ClassResponse,
    status_code=201,
    summary="Create a class",
    responses={
        400: {"description": "Validation error"},
        409: {"description": "Scheduling conflict", "model": ConflictResponse},
    },
)
def create_class(payload: ClassCreate, db: Session = Depends(get_db)):
    lookup_repo = LookupRepository(db)
    class_repo = ClassRepository(db)
    
    room = _validate_entities(
        lookup_repo, payload.room_id, payload.instructor_id, payload.student_ids
    )
    
    _check_conflicts(
        db, payload.room_id, payload.instructor_id, payload.student_ids,
        payload.date, payload.start_time, payload.end_time, room
    )
    
    with transaction(db):
        new_class = class_repo.create_class(
            course_name=payload.course_name,
            chapter_topic=payload.chapter_topic,
            class_date=payload.date,
            start_time=payload.start_time,
            end_time=payload.end_time,
            room_id=payload.room_id,
            instructor_id=payload.instructor_id,
        )
        class_repo.flush()
        class_repo.bulk_create_enrollments(new_class.id, payload.student_ids)
    
    cls = class_repo.get_with_relations(new_class.id)
    return _build_class_response(cls)


@router.put(
    "/{class_id}",
    response_model=ClassResponse,
    summary="Update a class",
    responses={
        400: {"description": "Validation error"},
        404: {"description": "Class not found"},
        409: {"description": "Scheduling conflict", "model": ConflictResponse},
    },
)
def update_class(class_id: int, payload: ClassUpdate, db: Session = Depends(get_db)):
    class_repo = ClassRepository(db)
    lookup_repo = LookupRepository(db)
    
    cls = class_repo.get_by_id(class_id)
    if not cls:
        raise NotFoundError("Class", class_id)
    
    room = _validate_entities(
        lookup_repo, payload.room_id, payload.instructor_id, payload.student_ids
    )
    
    _check_conflicts(
        db, payload.room_id, payload.instructor_id, payload.student_ids,
        payload.date, payload.start_time, payload.end_time, room,
        exclude_class_id=class_id
    )
    
    with transaction(db):
        class_repo.update_class(
            cls,
            course_name=payload.course_name,
            chapter_topic=payload.chapter_topic,
            class_date=payload.date,
            start_time=payload.start_time,
            end_time=payload.end_time,
            room_id=payload.room_id,
            instructor_id=payload.instructor_id,
        )
        class_repo.replace_enrollments(class_id, payload.student_ids)
    
    cls = class_repo.get_with_relations(class_id)
    return _build_class_response(cls)


@router.delete(
    "/{class_id}",
    status_code=204,
    summary="Delete a class",
    responses={404: {"description": "Class not found"}},
)
def delete_class(class_id: int, db: Session = Depends(get_db)):
    class_repo = ClassRepository(db)
    cls = class_repo.get_by_id(class_id)
    if not cls:
        raise NotFoundError("Class", class_id)
    
    with transaction(db):
        class_repo.delete(cls)
    
    return None
