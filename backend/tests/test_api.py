"""Tests for API endpoints."""
from datetime import date, time

import pytest


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_root_endpoint(self, client):
        """Root endpoint should return OK status."""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
    
    def test_health_endpoint(self, client):
        """Health endpoint should return healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestLookupEndpoints:
    """Test lookup API endpoints."""
    
    def test_get_rooms(self, client, seed_data):
        """Should return all rooms."""
        response = client.get("/rooms")
        assert response.status_code == 200
        rooms = response.json()
        assert len(rooms) == 3
        assert all("name" in r and "capacity" in r for r in rooms)
    
    def test_get_instructors(self, client, seed_data):
        """Should return all instructors."""
        response = client.get("/instructors")
        assert response.status_code == 200
        instructors = response.json()
        assert len(instructors) == 2
    
    def test_get_students(self, client, seed_data):
        """Should return all students."""
        response = client.get("/students")
        assert response.status_code == 200
        students = response.json()
        assert len(students) == 10


class TestClassCRUD:
    """Test class CRUD operations."""
    
    def test_create_class(self, client, seed_data):
        """Should create a new class."""
        response = client.post("/classes", json={
            "course_name": "Test Course",
            "chapter_topic": "Test Topic",
            "date": "2024-01-15",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
            "room_id": 1,
            "instructor_id": 1,
            "student_ids": [1, 2, 3],
        })
        
        assert response.status_code == 201
        data = response.json()
        assert data["course_name"] == "Test Course"
        assert len(data["students"]) == 3
    
    def test_get_classes_by_date(self, client, seed_data):
        """Should return classes for a specific date."""
        # First create a class
        client.post("/classes", json={
            "course_name": "Test Course",
            "chapter_topic": "Test Topic",
            "date": "2024-01-15",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
            "room_id": 1,
            "instructor_id": 1,
            "student_ids": [],
        })
        
        response = client.get("/classes?date=2024-01-15")
        assert response.status_code == 200
        classes = response.json()
        assert len(classes) == 1
    
    def test_update_class(self, client, seed_data):
        """Should update an existing class."""
        # Create
        create_response = client.post("/classes", json={
            "course_name": "Original Name",
            "chapter_topic": "Original Topic",
            "date": "2024-01-15",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
            "room_id": 1,
            "instructor_id": 1,
            "student_ids": [],
        })
        class_id = create_response.json()["id"]
        
        # Update
        update_response = client.put(f"/classes/{class_id}", json={
            "course_name": "Updated Name",
            "chapter_topic": "Updated Topic",
            "date": "2024-01-15",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
            "room_id": 1,
            "instructor_id": 1,
            "student_ids": [1],
        })
        
        assert update_response.status_code == 200
        assert update_response.json()["course_name"] == "Updated Name"
        assert len(update_response.json()["students"]) == 1
    
    def test_delete_class(self, client, seed_data):
        """Should delete a class."""
        # Create
        create_response = client.post("/classes", json={
            "course_name": "To Delete",
            "chapter_topic": "Topic",
            "date": "2024-01-15",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
            "room_id": 1,
            "instructor_id": 1,
            "student_ids": [],
        })
        class_id = create_response.json()["id"]
        
        # Delete
        delete_response = client.delete(f"/classes/{class_id}")
        assert delete_response.status_code == 204
        
        # Verify deleted
        get_response = client.get(f"/classes/{class_id}")
        assert get_response.status_code == 404


class TestConflictAPI:
    """Test conflict detection via API."""
    
    def test_room_conflict_returns_409(self, client, seed_data):
        """Creating a class with room conflict should return 409."""
        # Create first class
        client.post("/classes", json={
            "course_name": "First Class",
            "chapter_topic": "Topic",
            "date": "2024-01-15",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
            "room_id": 1,
            "instructor_id": 1,
            "student_ids": [],
        })
        
        # Try to create conflicting class
        response = client.post("/classes", json={
            "course_name": "Conflicting Class",
            "chapter_topic": "Topic",
            "date": "2024-01-15",
            "start_time": "11:00:00",  # Overlaps
            "end_time": "12:30:00",
            "room_id": 1,  # Same room
            "instructor_id": 2,  # Different instructor
            "student_ids": [],
        })
        
        assert response.status_code == 409
        detail = response.json()["detail"]
        assert detail["error"] == "conflict"
        assert any(c["type"] == "room" for c in detail["conflicts"])
    
    def test_adjacent_times_no_conflict(self, client, seed_data):
        """Adjacent times should not conflict."""
        # Create first class
        client.post("/classes", json={
            "course_name": "First Class",
            "chapter_topic": "Topic",
            "date": "2024-01-15",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "room_id": 1,
            "instructor_id": 1,
            "student_ids": [],
        })
        
        # Create adjacent class (should succeed)
        response = client.post("/classes", json={
            "course_name": "Adjacent Class",
            "chapter_topic": "Topic",
            "date": "2024-01-15",
            "start_time": "11:00:00",  # Starts exactly when first ends
            "end_time": "12:00:00",
            "room_id": 1,  # Same room
            "instructor_id": 1,  # Same instructor
            "student_ids": [],
        })
        
        assert response.status_code == 201
    
    def test_capacity_conflict_returns_409(self, client, seed_data):
        """Creating a class with too many students should return 409."""
        response = client.post("/classes", json={
            "course_name": "Overcrowded Class",
            "chapter_topic": "Topic",
            "date": "2024-01-15",
            "start_time": "10:00:00",
            "end_time": "11:30:00",
            "room_id": 3,  # Small Room with capacity=5
            "instructor_id": 1,
            "student_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],  # 10 students
        })
        
        assert response.status_code == 409
        detail = response.json()["detail"]
        assert any(c["type"] == "capacity" for c in detail["conflicts"])

