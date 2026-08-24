import pytest
import os
from backend.database.db import init_db
from backend.database.seed_data import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """
    Session-level fixture that automatically runs before any pytest test executes.
    Ensures SQLite schema is created and populated with baseline sample history.
    """
    init_db()
    seed_database()
