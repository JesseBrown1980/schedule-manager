# Class Schedule Manager

A full-stack schedule management system for educational institutions with conflict detection. Built with React + TypeScript frontend and FastAPI + SQLite backend.

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **npm** or **yarn**

## Getting Started

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Initialize Database and Seed Data

```bash
# Still in backend directory
# The database will be created automatically on first run
# Run the seed script to populate initial data
python -m app.seed
```

### 3. Start Backend Server

```bash
# Run the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

- **API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs (Swagger UI)

### 4. Setup and Start Frontend

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173

## Running Tests

```bash
cd backend
pytest -v
```
