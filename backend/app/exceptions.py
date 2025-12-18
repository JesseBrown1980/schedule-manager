from typing import Any, Optional
from datetime import date, time


class AppException(Exception):
    status_code: int = 500
    error_code: str = "internal_error"
    
    def __init__(
        self,
        message: str,
        details: Optional[dict[str, Any]] = None,
        error_code: Optional[str] = None,
    ):
        self.message = message
        self.details = details or {}
        if error_code:
            self.error_code = error_code
        super().__init__(message)
    
    def to_dict(self) -> dict[str, Any]:
        response = {
            "error": self.error_code,
            "message": self.message,
        }
        if self.details:
            response["details"] = self.details
        return response


class ValidationError(AppException):
    status_code = 400
    error_code = "validation_error"
    
    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        invalid_values: Optional[list] = None,
        **kwargs,
    ):
        details = {}
        if field:
            details["field"] = field
        if invalid_values:
            details["invalid_values"] = invalid_values
        super().__init__(message, details=details, **kwargs)


class EntityNotFoundError(ValidationError):
    error_code = "entity_not_found"
    
    def __init__(
        self,
        entity_type: str,
        entity_id: Optional[int] = None,
        entity_ids: Optional[list[int]] = None,
    ):
        if entity_ids:
            message = f"{entity_type}(s) not found: {sorted(entity_ids)}"
            details = {"entity_type": entity_type, "missing_ids": sorted(entity_ids)}
        else:
            message = f"{entity_type} with ID {entity_id} not found"
            details = {"entity_type": entity_type, "id": entity_id}
        
        super().__init__(message, details=details)


class NotFoundError(AppException):
    status_code = 404
    error_code = "not_found"
    
    def __init__(
        self,
        resource_type: str,
        resource_id: int,
    ):
        message = f"{resource_type} with ID {resource_id} not found"
        details = {"resource_type": resource_type, "id": resource_id}
        super().__init__(message, details=details)


class ConflictError(AppException):
    status_code = 409
    error_code = "conflict"
    
    def __init__(
        self,
        message: str = "Cannot save class due to scheduling conflicts",
        conflicts: Optional[list[dict]] = None,
    ):
        details = {"conflicts": conflicts or []}
        super().__init__(message, details=details)
    
    def to_dict(self) -> dict[str, Any]:
        return {
            "error": self.error_code,
            "message": self.message,
            "conflicts": self.details.get("conflicts", []),
        }


class ServerError(AppException):
    status_code = 500
    error_code = "internal_server_error"
    
    def __init__(
        self,
        message: str = "An unexpected error occurred",
        error_id: Optional[str] = None,
        original_error: Optional[Exception] = None,
    ):
        details = {}
        if error_id:
            details["error_id"] = error_id
        self.original_error = original_error
        super().__init__(message, details=details)


class RoomConflictError(ConflictError):
    
    def __init__(
        self,
        room_name: str,
        existing_course: str,
        existing_time: str,
        suggested_rooms: Optional[list[dict]] = None,
    ):
        conflicts = [{
            "type": "room",
            "message": f"Room {room_name} is already booked for {existing_course}",
            "suggestion": self._build_suggestion(suggested_rooms),
        }]
        super().__init__(conflicts=conflicts)
    
    @staticmethod
    def _build_suggestion(suggested_rooms: Optional[list[dict]]) -> str:
        if not suggested_rooms:
            return "Try selecting a different room or time slot"
        room_names = [r["name"] for r in suggested_rooms[:3]]
        return f"Available rooms: {', '.join(room_names)}"


class InstructorConflictError(ConflictError):
    
    def __init__(
        self,
        instructor_name: str,
        existing_course: str,
        existing_time: str,
    ):
        conflicts = [{
            "type": "instructor",
            "message": f"Instructor {instructor_name} is already teaching {existing_course}",
            "suggestion": "Try selecting a different instructor or time slot",
        }]
        super().__init__(conflicts=conflicts)


class StudentConflictError(ConflictError):
    pass


class CapacityConflictError(ConflictError):
    
    def __init__(
        self,
        room_name: str,
        capacity: int,
        student_count: int,
        suggested_rooms: Optional[list[dict]] = None,
    ):
        conflicts = [{
            "type": "capacity",
            "message": f"Room {room_name} has capacity {capacity}, but {student_count} students enrolled",
            "suggestion": self._build_suggestion(suggested_rooms, student_count),
        }]
        super().__init__(conflicts=conflicts)
    
    @staticmethod
    def _build_suggestion(suggested_rooms: Optional[list[dict]], student_count: int) -> str:
        if not suggested_rooms:
            return f"Select a room with capacity >= {student_count} or reduce enrollment"
        suitable = [r for r in suggested_rooms if r.get("capacity", 0) >= student_count]
        if suitable:
            room_names = [f"{r['name']} (cap: {r['capacity']})" for r in suitable[:3]]
            return f"Rooms with sufficient capacity: {', '.join(room_names)}"
        return f"No available rooms with capacity >= {student_count}. Reduce enrollment."
