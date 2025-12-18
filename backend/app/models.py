from sqlalchemy import (
    CheckConstraint,
    Column,
    Date,
    ForeignKey,
    Index,
    Integer,
    String,
    Time,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .db import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    capacity = Column(Integer, nullable=False)

    classes = relationship("Class", back_populates="room", lazy="select")

    __table_args__ = (
        CheckConstraint("capacity > 0", name="ck_rooms_positive_capacity"),
    )


class Instructor(Base):
    __tablename__ = "instructors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    classes = relationship("Class", back_populates="instructor", lazy="select")


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    enrollments = relationship("ClassEnrollment", back_populates="student", lazy="select")


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    course_name = Column(String(200), nullable=False, index=True)
    chapter_topic = Column(String(200), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False, index=True)
    instructor_id = Column(Integer, ForeignKey("instructors.id"), nullable=False, index=True)

    room = relationship("Room", back_populates="classes", lazy="joined")
    instructor = relationship("Instructor", back_populates="classes", lazy="joined")
    enrollments = relationship(
        "ClassEnrollment", 
        back_populates="class_", 
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_classes_date_room", "date", "room_id"),
        Index("ix_classes_date_instructor", "date", "instructor_id"),
        Index("ix_classes_date_times", "date", "start_time", "end_time"),
        Index("ix_classes_date_start_end_room_instructor", 
              "date", "start_time", "end_time", "room_id", "instructor_id"),
        CheckConstraint("end_time > start_time", name="ck_classes_valid_time_range"),
    )


class ClassEnrollment(Base):
    __tablename__ = "class_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)

    class_ = relationship("Class", back_populates="enrollments", lazy="joined")
    student = relationship("Student", back_populates="enrollments", lazy="joined")

    __table_args__ = (
        UniqueConstraint("class_id", "student_id", name="uq_enrollment_class_student"),
        Index("ix_enrollments_student_class", "student_id", "class_id"),
        Index("ix_enrollments_class_student", "class_id", "student_id"),
    )
