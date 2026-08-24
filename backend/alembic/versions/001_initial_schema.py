"""Initial TrafficIQ Schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-24 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. segment_history table
    op.create_table(
        'segment_history',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('segment_id', sa.String(), nullable=False),
        sa.Column('road_name', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('hour', sa.Integer(), nullable=False),
        sa.Column('minute', sa.Integer(), nullable=False),
        sa.Column('current_speed', sa.Float(), nullable=False),
        sa.Column('freeflow_speed', sa.Float(), nullable=False),
        sa.Column('congestion', sa.Float(), nullable=False),
        sa.Column('incident_flag', sa.Integer(), server_default='0')
    )
    op.create_index('idx_segment_time', 'segment_history', ['segment_id', 'day_of_week', 'hour'])
    op.create_index('idx_segment_timestamp', 'segment_history', ['timestamp'])

    # 2. forecast_eval_logs table
    op.create_table(
        'forecast_eval_logs',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('segment_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('horizon_minutes', sa.Integer(), nullable=False),
        sa.Column('actual_congestion', sa.Float(), nullable=False),
        sa.Column('chronos_p10', sa.Float(), nullable=False),
        sa.Column('chronos_p50', sa.Float(), nullable=False),
        sa.Column('chronos_p90', sa.Float(), nullable=False),
        sa.Column('baseline_pred', sa.Float(), nullable=False)
    )
    op.create_index('idx_eval_timestamp', 'forecast_eval_logs', ['timestamp'])

    # 3. alert_cooldowns table
    op.create_table(
        'alert_cooldowns',
        sa.Column('alert_key', sa.String(), primary_key=True),
        sa.Column('last_sent_at', sa.DateTime(), nullable=False)
    )

def downgrade() -> None:
    op.drop_table('alert_cooldowns')
    op.drop_table('forecast_eval_logs')
    op.drop_table('segment_history')
