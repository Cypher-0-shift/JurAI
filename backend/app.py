import logging
import json
import uuid
import datetime
import os
from typing import Dict, Any, Optional, List

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pymongo.database import Database
from pydantic import BaseModel, EmailStr

import asyncio
from sse_starlette.sse import EventSourceResponse

# --- Project Imports (RENDER SAFE) ---
from backend.database.database import get_database
from backend.features import auth
from backend.features.auth import get_current_user

# --- Pipeline Imports ---
from backend.pipeline.core_pipeline import run_core_pipeline
from backend.pipeline.risk_pipeline import run_risk_pipeline
from backend.pipeline.autofix_pipeline import run_autofix_pipeline
from backend.features.compliance_diff.diff_engine import generate_compliance_diff
from backend.features.compliance_history.history_manager import get_previous_verdict


# --- App Configuration ---
app = FastAPI(title="JurAI Compliance System")

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include external routers
# app.include_router(streaming_router)

# --- Pydantic Request Models ---

class PipelineRequest(BaseModel):
    feature_id: Optional[str] = None
    context_data: Dict[str, Any]

class RiskRequest(BaseModel):
    feature_id: str
    run_id: str

class AutofixRequest(BaseModel):
    feature_id: str
    run_id: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# --- Auth Routes ---

# --- Auth Routes ---

@app.post("/auth/register", status_code=201)
def register(user: UserCreate, db: Database = Depends(get_database)):
    # Check if user exists
    existing_user = db.users.find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Hash password
    hashed_password = auth.get_password_hash(user.password)
    
    # Create User
    user_doc = {
        "username": user.username,
        "email": user.email,
        "password_hash": hashed_password,
        "provider": "local",
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    
    db.users.insert_one(user_doc)
    
    return {"message": "User registered successfully"}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Database = Depends(get_database)):
    # Original Logic
    user = db.users.find_one({"username": form_data.username})
    if not user:
        # Try email
        user = db.users.find_one({"email": form_data.username})
    
    if not user or not auth.verify_password(form_data.password, user.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = datetime.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user["email"] or user["username"]}, # Use unique identifier
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Admin/Test Routes ---

# --- Admin/Test Routes ---

@app.post("/admin/import_verdict")
def import_verdict(
    payload: Dict[str, Any],
    db: Database = Depends(get_database)
):
    run_id = str(uuid.uuid4())
    feature_id = payload.get("feature_id", "unknown_feature")
    
    # Construct the run document
    run_doc = {
        "run_id": run_id,
        "feature_id": feature_id,
        "timestamp": payload.get("timestamp") or datetime.datetime.utcnow().isoformat(),
        "verdict_json": payload.get("verdict"), 
        "agent_trace": None,
        "risk_json": None,
        "autofix_json": None,
        "status": "IMPORTED_VERDICT"
    }
    
    db.compliance_runs.insert_one(run_doc)
    
    return {"run_id": run_id, "feature_id": feature_id}

# --- Pipeline Routes ---

from fastapi import BackgroundTasks

def background_core_task(run_id: str, feature_id: str, context_data: Dict[str, Any]):
    """
    Executes the pipeline in the background and updates storage incrementally.
    """
    # NOTE: Helper function requires valid database connection context, 
    # but we can't easily pass Depends() here. 
    # We will get a fresh connection inside.
    try:
        db = get_database() 
        
        def save_progress(event_type, event_data):
            try:
                # Initialize trace if needed (conceptually) - MongoDB handles field creation on update
                
                # Determine Agent Name
                agent_name = "System"
                if "jury" in event_type:
                    agent_name = "Jury_Primary"
                elif "critic" in event_type:
                    agent_name = "Critic_Reviewer"
                elif "judge" in event_type:
                    agent_name = "Judge"

                # Check if this is a streaming log (insight)
                is_log = event_data.get("is_log", False)
                message = event_data.get("msg", "") or event_data.get("report") or event_data.get("critique") or event_data.get("verdict")
                
                if is_log:
                    # Append log to the specific agent's last trace item
                    # This is tricky in Mongo with arrays. We need to find the specific element.
                    # Simplified: We just push a log entry. 
                    # Complex: We want to associate logs with the "active" step.
                    # For now, let's just push a log event for simplicity and robustness.
                    pass # Skipping complex log nesting for now to ensure stability
                
                # Standard Event - Create New Trace Item
                timestamp = datetime.datetime.utcnow().isoformat()
                
                trace_item = {
                    "agent": agent_name,
                    "step": event_type,
                    "content": str(message)[:200] if message else "", # Preview
                    "timestamp": timestamp,
                    "logs": [],
                    "is_realtime": True
                }
                
                # Append to agent_trace array
                db.compliance_runs.update_one(
                    {"run_id": run_id},
                    {"$push": {"agent_trace": trace_item}}
                )
                
            except Exception as e:
                logger.error(f"Error saving progress: {e}")

        # Run Pipeline
        logger.info(f"Starting Background Pipeline for {run_id}")
        result = run_core_pipeline(context_data, on_event=save_progress)
        
        # Final Save with Complete Result
        db.compliance_runs.update_one(
            {"run_id": run_id},
            {
                "$set": {
                    "verdict_json": result.get("verdict"),
                    "agent_trace": result.get("agent_trace"), # Overwrite with full clean trace
                    "status": "CORE_COMPLETED",
                    "completed_at": datetime.datetime.utcnow().isoformat()
                }
            }
        )
            
    except Exception as e:
        logger.error(f"Background Task Failed: {e}")
        # Update status to FAILED
        try:
            db = get_database()
            db.compliance_runs.update_one(
                {"run_id": run_id},
                {"$set": {"status": "FAILED"}}
            )
        except:
            pass

@app.post("/run/core")
async def trigger_core_pipeline(
    request: PipelineRequest,
    background_tasks: BackgroundTasks,
    db: Database = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Triggers Pipeline A (Core) asynchronously.
    Returns run_id immediately.
    """
    run_id = str(uuid.uuid4())
    # Generate feature_id if not provided, or use provided
    feature_id = request.feature_id or f"feat_{run_id[:8]}"
    
    # 1. Create Initial Record
    initial_doc = {
        "run_id": run_id,
        "feature_id": feature_id,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "verdict_json": None,
        "agent_trace": [],
        "risk_json": None,
        "autofix_json": None,
        "status": "IN_PROGRESS"
    }
    
    db.compliance_runs.insert_one(initial_doc)
    
    # 2. Add to Background Tasks
    background_tasks.add_task(background_core_task, run_id, feature_id, request.context_data)
    
    return {
        "run_id": run_id,
        "feature_id": feature_id,
        "status": "IN_PROGRESS",
        "message": "Pipeline started in background"
    }

@app.post("/run/risk")
def trigger_risk_pipeline(
    request: RiskRequest,
    db: Database = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Triggers Pipeline B (Risk). Publicly accessible.
    """
    # Verify Run exists
    run_record = db.compliance_runs.find_one({"run_id": request.run_id})
    
    if not run_record:
        raise HTTPException(status_code=404, detail="Run ID not found")
        
    try:
        result = run_risk_pipeline(
            feature_id=request.feature_id, 
            run_id=request.run_id,
            verdict_data=run_record.get("verdict_json")
        )
        
        # Update Record
        db.compliance_runs.update_one(
            {"run_id": request.run_id},
            {
                "$set": {
                    "risk_json": result.get("risk_assessment"),
                    "status": "RISK_COMPLETED"
                }
            }
        )
        
        return result
    except Exception as e:
        logger.error(f"Risk Pipeline failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run/autofix")
def trigger_autofix_pipeline(
    request: AutofixRequest,
    db: Database = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Triggers Pipeline C (Auto-fix). Publicly accessible.
    """
    run_record = db.compliance_runs.find_one({"run_id": request.run_id})
    
    if not run_record:
        raise HTTPException(status_code=404, detail="Run ID not found")

    # --- CACHING STRATEGY ---
    if run_record.get("autofix_json"):
        logger.info(f"Autofix Cache Hit for {request.run_id}")
        return {"auto_fix": run_record["autofix_json"]}
        
    try:
        result = run_autofix_pipeline(
            feature_id=request.feature_id,
            run_id=request.run_id,
            verdict_data=run_record.get("verdict_json"),
            risk_data=run_record.get("risk_json")
        )
        
        # Update Record
        db.compliance_runs.update_one(
            {"run_id": request.run_id},
            {
                "$set": {
                    "autofix_json": result.get("auto_fix"),
                    "status": "AUTOFIX_COMPLETED"
                }
            }
        )
        
        return result
    except Exception as e:
        logger.error(f"Autofix Pipeline failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/{feature_id}/{run_id}")
def get_run_results(
    feature_id: str, 
    run_id: str,
    db: Database = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    """
    Fetch full results from DB. Publicly accessible.
    """
    run_record = db.compliance_runs.find_one({"run_id": run_id, "feature_id": feature_id})
    
    if not run_record:
        raise HTTPException(status_code=404, detail="Result not found")
    
    # helper to process _id if returned, though we select specific fields or rely on json default
    if "_id" in run_record:
        del run_record["_id"]
        
    return run_record

# --- Streaming Endpoint (Merged from streaming.py) ---

@app.post("/stream/pipeline")
async def stream_pipeline(request: Request):
    """
    SSE Endpoint that runs the full pipeline and streams events.
    Receives JSON body with context_data.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}

    context_data = body
    feature_id = context_data.get("feature_id", "unknown_feature")

    queue = asyncio.Queue()
    
    # Check for client disconnect
    async def cleanup():
        # Logic to cancel tasks if needed
        pass

    # Capture the main event loop to use inside the thread callback
    main_loop = asyncio.get_running_loop()

    def on_event_callback(event_type, data):
        """
        Bridge from Sync (Agent Code) -> Async Queue
        """
        # Use call_soon_threadsafe with the captured main loop
        main_loop.call_soon_threadsafe(queue.put_nowait, {"event": event_type, "data": data})

    async def event_generator():
        # Submit the sync task to thread
        loop = asyncio.get_running_loop()
        yield {"event": "status", "data": "Pipeline Started"}

        # Define the task wrapper
        def run_sync_pipeline():
            try:
                result = run_core_pipeline(context_data, on_event=on_event_callback)
                return result
            except Exception as e:
                logger.error(f"Pipeline Error: {e}")
                raise e

        # Run core pipeline
        core_future = loop.run_in_executor(None, run_sync_pipeline)
        
        core_result = None
        
        while not core_future.done():
            # Wait for queue items OR core completion
            get_task = asyncio.create_task(queue.get())
            
            done, pending = await asyncio.wait(
                [get_task, core_future],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            if get_task in done:
                event = get_task.result()
                yield {"event": event["event"], "data": json.dumps(event["data"])}
            else:
                # Core future finished, cancel the get wait
                get_task.cancel()
        
        # Core is done
        try:
            core_result = await core_future
            
            # --- Persist VERDICT to Storage ---
            try:
                db = get_database()
                run_id = core_result.get("run_id")
                
                # Upsert Logic
                # Use find_one_and_update (upsert=True) or update_one (upsert=True)
                # We need to ensure we set basic fields if it's new
                
                update_doc = {
                    "$set": {
                        "run_id": run_id,
                        "feature_id": core_result.get("feature_id"),
                        "verdict_json": core_result.get("verdict"),
                        "agent_trace": core_result.get("agent_trace"),
                        "status": "CORE_COMPLETED",
                        "completed_at": datetime.datetime.utcnow().isoformat(),
                        "timestamp": datetime.datetime.utcnow().isoformat() # Only update timestamp if new? Overwrite is fine.
                    }
                }
                
                db.compliance_runs.update_one(
                    {"run_id": run_id},
                    update_doc,
                    upsert=True
                )

            except Exception as e:
                logger.error(f"Failed to persist verdict: {e}")

            # Yield Verdict
            yield {"event": "verdict", "data": json.dumps(core_result.get("verdict", {}))}
            
            # 2. RUN PARALLEL TASKS (Risk + Diff)
            yield {"event": "status", "data": "Running Risk & Diff Analysis"}
            
            # Risk Wrapper
            def run_risk():
                return run_risk_pipeline(feature_id, "temp_run_id", verdict_data=core_result.get("verdict", {}))
                
            # Diff Wrapper
            def run_diff():
                prev = get_previous_verdict(feature_id)
                # Call generate_compliance_diff. 
                prev_verdict = prev.get("verdict") if prev else None
                prev_snap = prev.get("laws_snapshot") if prev else None
                curr_snap = core_result.get("laws_snapshot") 
                
                if core_result.get("compliance_diff"):
                    return core_result.get("compliance_diff")
                
                return generate_compliance_diff(
                    previous_verdict=prev_verdict,
                    current_verdict=core_result.get("verdict", {}),
                    previous_laws_snapshot=prev_snap,
                    current_laws_snapshot=curr_snap
                )

            risk_future = loop.run_in_executor(None, run_risk)
            diff_future = loop.run_in_executor(None, run_diff)
            
            # Wait for both
            results = await asyncio.gather(risk_future, diff_future, return_exceptions=True)
            risk_res, diff_res = results
            
            # --- Persist Results to Storage ---
            try:
                db = get_database()
                updates = {}
                
                if not isinstance(risk_res, Exception):
                    updates["risk_json"] = risk_res.get("risk_assessment")
                    updates["status"] = "RISK_COMPLETED" 

                if updates:
                    db.compliance_runs.update_one(
                        {"run_id": core_result.get("run_id")},
                        {"$set": updates}
                    )
            except Exception as e:
                logger.error(f"Failed to persist streaming results: {e}")

            if isinstance(risk_res, Exception):
                logger.error(f"Risk Error: {risk_res}")
                yield {"event": "error", "data": f"Risk Failed: {str(risk_res)}"}
            else:
                yield {"event": "risk", "data": json.dumps(risk_res.get("risk_assessment", {}))}
                
            if isinstance(diff_res, Exception):
                logger.error(f"Diff Error: {diff_res}")
            else:
                yield {"event": "diff", "data": json.dumps(diff_res)}
                 
            yield {"event": "done", "data": json.dumps({
                "message": "Pipeline Complete",
                "run_id": core_result.get("run_id"),
                "feature_id": core_result.get("feature_id")
            })}

        except Exception as e:
            yield {"event": "error", "data": str(e)}

    return EventSourceResponse(event_generator())

# --- Application Entry Point & Port Selection ---
import uvicorn
import socket
import sys

def find_available_port(start_port: int, max_retries: int = 10):
    for port in range(start_port, start_port + max_retries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    return None

if __name__ == "__main__":
    start_port = 8000
    try:
        # Try to find an available port
        port = find_available_port(start_port)
        
        if port:
            logger.info(f"🚀 Starting JurAI Backend on port {port}")
            # Use uvicorn.run directly
            uvicorn.run("app:app", host="127.0.0.1", port=port, reload=True)
        else:
            logger.error(f"❌ Could not find an available port starting from {start_port}")
            sys.exit(1)
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        sys.exit(1)