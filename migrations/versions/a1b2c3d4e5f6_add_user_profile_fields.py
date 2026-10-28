"""add user profile fields

Revision ID: a1b2c3d4e5f6
Revises: 09ba4f911d29
Create Date: 2026-10-25 11:04:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '61fc594c85d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('first_name', sa.String(length=100), nullable=False, server_default=''))
    op.add_column('users', sa.Column('last_name', sa.String(length=100), nullable=False, server_default=''))
    op.add_column('users', sa.Column('role', sa.String(length=50), nullable=False, server_default=''))
    op.alter_column('users', 'first_name', existing_type=sa.String(length=100), nullable=False, server_default=None)
    op.alter_column('users', 'last_name', existing_type=sa.String(length=100), nullable=False, server_default=None)
    op.alter_column('users', 'role', existing_type=sa.String(length=50), nullable=False, server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'role')
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')
