
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..repositories import LookupRepository
from ..schemas import InstructorResponse, RoomResponse, StudentResponse

router = APIRouter(tags=["Lookups"])


@router.get(
    "/rooms",
    response_model=list[RoomResponse],
    summary="List all rooms",
    description="Get all rooms for dropdown selection, ordered by name.",
)
def get_rooms(db: Session = Depends(get_db)):
    repo = LookupRepository(db)
    return repo.get_all_rooms()


@router.get(
    "/instructors",
    response_model=list[InstructorResponse],
    summary="List all instructors",
    description="Get all instructors for dropdown selection, ordered by name.",
)
def get_instructors(db: Session = Depends(get_db)):
    repo = LookupRepository(db)
    return repo.get_all_instructors()


@router.get(
    "/students",
    response_model=list[StudentResponse],
    summary="List all students",
    description="Get all students for enrollment selection, ordered by name.",
)
def get_students(db: Session = Depends(get_db)):
    repo = LookupRepository(db)
    return repo.get_all_students()
