
from typing import Optional

from sqlalchemy.orm import Session

from ..models import Instructor, Room, Student
from .base import BaseRepository


class LookupRepository:
    
    def __init__(self, db: Session):
        self.db = db
        self._rooms = BaseRepository(db, Room)
        self._instructors = BaseRepository(db, Instructor)
        self._students = BaseRepository(db, Student)
    
    # ============== Room Operations ==============
    
    def get_room(self, room_id: int) -> Optional[Room]:
        return self._rooms.get_by_id(room_id)
    
    def get_all_rooms(self) -> list[Room]:
        return self.db.query(Room).order_by(Room.name).all()
    
    def get_rooms_with_capacity(self, min_capacity: int) -> list[Room]:
        return (
            self.db.query(Room)
            .filter(Room.capacity >= min_capacity)
            .order_by(Room.capacity, Room.name)
            .all()
        )
    
    # ============== Instructor Operations ==============
    
    def get_instructor(self, instructor_id: int) -> Optional[Instructor]:
        return self._instructors.get_by_id(instructor_id)
    
    def get_all_instructors(self) -> list[Instructor]:
        return self.db.query(Instructor).order_by(Instructor.name).all()
    
    # ============== Student Operations ==============
    
    def get_student(self, student_id: int) -> Optional[Student]:
        return self._students.get_by_id(student_id)
    
    def get_all_students(self) -> list[Student]:
        return self.db.query(Student).order_by(Student.name).all()
    
    def get_students_by_ids(self, student_ids: list[int]) -> list[Student]:
        if not student_ids:
            return []
        return self.db.query(Student).filter(Student.id.in_(student_ids)).all()
    
    def get_missing_student_ids(self, student_ids: list[int]) -> set[int]:  
        if not student_ids:
            return set()
        existing = self._students.get_existing_ids(student_ids)
        return set(student_ids) - existing
    
    # ============== Batch Validation ==============
    
    def validate_entities(
        self,
        room_id: int,
        instructor_id: int,
        student_ids: list[int],
    ) -> tuple[Optional[Room], Optional[Instructor], set[int]]:
        room = self.get_room(room_id)
        instructor = self.get_instructor(instructor_id)
        missing_students = self.get_missing_student_ids(student_ids)
        
        return room, instructor, missing_students

