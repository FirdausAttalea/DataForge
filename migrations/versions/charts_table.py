"""create charts table

Revision ID: 7f8e9c0a1b2d
Revises: 61fc594c85d4
Create Date: 2026-11-05 03:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7f8e9c0a1b2d'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('charts',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('project_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=120), nullable=False),
    sa.Column('description', sa.String(length=500), nullable=True),
    sa.Column('type', sa.String(length=16), nullable=False),
    sa.Column('sql_query', sa.String(length=20000), nullable=False),
    sa.Column('encodings', sa.JSON(), nullable=False, server_default='{}'),
    sa.Column('options', sa.JSON(), nullable=False, server_default='{}'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint("type IN ('bar', 'line', 'area', 'scatter', 'donut', 'heatmap')", name='ck_charts_type'),
    sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_charts_project_id'), 'charts', ['project_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_charts_project_id'), table_name='charts')
    op.drop_table('charts')
