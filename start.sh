#!/bin/bash

echo "🚀 Starting AI Agent Website..."
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env with your API keys!"
fi

# Start backend
echo ""
echo "🔧 Starting FastAPI Backend..."
cd backend



# Start backend in background
python main.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) at http://localhost:8000"

cd ..

# Start frontend
echo ""
echo "🎨 Starting React Frontend..."
cd frontend

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend
npm start

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
