"""Initial schema with all tables and indexes.

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create rooms table
    op.create_table(
        'rooms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_rooms_id'), 'rooms', ['id'], unique=False)

    # Create instructors table
    op.create_table(
        'instructors',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_instructors_id'), 'instructors', ['id'], unique=False)

    # Create students table
    op.create_table(
        'students',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_students_id'), 'students', ['id'], unique=False)

    # Create classes table
    op.create_table(
        'classes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('course_name', sa.String(length=200), nullable=False),
        sa.Column('chapter_topic', sa.String(length=200), nullable=False),
        sa.Column('room_id', sa.Integer(), nullable=False),
        sa.Column('instructor_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['instructor_id'], ['instructors.id'], ),
        sa.ForeignKeyConstraint(['room_id'], ['rooms.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_classes_id'), 'classes', ['id'], unique=False)
    op.create_index('ix_classes_date_room', 'classes', ['date', 'room_id'], unique=False)
    op.create_index('ix_classes_date_instructor', 'classes', ['date', 'instructor_id'], unique=False)
    op.create_index('ix_classes_date_times', 'classes', ['date', 'start_time', 'end_time'], unique=False)

    # Create class_enrollments table
    op.create_table(
        'class_enrollments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('class_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_class_enrollments_id'), 'class_enrollments', ['id'], unique=False)
    op.create_index('ix_enrollments_student_class', 'class_enrollments', ['student_id', 'class_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_enrollments_student_class', table_name='class_enrollments')
    op.drop_index(op.f('ix_class_enrollments_id'), table_name='class_enrollments')
    op.drop_table('class_enrollments')
    
    op.drop_index('ix_classes_date_times', table_name='classes')
    op.drop_index('ix_classes_date_instructor', table_name='classes')
    op.drop_index('ix_classes_date_room', table_name='classes')
    op.drop_index(op.f('ix_classes_id'), table_name='classes')
    op.drop_table('classes')
    
    op.drop_index(op.f('ix_students_id'), table_name='students')
    op.drop_table('students')
    
    op.drop_index(op.f('ix_instructors_id'), table_name='instructors')
    op.drop_table('instructors')
    
    op.drop_index(op.f('ix_rooms_id'), table_name='rooms')
    op.drop_table('rooms')

