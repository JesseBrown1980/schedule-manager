"""Pytest fixtures for testing."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app
from app.models import Instructor, Room, Student


# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    """Create a test client with the test database."""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def seed_data(db):
    """Seed basic data for testing."""
    # Create rooms
    rooms = [
        Room(name="Room A", capacity=30),
        Room(name="Room B", capacity=20),
        Room(name="Small Room", capacity=5),
    ]
    db.add_all(rooms)
    
    # Create instructors
    instructors = [
        Instructor(name="Dr. Smith"),
        Instructor(name="Prof. Jones"),
    ]
    db.add_all(instructors)
    
    # Create students
    students = [
        Student(name=f"Student {i}") for i in range(1, 11)
    ]
    db.add_all(students)
    
    db.commit()
    
    return {
        "rooms": rooms,
        "instructors": instructors,
        "students": students,
    }

