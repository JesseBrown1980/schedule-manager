"""
Seed script to populate the database with initial data.

Run with: python -m app.seed
"""
from datetime import date, time

from .db import SessionLocal, engine, Base
from .models import Class, ClassEnrollment, Instructor, Room, Student


def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        if db.query(Room).first():
            print("Database already seeded. Skipping...")
            return
        
        # ============== Rooms ==============
        rooms = [
            Room(name="Room 6-205", capacity=30),
            Room(name="Room 6-206", capacity=25),
            Room(name="Room 5-101", capacity=40),
            Room(name="Lab A", capacity=20),
            Room(name="Auditorium", capacity=100),
        ]
        db.add_all(rooms)
        db.flush()
        print(f"Created {len(rooms)} rooms")
        
        # ============== Instructors ==============
        instructors = [
            Instructor(name="Dr. Sarah Johnson"),
            Instructor(name="Prof. Michael Chen"),
            Instructor(name="Dr. Emily Williams"),
            Instructor(name="Prof. David Brown"),
            Instructor(name="Dr. Lisa Anderson"),
        ]
        db.add_all(instructors)
        db.flush()
        print(f"Created {len(instructors)} instructors")
        
        # ============== Students ==============
        students = [
            Student(name="Emma Thompson"),
            Student(name="James Wilson"),
            Student(name="Olivia Davis"),
            Student(name="Noah Martinez"),
            Student(name="Ava Garcia"),
            Student(name="Liam Rodriguez"),
            Student(name="Sophia Lee"),
            Student(name="Mason Taylor"),
            Student(name="Isabella Brown"),
            Student(name="Ethan Anderson"),
            Student(name="Mia Johnson"),
            Student(name="Lucas White"),
            Student(name="Charlotte Harris"),
            Student(name="Alexander Clark"),
            Student(name="Amelia Lewis"),
        ]
        db.add_all(students)
        db.flush()
        print(f"Created {len(students)} students")
        
        # ============== Classes ==============
        # Use dates relative to a sample week (January 2024)
        day1 = date(2024, 1, 22)  # Monday
        day2 = date(2024, 1, 23)  # Tuesday
        day3 = date(2024, 1, 24)  # Wednesday
        
        classes_data = [
            # Day 1 - Monday
            {
                "course_name": "Mathematics",
                "chapter_topic": "Chapter 5: Calculus Fundamentals",
                "date": day1,
                "start_time": time(9, 0),
                "end_time": time(10, 30),
                "room": rooms[0],  # Room 6-205
                "instructor": instructors[0],  # Dr. Sarah Johnson
                "students": students[0:8],  # 8 students
            },
            {
                "course_name": "Physics",
                "chapter_topic": "Introduction to Mechanics",
                "date": day1,
                "start_time": time(11, 0),
                "end_time": time(12, 30),
                "room": rooms[0],  # Room 6-205
                "instructor": instructors[1],  # Prof. Michael Chen
                "students": students[3:10],  # 7 students
            },
            {
                "course_name": "Chemistry",
                "chapter_topic": "Organic Chemistry Basics",
                "date": day1,
                "start_time": time(14, 0),
                "end_time": time(15, 30),
                "room": rooms[1],  # Room 6-206
                "instructor": instructors[2],  # Dr. Emily Williams
                "students": students[5:12],  # 7 students
            },
            
            # Day 2 - Tuesday
            {
                "course_name": "Computer Science",
                "chapter_topic": "Data Structures: Trees and Graphs",
                "date": day2,
                "start_time": time(9, 0),
                "end_time": time(10, 30),
                "room": rooms[3],  # Lab A
                "instructor": instructors[3],  # Prof. David Brown
                "students": students[0:6],  # 6 students
            },
            {
                "course_name": "Biology",
                "chapter_topic": "Cell Division and Mitosis",
                "date": day2,
                "start_time": time(11, 0),
                "end_time": time(12, 30),
                "room": rooms[2],  # Room 5-101
                "instructor": instructors[4],  # Dr. Lisa Anderson
                "students": students[8:15],  # 7 students
            },
            {
                "course_name": "Mathematics",
                "chapter_topic": "Chapter 6: Integration",
                "date": day2,
                "start_time": time(14, 0),
                "end_time": time(15, 30),
                "room": rooms[0],  # Room 6-205
                "instructor": instructors[0],  # Dr. Sarah Johnson
                "students": students[0:8],  # 8 students
            },
            
            # Day 3 - Wednesday
            {
                "course_name": "Physics",
                "chapter_topic": "Thermodynamics",
                "date": day3,
                "start_time": time(9, 0),
                "end_time": time(10, 30),
                "room": rooms[2],  # Room 5-101
                "instructor": instructors[1],  # Prof. Michael Chen
                "students": students[2:10],  # 8 students
            },
            {
                "course_name": "English Literature",
                "chapter_topic": "Shakespeare's Hamlet Analysis",
                "date": day3,
                "start_time": time(11, 0),
                "end_time": time(12, 30),
                "room": rooms[4],  # Auditorium
                "instructor": instructors[2],  # Dr. Emily Williams
                "students": students[0:15],  # All 15 students
            },
            {
                "course_name": "Computer Science",
                "chapter_topic": "Algorithm Complexity",
                "date": day3,
                "start_time": time(14, 0),
                "end_time": time(15, 30),
                "room": rooms[3],  # Lab A
                "instructor": instructors[3],  # Prof. David Brown
                "students": students[0:6],  # 6 students
            },
        ]
        
        for class_data in classes_data:
            new_class = Class(
                course_name=class_data["course_name"],
                chapter_topic=class_data["chapter_topic"],
                date=class_data["date"],
                start_time=class_data["start_time"],
                end_time=class_data["end_time"],
                room_id=class_data["room"].id,
                instructor_id=class_data["instructor"].id,
            )
            db.add(new_class)
            db.flush()
            
            # Add enrollments
            for student in class_data["students"]:
                enrollment = ClassEnrollment(class_id=new_class.id, student_id=student.id)
                db.add(enrollment)
        
        db.commit()
        print(f"Created {len(classes_data)} classes with enrollments")
        
        # ============== Conflict Scenarios (documented) ==============
        print("\n--- Conflict Scenarios for Testing ---")
        print("1. Room Conflict: Try to create a class in Room 6-205 on Monday 9:00-10:30")
        print("   (Mathematics is already scheduled)")
        print("2. Instructor Conflict: Try to schedule Dr. Sarah Johnson on Tuesday 14:00-15:30")
        print("   (She's already teaching Mathematics)")
        print("3. Student Conflict: Try to enroll Emma Thompson in a class on Monday 9:00-10:30")
        print("   (She's already enrolled in Mathematics)")
        print("4. Capacity Conflict: Try to enroll 25+ students in Lab A (capacity: 20)")
        
        print("\nDatabase seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

