"""Tests for conflict detection logic."""
from datetime import date, time

import pytest

from app.models import Class, ClassEnrollment
from app.services.conflicts import (
    detect_conflicts,
    detect_room_conflicts,
    detect_instructor_conflicts,
    detect_student_conflicts,
    detect_capacity_conflict,
)


class TestTimeOverlapLogic:
    """Test the time overlap detection logic."""
    
    def test_overlapping_times_conflict(self, db, seed_data):
        """Class A: 10:00-11:30, Class B: 11:00-12:30 → CONFLICT"""
        rooms = seed_data["rooms"]
        instructors = seed_data["instructors"]
        
        # Create existing class
        existing = Class(
            course_name="Existing Class",
            chapter_topic="Topic",
            date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
            room_id=rooms[0].id,
            instructor_id=instructors[0].id,
        )
        db.add(existing)
        db.commit()
        
        # Check for room conflict with overlapping time
        conflicts = detect_room_conflicts(
            db=db,
            room_id=rooms[0].id,
            class_date=date(2024, 1, 15),
            start_time=time(11, 0),
            end_time=time(12, 30),
        )
        
        assert len(conflicts) == 1
        assert conflicts[0].type == "room"
    
    def test_adjacent_times_no_conflict(self, db, seed_data):
        """Class A: 10:00-11:00, Class B: 11:00-12:00 → NO CONFLICT"""
        rooms = seed_data["rooms"]
        instructors = seed_data["instructors"]
        
        # Create existing class
        existing = Class(
            course_name="Existing Class",
            chapter_topic="Topic",
            date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 0),
            room_id=rooms[0].id,
            instructor_id=instructors[0].id,
        )
        db.add(existing)
        db.commit()
        
        # Check for room conflict with adjacent time (should not conflict)
        conflicts = detect_room_conflicts(
            db=db,
            room_id=rooms[0].id,
            class_date=date(2024, 1, 15),
            start_time=time(11, 0),
            end_time=time(12, 0),
        )
        
        assert len(conflicts) == 0
    
    def test_identical_times_conflict(self, db, seed_data):
        """Class A: 10:00-11:30, Class B: 10:00-11:30 → CONFLICT"""
        rooms = seed_data["rooms"]
        instructors = seed_data["instructors"]
        
        # Create existing class
        existing = Class(
            course_name="Existing Class",
            chapter_topic="Topic",
            date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
            room_id=rooms[0].id,
            instructor_id=instructors[0].id,
        )
        db.add(existing)
        db.commit()
        
        # Check for room conflict with identical time
        conflicts = detect_room_conflicts(
            db=db,
            room_id=rooms[0].id,
            class_date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
        )
        
        assert len(conflicts) == 1


class TestRoomConflicts:
    """Test room conflict detection."""
    
    def test_different_room_no_conflict(self, db, seed_data):
        """Same time, different room → NO CONFLICT"""
        rooms = seed_data["rooms"]
        instructors = seed_data["instructors"]
        
        existing = Class(
            course_name="Existing Class",
            chapter_topic="Topic",
            date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
            room_id=rooms[0].id,
            instructor_id=instructors[0].id,
        )
        db.add(existing)
        db.commit()
        
        conflicts = detect_room_conflicts(
            db=db,
            room_id=rooms[1].id,  # Different room
            class_date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
        )
        
        assert len(conflicts) == 0
    
    def test_different_date_no_conflict(self, db, seed_data):
        """Same room, same time, different date → NO CONFLICT"""
        rooms = seed_data["rooms"]
        instructors = seed_data["instructors"]
        
        existing = Class(
            course_name="Existing Class",
            chapter_topic="Topic",
            date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
            room_id=rooms[0].id,
            instructor_id=instructors[0].id,
        )
        db.add(existing)
        db.commit()
        
        conflicts = detect_room_conflicts(
            db=db,
            room_id=rooms[0].id,
            class_date=date(2024, 1, 16),  # Different date
            start_time=time(10, 0),
            end_time=time(11, 30),
        )
        
        assert len(conflicts) == 0


class TestInstructorConflicts:
    """Test instructor conflict detection."""
    
    def test_instructor_conflict(self, db, seed_data):
        """Same instructor, overlapping time → CONFLICT"""
        rooms = seed_data["rooms"]
        instructors = seed_data["instructors"]
        
        existing = Class(
            course_name="Existing Class",
            chapter_topic="Topic",
            date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
            room_id=rooms[0].id,
            instructor_id=instructors[0].id,
        )
        db.add(existing)
        db.commit()
        
        conflicts = detect_instructor_conflicts(
            db=db,
            instructor_id=instructors[0].id,
            class_date=date(2024, 1, 15),
            start_time=time(11, 0),
            end_time=time(12, 30),
        )
        
        assert len(conflicts) == 1
        assert conflicts[0].type == "instructor"
    
    def test_different_instructor_no_conflict(self, db, seed_data):
        """Different instructor, same time → NO CONFLICT"""
        rooms = seed_data["rooms"]
        instructors = seed_data["instructors"]
        
        existing = Class(
            course_name="Existing Class",
            chapter_topic="Topic",
            date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
            room_id=rooms[0].id,
            instructor_id=instructors[0].id,
        )
        db.add(existing)
        db.commit()
        
        conflicts = detect_instructor_conflicts(
            db=db,
            instructor_id=instructors[1].id,  # Different instructor
            class_date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
        )
        
        assert len(conflicts) == 0


class TestStudentConflicts:
    """Test student conflict detection."""
    
    def test_student_conflict(self, db, seed_data):
        """Student enrolled in overlapping class → CONFLICT"""
        rooms = seed_data["rooms"]
        instructors = seed_data["instructors"]
        students = seed_data["students"]
        
        existing = Class(
            course_name="Existing Class",
            chapter_topic="Topic",
            date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
            room_id=rooms[0].id,
            instructor_id=instructors[0].id,
        )
        db.add(existing)
        db.flush()
        
        # Enroll student
        enrollment = ClassEnrollment(class_id=existing.id, student_id=students[0].id)
        db.add(enrollment)
        db.commit()
        
        conflicts = detect_student_conflicts(
            db=db,
            student_ids=[students[0].id],
            class_date=date(2024, 1, 15),
            start_time=time(11, 0),
            end_time=time(12, 30),
        )
        
        assert len(conflicts) == 1
        assert conflicts[0].type == "student"
    
    def test_empty_students_no_conflict(self, db, seed_data):
        """Empty student list → NO CONFLICT"""
        conflicts = detect_student_conflicts(
            db=db,
            student_ids=[],
            class_date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
        )
        
        assert len(conflicts) == 0


class TestCapacityConflicts:
    """Test room capacity conflict detection."""
    
    def test_over_capacity_conflict(self, db, seed_data):
        """More students than room capacity → CONFLICT"""
        rooms = seed_data["rooms"]
        small_room = rooms[2]  # capacity=5
        
        conflicts = detect_capacity_conflict(
            db=db,
            room_id=small_room.id,
            student_count=10,
        )
        
        assert len(conflicts) == 1
        assert conflicts[0].type == "capacity"
    
    def test_within_capacity_no_conflict(self, db, seed_data):
        """Students within room capacity → NO CONFLICT"""
        rooms = seed_data["rooms"]
        
        conflicts = detect_capacity_conflict(
            db=db,
            room_id=rooms[0].id,  # capacity=30
            student_count=25,
        )
        
        assert len(conflicts) == 0


class TestMultipleConflicts:
    """Test that multiple conflicts are detected simultaneously."""
    
    def test_multiple_conflicts_detected(self, db, seed_data):
        """Should detect room, instructor, and student conflicts together."""
        rooms = seed_data["rooms"]
        instructors = seed_data["instructors"]
        students = seed_data["students"]
        
        existing = Class(
            course_name="Existing Class",
            chapter_topic="Topic",
            date=date(2024, 1, 15),
            start_time=time(10, 0),
            end_time=time(11, 30),
            room_id=rooms[0].id,
            instructor_id=instructors[0].id,
        )
        db.add(existing)
        db.flush()
        
        enrollment = ClassEnrollment(class_id=existing.id, student_id=students[0].id)
        db.add(enrollment)
        db.commit()
        
        # Try to create a class that conflicts on all fronts
        conflicts = detect_conflicts(
            db=db,
            room_id=rooms[0].id,  # Same room
            instructor_id=instructors[0].id,  # Same instructor
            student_ids=[students[0].id],  # Same student
            class_date=date(2024, 1, 15),
            start_time=time(10, 30),
            end_time=time(12, 0),
        )
        
        # Should have room, instructor, and student conflicts
        conflict_types = {c.type for c in conflicts}
        assert "room" in conflict_types
        assert "instructor" in conflict_types
        assert "student" in conflict_types

