
from datetime import date
from typing import Optional

from sqlalchemy import and_
from sqlalchemy.orm import Session, joinedload

from ..models import Class, ClassEnrollment
from .base import BaseRepository


class ClassRepository(BaseRepository[Class]):
    def __init__(self, db: Session):
        super().__init__(db, Class)
    
    def get_with_relations(self, class_id: int) -> Optional[Class]:
        return (
            self.db.query(Class)
            .options(
                joinedload(Class.room),
                joinedload(Class.instructor),
                joinedload(Class.enrollments).joinedload(ClassEnrollment.student),
            )
            .filter(Class.id == class_id)
            .first()
        )
    
    def get_by_date(self, class_date: date) -> list[Class]:
        return (
            self.db.query(Class)
            .options(
                joinedload(Class.room),
                joinedload(Class.instructor),
                joinedload(Class.enrollments).joinedload(ClassEnrollment.student),
            )
            .filter(Class.date == class_date)
            .order_by(Class.start_time)
            .all()
        )
    
    def create_class(
        self,
        course_name: str,
        chapter_topic: str,
        class_date: date,
        start_time,
        end_time,
        room_id: int,
        instructor_id: int,
    ) -> Class:
        new_class = Class(
            course_name=course_name,
            chapter_topic=chapter_topic,
            date=class_date,
            start_time=start_time,
            end_time=end_time,
            room_id=room_id,
            instructor_id=instructor_id,
        )
        self.add(new_class)
        return new_class
    
    def update_class(
        self,
        cls: Class,
        course_name: str,
        chapter_topic: str,
        class_date: date,
        start_time,
        end_time,
        room_id: int,
        instructor_id: int,
    ) -> Class:
        cls.course_name = course_name
        cls.chapter_topic = chapter_topic
        cls.date = class_date
        cls.start_time = start_time
        cls.end_time = end_time
        cls.room_id = room_id
        cls.instructor_id = instructor_id
        return cls
    
    # ============== Enrollment Operations ==============
    
    def bulk_create_enrollments(self, class_id: int, student_ids: list[int]) -> None:
        if not student_ids:
            return
        
        self.db.bulk_insert_mappings(
            ClassEnrollment,
            [{"class_id": class_id, "student_id": sid} for sid in student_ids],
        )
    
    def delete_enrollments(self, class_id: int) -> int:
        return (
            self.db.query(ClassEnrollment)
            .filter(ClassEnrollment.class_id == class_id)
            .delete(synchronize_session=False)
        )
    
    def replace_enrollments(self, class_id: int, student_ids: list[int]) -> None:
        self.delete_enrollments(class_id)
        self.bulk_create_enrollments(class_id, student_ids)

