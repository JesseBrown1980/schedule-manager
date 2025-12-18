from typing import Generic, Optional, Type, TypeVar

from sqlalchemy.orm import Session

from ..db import Base

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    
    def __init__(self, db: Session, model_class: Type[T]):
        self.db = db
        self.model_class = model_class
    
    def get_by_id(self, entity_id: int) -> Optional[T]:
        return self.db.query(self.model_class).filter(
            self.model_class.id == entity_id
        ).first()
    
    def get_all(self) -> list[T]:
        return self.db.query(self.model_class).all()
    
    def exists(self, entity_id: int) -> bool:
        return self.db.query(
            self.db.query(self.model_class)
            .filter(self.model_class.id == entity_id)
            .exists()
        ).scalar()
    
    def get_existing_ids(self, entity_ids: list[int]) -> set[int]:
        if not entity_ids:
            return set()
        results = self.db.query(self.model_class.id).filter(
            self.model_class.id.in_(entity_ids)
        ).all()
        return {row[0] for row in results}
    
    def add(self, entity: T) -> T:
        self.db.add(entity)
        return entity
    
    def delete(self, entity: T) -> None:
        self.db.delete(entity)
    
    def flush(self) -> None:
        self.db.flush()
    
    def commit(self) -> None:
        self.db.commit()

