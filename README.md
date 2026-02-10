# JurAI

Lightweight instructions to run the JurAI project (backend + frontend).

## Overview

- Backend: FastAPI app located in `backend/`. It exposes pipeline endpoints and a streaming SSE endpoint. The app expects a MongoDB connection and some LLM/provider credentials configured via environment variables.
- Frontend: Next.js app located in `frontend/` (dev on port 3000).

## Prerequisites

- Python 3.10+ (Windows: use the `venv` module)
- Node.js 18+ and `npm` (or `pnpm` / `yarn`) for the frontend
- Docker (optional, for containerized backend)
- A MongoDB instance (URI required)

## Backend — Quick start (Windows PowerShell)

1. Open a terminal and create/activate a virtual environment in the `backend` folder:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2. Install Python dependencies:

```powershell
pip install -r requirements.txt
```

3. Create an environment file `backend/.env` with at least the MongoDB URI:

```
MONGODB_URI="your-mongodb-connection-string"
# Add any provider/LLM keys your deployment requires (e.g. OPENAI_API_KEY, GOOGLE_API_KEY, etc.)
```

Notes:
- The backend expects the env file at `backend/.env` and the code reads `MONGODB_URI` (see `backend/database/database.py`).
- The app includes a main entry in `backend/app.py` and will attempt to start on port 8000 (it will probe for an available port starting at 8000).

4. Run the backend:

```powershell
# from backend directory
python app.py
# or directly with uvicorn if preferred
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

5. Verify: Open `http://127.0.0.1:8000/docs` to access the FastAPI interactive docs.

## Frontend — Quick start

1. Open a terminal at the project root or `frontend` folder:

```powershell
cd frontend
npm install
npm run dev
```

2. The Next.js app runs by default on `http://localhost:3000`.

3. The frontend expects the backend to be reachable on `http://localhost:8000` (CORS for `http://localhost:3000` is configured in `backend/app.py`).

## Using the API

- Trigger core (background) pipeline:

  POST `http://127.0.0.1:8000/run/core` with JSON body:

  ```json
  {
    "context_data": { /* pipeline input */ }
  }
  ```

- Streaming endpoint (SSE): POST `http://127.0.0.1:8000/pipeline/run` with JSON body containing `context_data` — the server streams pipeline events.

- Authentication endpoints exist under `/auth` (register/login). See `backend/app.py` for routes.

## Docker (optional)

You can build the backend Docker image using the `backend/Dockerfile`:

```powershell
# from project root
docker build -t jurai-backend -f backend/Dockerfile .
# run (ensure you pass MONGODB_URI)
docker run -e MONGODB_URI="your-mongo-uri" -p 8000:8000 jurai-backend
```

## Troubleshooting

- Mongo connection errors: confirm `MONGODB_URI` is correct and reachable from your machine; the backend raises if not set.
- Port in use: the backend probes for a free port starting at 8000; check console logs.
- Missing provider keys: if using LLM integrations, define required API keys in `backend/.env`.

## Useful file locations

- Backend app: [backend/app.py](backend/app.py)
- Backend requirements: [backend/requirements.txt](backend/requirements.txt)
- Frontend package.json: [frontend/package.json](frontend/package.json)
- Database helper: [backend/database/database.py](backend/database/database.py)

## Next steps

- Configure required LLM/provider environment variables before running production workloads.
- Optionally run the frontend and backend together for end-to-end testing.

If you want, I can:
- add a `backend/.env.example` file with the required env vars,
- create a simple shell/PowerShell script to start both services concurrently,
- or run a smoke test against the running backend.
