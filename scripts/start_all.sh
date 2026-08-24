#!/usr/bin/env bash
# TrafficIQ Unified Multi-Service Launcher for Bash / macOS / Linux

echo "=========================================================="
echo "   🚀 Launching TrafficIQ Development Suite (App & API)   "
echo "=========================================================="

python -m uvicorn backend.main:app --host 0.0.0.0 --port 8005 --reload &
BACKEND_PID=$!

npm --prefix mobile run dev &
MOBILE_PID=$!

trap "kill $BACKEND_PID $MOBILE_PID; exit" SIGINT SIGTERM EXIT

echo "✅ All services running in background!"
echo "• Backend API:      http://localhost:8005/docs (PID: $BACKEND_PID)"
echo "• Mobile Cockpit:   http://localhost:5174      (PID: $MOBILE_PID)"
echo "Press Ctrl+C to stop all services."

wait
