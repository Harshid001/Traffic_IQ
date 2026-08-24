import sys
import os
import types
from pathlib import Path

# Ensure project root and backend directory are on sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

for _p in [str(root_dir), str(backend_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    import backend
except ImportError:
    backend_pkg = types.ModuleType("backend")
    backend_pkg.__path__ = [str(backend_dir)]
    sys.modules["backend"] = backend_pkg

from backend.main import app

# Export for Vercel serverless runtime
app = app
