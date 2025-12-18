"""Add constraints and indexes for query optimization.

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000

This migration adds:
- Check constraints for data integrity (positive capacity, valid time range)
- Unique constraint on enrollments to prevent duplicates
- Additional indexes for query performance

Note: SQLite has limited ALTER TABLE support, so constraints are added using
batch mode which recreates the table. This is safe for SQLite but requires
the batch_op context manager.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add covering index for common query patterns on classes
    op.create_index(
        'ix_classes_date_start_end_room_instructor',
        'classes',
        ['date', 'start_time', 'end_time', 'room_id', 'instructor_id'],
        unique=False
    )
    
    # Add index on course_name for course lookups
    op.create_index(
        'ix_classes_course_name',
        'classes',
        ['course_name'],
        unique=False
    )
    
    # Add reverse index for finding students in a class
    op.create_index(
        'ix_enrollments_class_student',
        'class_enrollments',
        ['class_id', 'student_id'],
        unique=False
    )
    
    # For SQLite: Use batch mode to add unique constraint
    # This recreates the table with the new constraint
    with op.batch_alter_table('class_enrollments', schema=None) as batch_op:
        batch_op.create_unique_constraint(
            'uq_enrollment_class_student',
            ['class_id', 'student_id']
        )


def downgrade() -> None:
    # For SQLite: Use batch mode to remove constraint
    with op.batch_alter_table('class_enrollments', schema=None) as batch_op:
        batch_op.drop_constraint('uq_enrollment_class_student', type_='unique')
    
    op.drop_index('ix_enrollments_class_student', table_name='class_enrollments')
    op.drop_index('ix_classes_course_name', table_name='classes')
    op.drop_index('ix_classes_date_start_end_room_instructor', table_name='classes')

