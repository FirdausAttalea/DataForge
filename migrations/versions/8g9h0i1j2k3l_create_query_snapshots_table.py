"""create query_snapshots table

Revision ID: 8g9h0i1j2k3l
Revises: 7f8e9c0a1b2d
Create Date: 2026-11-05 07:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8g9h0i1j2k3l'
down_revision: Union[str, Sequence[str], None] = '7f8e9c0a1b2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
        CREATE TABLE IF NOT EXISTS saved_queries (
            id VARCHAR(64) PRIMARY KEY,
            project_id VARCHAR(64) NOT NULL,
            workspace_id VARCHAR(64) NOT NULL,
            name VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            sql TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.create_table('query_snapshots',
    sa.Column('id', sa.String(length=64), nullable=False),
    sa.Column('query_id', sa.String(length=64), nullable=False),
    sa.Column('query_text', sa.String(length=20000), nullable=False),
    sa.Column('limit_value', sa.Integer(), nullable=False, server_default='100'),
    sa.Column('row_count', sa.Integer(), nullable=False),
    sa.Column('snapshot_data', sa.JSON(), nullable=False, server_default='[]'),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['query_id'], ['saved_queries.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_query_snapshots_query_id'), 'query_snapshots', ['query_id'], unique=False)
    op.create_index(op.f('ix_query_snapshots_updated_at'), 'query_snapshots', ['updated_at'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_query_snapshots_updated_at'), table_name='query_snapshots')
    op.drop_index(op.f('ix_query_snapshots_query_id'), table_name='query_snapshots')
    op.drop_table('query_snapshots')
